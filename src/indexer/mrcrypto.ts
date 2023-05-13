import { prisma } from "@/db";
import { BLOCKS_PER_QUERY, bigIntMax, bigIntMin, client } from "./common";
import { abiMrcrypto } from "./abis/abi-mrcrypto";
import { formatEther, formatUnits, zeroAddress } from "viem";
import { abiWETH } from "./abis/abi-weth";
import { metadata } from "./metadata";

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
    const filter = await client.createContractEventFilter({
      abi: abiMrcrypto,
      address: MRCRYPTO_ADDRESS,
      eventName: "Transfer",
      fromBlock: block,
      toBlock: bigIntMin(block + BLOCKS_PER_QUERY - BigInt(1), currentBlock),
    });

    const logs = await client.getFilterLogs({ filter });
    const logsOrdered = logs.sort((a, b) => {
      const aBlock = a.blockNumber ?? BigInt(0);
      const bBlock = b.blockNumber ?? BigInt(0);

      if (aBlock > bBlock) return 1;

      if (aBlock < bBlock) return -1;

      return 0;
    });

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

      const ethFound = await checkForEthTransfer(
        log.blockNumber,
        log.transactionHash ?? "",
        from,
        to,
        transfer.id
      );

      if (ethFound) {
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
    address: WETH_ADDRESS,
    fromBlock: blockNumber ?? BigInt(0),
    toBlock: blockNumber ?? BigInt(0),
  });

  const logs = await client.getFilterLogs({ filter });

  const wethTransfer = logs.filter(
    (l) => l.transactionHash == txHash && l.args.from == to
  );

  // NO hay transacción de WETH
  if (wethTransfer.length == 0) {
    return false;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
    .reduce((a, b) => a + b, 0n);

  if (total > 0n) {
    console.log(
      `WETH Transfer ${formatEther(total).substring(
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
    return false;
  }

  const total = wethTransfer
    .map((wt) => wt.args.value)
    .reduce((a, b) => a + b, 0n);

  if (total > 0n) {
    console.log(
      `USDC Transfer ${formatUnits(total, 6).substring(
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
