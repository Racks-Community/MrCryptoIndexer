import { prisma } from "@/db";
import {
  BLOCKS_PER_QUERY,
  MRCRYPTO_ADDRESS,
  bigIntMax,
  bigIntMin,
  client,
} from "./common";
import { abiMrcrypto } from "./abis/abi-mrcrypto";
import { formatEther, formatUnits } from "viem";
import { abiWETH } from "./abis/abi-weth";
import { metadata } from "./metadata";
import { Payment } from "@prisma/client";

const MRCRYPTO_DEPLOY_BLOCK: bigint = 25839541n as const;

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as const;
const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" as const;

export async function indexMrCrypto(currentBlock: bigint) {
  const lastIteration = await prisma.indexationIteration.aggregate({
    _max: {
      toBlockNumber: true,
    },
  });

  const lastMrCryptoTransferred = await prisma.mrCrypto.aggregate({
    _max: {
      lastTransferBlock: true,
    },
  });

  const lastTransferBlock = bigIntMax(
    lastIteration._max.toBlockNumber ?? 0n,
    lastMrCryptoTransferred._max.lastTransferBlock ?? 0n,
  );

  for (
    let block = bigIntMax(MRCRYPTO_DEPLOY_BLOCK, lastTransferBlock + 1n);
    block < currentBlock;
    block += BLOCKS_PER_QUERY
  ) {
    const fromBlock = block;
    const toBlock = bigIntMin(block + BLOCKS_PER_QUERY - 1n, currentBlock);

    const fromTimestamp = (await client.getBlock({ blockNumber: fromBlock }))
      .timestamp;
    const fromDate = new Date(Number(fromTimestamp) * 1000);

    const toTimestamp = (await client.getBlock({ blockNumber: toBlock }))
      .timestamp;
    const toDate = new Date(Number(toTimestamp) * 1000);

    const iteration = await prisma.indexationIteration.create({
      data: {
        fromBlockNumber: fromBlock,
        toBlockNumber: toBlock,
        fromDateTime: fromDate,
        toDateTime: toDate,
      },
    });

    const filter = await client.createContractEventFilter({
      abi: abiMrcrypto,
      address: MRCRYPTO_ADDRESS,
      eventName: "Transfer",
      fromBlock,
      toBlock,
    });

    console.log(`indexing from block ${fromBlock} to ${toBlock}`);

    const logs = await client.getFilterLogs({ filter });
    const logsOrdered = logs.sort((a, b) => {
      const aBlock = a.blockNumber ?? 0n;
      const bBlock = b.blockNumber ?? 0n;

      if (aBlock > bBlock) return 1;

      if (aBlock < bBlock) return -1;

      return 0;
    });

    const logsGroupByTx = logsOrdered.reduce(
      (acc, log) => {
        const txHash = log.transactionHash;

        if (!txHash) {
          throw new Error("Mr. Crypto indexing: No txHash");
        }

        if (!acc[txHash]) {
          acc[txHash] = [];
        }

        acc[txHash].push(log);
        return acc;
      },
      {} as Record<string, typeof logs>,
    );

    const logsGroupByTxArray = Object.values(logsGroupByTx);

    for (const logsOrdered of logsGroupByTxArray) {
      const txHash = logsOrdered[0].transactionHash;
      const blockNumber = logsOrdered[0].blockNumber;
      const to = logsOrdered[0].args.to;

      if (!txHash || !blockNumber || !to) {
        throw new Error("Mr. Crypto indexing: No txHash or blockNumber");
      }

      const WETHTransfer = await checkForEthTransfer(blockNumber, txHash, to);
      const USDCTransfer = await checkForUSDCTransfer(blockNumber, txHash, to);

      let data: { name: string; amount: number }[] = [];

      if (WETHTransfer > 0) {
        data.push({ name: "WETH", amount: WETHTransfer });
      }

      if (USDCTransfer > 0) {
        data.push({ name: "USDC", amount: USDCTransfer });
      }

      let payment: Payment | undefined = undefined;

      if (data.length > 0)
        payment = await prisma.payment.create({
          data: {
            blockNumber,
            Currency: {
              createMany: {
                data,
              },
            },
          },
        });

      for (const log of logsOrdered) {
        const tokenId = Number(log.args.tokenId);
        const to = log.args.to;
        const from = log.args.from;
        const eventBlock = blockNumber;

        if (!tokenId || !to || !from) {
          throw new Error("Mr. Crypto indexing: Error parsing event log");
        }

        await updateOrCreateMrCrypto(tokenId, to, eventBlock);

        await prisma.transfer.create({
          data: {
            to,
            from,
            hash: txHash,
            blockNumber: blockNumber,
            ...(payment && {
              Payment: {
                connect: {
                  id: payment.id,
                },
              },
            }),
            Token: {
              connect: {
                tokenId: tokenId,
              },
            },
          },
        });
      }
    }

    const finishedAt = new Date();
    const secondsElapsed = Math.floor(
      finishedAt.getTime() / 1000 - iteration.starterAt.getTime() / 1000,
    );

    await prisma.indexationIteration.update({
      where: {
        id: iteration.id,
      },
      data: {
        finishedAt,
        secondsElapsed,
      },
    });
  }
}

async function checkForEthTransfer(
  blockNumber: bigint,
  txHash: string,
  to: string,
): Promise<number> {
  const filter = await client.createContractEventFilter({
    abi: abiWETH,
    eventName: "Transfer",
    address: WETH_ADDRESS,
    fromBlock: blockNumber,
    toBlock: blockNumber,
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to,
  );

  // NO hay transacción de WETH
  if (wethTransfer.length == 0) {
    return 0;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value ?? 0n)
    .reduce((a, b) => a + b, 0n);

  if (total == 0n) {
    return 0;
  }

  return Number(formatEther(total));
}

const USDC_DECIMALS = 6;
async function checkForUSDCTransfer(
  blockNumber: bigint | null,
  txHash: string,
  to: string,
): Promise<number> {
  const filter = await client.createContractEventFilter({
    abi: abiWETH,
    eventName: "Transfer",
    address: USDC_ADDRESS,
    fromBlock: blockNumber ?? 0n,
    toBlock: blockNumber ?? 0n,
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to,
  );

  // Hay transacción de WETH
  if (!wethTransfer || wethTransfer.length == 0) {
    return 0;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value ?? 0n)
    .reduce((a, b) => a + b, 0n);

  if (total == 0n || total == undefined) {
    return 0;
  }

  return Number(formatUnits(total, USDC_DECIMALS));
}

async function updateOrCreateMrCrypto(
  tokenId: number,
  to: string,
  block: bigint,
) {
  await prisma.mrCrypto.upsert({
    where: {
      tokenId: tokenId,
    },
    create: {
      tokenId: tokenId,
      imageURL: metadata[tokenId].image,
      attBackground: metadata[tokenId].attributes.Background,
      attClothes: metadata[tokenId].attributes.Clothes,
      attEyes: metadata[tokenId].attributes.Eyes,
      attHeadwear: metadata[tokenId].attributes.Headwear,
      attMoustache: metadata[tokenId].attributes.Moustache,
      attType: metadata[tokenId].attributes.Type,
      metadataURL: `https://apinft.racksmafia.com/api/${tokenId}.json`,
      rarityScore: metadata[tokenId].total_score,
      rarityRanking: metadata[tokenId].ranking,
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
