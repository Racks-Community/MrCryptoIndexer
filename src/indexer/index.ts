import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";
import { abiMrcrypto } from "./abi-mrcrypto";
import { prisma } from "@/db";
import { metadata } from "./metadata";
import { abiE7L } from "./abi-E7L";

const MRCRYPTO_DEPLOY_BLOCK: bigint = BigInt(25839542 - 1);
const MRCRYPTO_ADDRESS = "0xeF453154766505FEB9dBF0a58E6990fd6eB66969";
const ALCHEMY_URL = process.env.RPC_URL ?? "";

const BLOCKS_PER_QUERY = BigInt(200_000);

const transport = http(ALCHEMY_URL);

const bigIntMax = (...args: bigint[]) => args.reduce((m, e) => (e > m ? e : m));
const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => (e < m ? e : m));

const client = createPublicClient({
  chain: polygon,
  transport,
});

export async function indexerProcess() {
  const currentBlock = await client.getBlockNumber();

  console.log(`Current block number: ${currentBlock}`);

  await indexMrCrypto(currentBlock);

  const E7Ls = await prisma.e7L.findMany();

  for (const e7l of E7Ls) {
    const lastBlockIndexed = e7l.lastBlockIndexed;

    for (
      let block = lastBlockIndexed + 1n;
      block < currentBlock;
      block += BLOCKS_PER_QUERY - BigInt(1)
    ) {
      const filter = await client.createContractEventFilter({
        abi: abiE7L,
        address: e7l.contractAddress as `0x${string}`,
        eventName: "Link",
        fromBlock: block,
        toBlock: block + BLOCKS_PER_QUERY - BigInt(1),
      });

      const logs = await client.getFilterLogs({ filter });

      for (let log of logs) {
        const e7lTokenId = Number(log.args.tokenId);
        const mrcryptoTokenId = Number(log.args.parentTokenId);
        const block = log.blockNumber ?? BigInt(0);

        const uri = await client.readContract({
          abi: abiE7L,
          functionName: "tokenURI",
          address: e7l.contractAddress as `0x${string}`,
          args: [BigInt(e7lTokenId)],
        })

        const metadata = await fetch(uri).then((res) => res.json());

        const image = metadata.image as string;

        console.log(`E7L ${e7lTokenId.toString().padStart(4)} linked to MrCrypto ${e7lTokenId.toString().padStart(4)}`);

        await prisma.e7LToken.create({
          data: {
            e7lId: e7l.id,
            e7lTokenId,
            mrcryptoTokenId,
            linkedAt: block,
            imageURL: image,
            metadataURL: uri,
          },
        });

        await prisma.e7L.update({
          where: {
            id: e7l.id,
          },
          data: {
            lastBlockIndexed: block,
          },
        });
      }
    }
  }
}

async function indexMrCrypto(currentBlock: bigint) {
  const raw = await prisma.mrCrypto.aggregate({
    _max: {
      lastTransferBlock: true,
    },
  });

  const lastTransferBlock = raw._max.lastTransferBlock ?? 0n;

  for (
    let block = bigIntMax(MRCRYPTO_DEPLOY_BLOCK, lastTransferBlock);
    block < currentBlock;
    block += BLOCKS_PER_QUERY
  ) {
    const filter = await client.createContractEventFilter({
      abi: abiMrcrypto,
      address: MRCRYPTO_ADDRESS,
      eventName: "Transfer",
      fromBlock: block,
      toBlock: bigIntMin(block + BLOCKS_PER_QUERY - BigInt(1), currentBlock),
    });

    const logs = await client.getFilterLogs({ filter });

    for (const log of logs) {
      const tokenId = Number(log.args.tokenId);
      const to = log.args.to;
      const from = log.args.from;
      const eventBlock = log.blockNumber ?? BigInt(0);

      const eventBlockString = eventBlock.toString().padStart(9, "0");
      const tokenIdString = tokenId.toString().padStart(4, "0");

      console.log(
        `Block [${eventBlockString}] Tranfer from ${from} to ${to} tokenId ${tokenIdString}`
      );

      await updateOrCreateMrCrypto(tokenId, to, eventBlock);

      await prisma.transfer.create({
        data: {
          to,
          from,
          hash: log.transactionHash ?? "",
          blockNumber: log.blockNumber ?? 0,
          Token: {
            connect: {
              tokenId: tokenId,
            },
          },
        },
      });
    }
  }
}

async function updateOrCreateMrCrypto(
  tokenId: number,
  to: string,
  block: bigint
) {
  await prisma.mrCrypto.upsert({
    where: {
      tokenId: tokenId,
    },
    create: {
      tokenId: tokenId,
      imageURL: metadata[tokenId],
      metadataURL: `https://apinft.racksmafia.com/api/${tokenId}.json`,
      lastTransferBlock: block,
      Owner: {
        connectOrCreate: {
          where: {
            address: to,
          },
          create: {
            address: to,
          },
        },
      },
    },
    update: {
      lastTransferBlock: block,
      Owner: {
        connectOrCreate: {
          where: {
            address: to,
          },
          create: {
            address: to,
          },
        },
      },
    },
  });
}
