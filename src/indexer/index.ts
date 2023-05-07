import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";
import { abiMrcrypto } from "./abi-mrcrypto";
import { prisma } from "@/db";
import { metadata } from "./metadata";

const MRCRYPTO_DEPLOY_BLOCK: bigint = BigInt(25839542 - 1);
const MRCRYPTO_ADDRESS = "0xeF453154766505FEB9dBF0a58E6990fd6eB66969";
const ALCHEMY_URL =
  "https://polygon-mainnet.g.alchemy.com/v2/";

const BLOCKS_PER_QUERY = BigInt(200_000);

const transport = http(ALCHEMY_URL);

const client = createPublicClient({
  chain: polygon,
  transport,
});

async function main() {
  const currentBlock = await client.getBlockNumber();

  console.log(`Current block number: ${currentBlock}`);

  for (
    let block = MRCRYPTO_DEPLOY_BLOCK;
    block < currentBlock;
    block += BLOCKS_PER_QUERY
  ) {
    const filter = await client.createContractEventFilter({
      abi: abiMrcrypto,
      address: MRCRYPTO_ADDRESS,
      eventName: "Transfer",
      fromBlock: block,
      toBlock: block + BLOCKS_PER_QUERY - BigInt(1),
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
      metadataURl: `https://apinft.racksmafia.com/api/${tokenId}.json`,
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

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
