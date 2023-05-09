import { createPublicClient, formatEther, formatUnits, http, parseUnits, zeroAddress } from "viem";
import { polygon } from "viem/chains";
import { abiMrcrypto } from "./abi-mrcrypto";
import { prisma } from "@/db";
import { metadata } from "./metadata";
import { abiE7L } from "./abi-E7L";
import { abiWETH } from "./abi-weth";
import { E7L } from "@prisma/client";

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
    const lastBlockIndexed = e7l.lastBlockIndexed + 1n;

    await indexE7L(lastBlockIndexed, currentBlock, e7l);
  }
}

async function indexE7L(
  lastBlockIndexed: bigint,
  currentBlock: bigint,
  e7l: E7L
) {
  for (
    let block = lastBlockIndexed;
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
      });

      const metadata = await fetch(uri).then((res) => res.json());

      const image = metadata.image as string;

      console.log(
        `[${e7l.name.padStart(10)}] E7L ${e7lTokenId
          .toString()
          .padStart(4)} linked to MrCrypto ${e7lTokenId.toString().padStart(4)}`
      );

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

  await prisma.e7L.update({
    where: {
      id: e7l.id,
    },
    data: {
      lastBlockIndexed: currentBlock,
    },
  });
}

async function indexMrCrypto(currentBlock: bigint) {
  const raw = await prisma.mrCrypto.aggregate({
    _max: {
      lastTransferBlock: true,
    },
  });

  const lastTransferBlock = raw._max.lastTransferBlock ?? 0n;

  for (
    let block = bigIntMax(MRCRYPTO_DEPLOY_BLOCK, lastTransferBlock + 1n);
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

      const transfer = await prisma.transfer.create({
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

      if (from === zeroAddress) {
        continue;
      }

      const finded = await checkForEthTransfer(
        log.blockNumber,
        log.transactionHash ?? "",
        from,
        to,
        transfer.id
      );

      if (finded) {
        continue;
      }

      await checkForUSDCTransfer(
        log.blockNumber,
        log.transactionHash ?? "",
        from,
        to,
        transfer.id
      );
    }
  }
}

async function checkForEthTransfer(
  blockNumber: bigint | null,
  txHash: string,
  from: string,
  to: string,
  transferId: string
): Promise<boolean> {
  const filter = await client.createContractEventFilter({
    abi: abiWETH,
    eventName: "Transfer",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    fromBlock: blockNumber ?? BigInt(0),
    toBlock: blockNumber ?? BigInt(0),
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to
  );

  // Hay transacción de WETH
  if (!wethTransfer) {
    return false;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
    .reduce((a, b) => a + b, 0n);

  if (total > 0n) {
    console.log(
      `USDC Transfer ${formatEther(total).substring(
        0,
        5
      )} to ${from} on tx ${txHash}`
    );

    await prisma.payment.create({
      data: {
        Transfer: { connect: { id: transferId } },
        amount: Number(formatEther(total)),
        currency: "WETH",
      },
    });
  }

  return true;
}

async function checkForUSDCTransfer(
  blockNumber: bigint | null,
  txHash: string,
  from: string,
  to: string,
  transferId: string
): Promise<boolean> {
  const filter = await client.createContractEventFilter({
    abi: abiWETH,
    eventName: "Transfer",
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    fromBlock: blockNumber ?? BigInt(0),
    toBlock: blockNumber ?? BigInt(0),
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to
  );

  // Hay transacción de WETH
  if (!wethTransfer) {
    return false;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
    .reduce((a, b) => a + b, 0n);

  if (total > 0n) {
    console.log(
      `WETH Transfer ${formatUnits(total, 6).substring(
        0,
        5
      )} to ${from} on tx ${txHash}`
    );

    await prisma.payment.create({
      data: {
        Transfer: { connect: { id: transferId } },
        amount: Number(formatUnits(total, 6)),
        currency: "USDC",
      },
    });
  }

  return true;
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
