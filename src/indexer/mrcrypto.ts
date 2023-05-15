import { prisma } from "@/db";
import { BLOCKS_PER_QUERY, bigIntMax, bigIntMin, client } from "./common";
import { abiMrcrypto } from "./abis/abi-mrcrypto";
import { formatEther, formatUnits, zeroAddress } from "viem";
import { abiWETH } from "./abis/abi-weth";
import { metadata } from "./metadata";
import { Payment } from "@prisma/client";
import { constants } from "buffer";

const MRCRYPTO_DEPLOY_BLOCK: bigint = BigInt(25839542 - 1);
const MRCRYPTO_ADDRESS = "0xeF453154766505FEB9dBF0a58E6990fd6eB66969";

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

export async function indexMrCrypto(currentBlock: bigint) {
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
    const fromBlock = block;
    const toBlock = bigIntMin(
      block + BLOCKS_PER_QUERY - BigInt(1),
      currentBlock
    );
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
      const aBlock = a.blockNumber ?? BigInt(0);
      const bBlock = b.blockNumber ?? BigInt(0);

      if (aBlock > bBlock) return 1;

      if (aBlock < bBlock) return -1;

      return 0;
    });

    const logsGroupByTx = logsOrdered.reduce((acc, log) => {
      const txHash = log.transactionHash;

      if (!txHash) {
        throw new Error("Mr. Crypto indexing: No txHash");
      }

      if (!acc[txHash]) {
        acc[txHash] = [];
      }

      acc[txHash].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    const logsGroupByTxArray = Object.values(logsGroupByTx);

    for (const logsOrdered of logsGroupByTxArray) {
      const txHash = logsOrdered[0].transactionHash;
      const blockNumber = logsOrdered[0].blockNumber;
      const to = logsOrdered[0].args.to;

      if (!txHash || !blockNumber) {
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
  }
}

async function checkForEthTransfer(
  blockNumber: bigint,
  txHash: string,
  to: string
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
    (l) => l.transactionHash == txHash && l.args.from == to
  );

  // NO hay transacción de WETH
  if (wethTransfer.length == 0) {
    return 0;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
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
  to: string
): Promise<number> {
  const filter = await client.createContractEventFilter({
    abi: abiWETH,
    eventName: "Transfer",
    address: USDC_ADDRESS,
    fromBlock: blockNumber ?? BigInt(0),
    toBlock: blockNumber ?? BigInt(0),
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to
  );

  // Hay transacción de WETH
  if (!wethTransfer || wethTransfer.length == 0) {
    return 0;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
    .reduce((a, b) => a + b, 0n);

  if (total == 0n) {
    return 0;
  }

  return Number(formatUnits(total, USDC_DECIMALS));
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
