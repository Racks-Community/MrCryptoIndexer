import { prisma } from "@/db";
import {
  BLOCKS_PER_QUERY,
  MRCRYPTO_ADDRESS,
  bigIntMin,
  client,
} from "./common";
import { abiE7L } from "./abis/abi-E7L";
import { E7L } from "@prisma/client";
import { abiE7lNew } from "./abis/abi-E7L-new";

export async function indexE7L(
  lastBlockIndexed: bigint,
  currentBlock: bigint,
  e7l: E7L,
) {
  for (
    let block = lastBlockIndexed;
    block < currentBlock;
    block += BLOCKS_PER_QUERY
  ) {
    await indexTransfers(e7l, block, currentBlock);

    await indexLinks(e7l, block, currentBlock);

    await prisma.e7L.update({
      where: {
        id: e7l.id,
      },
      data: {
        lastBlockIndexed: bigIntMin(
          block + BLOCKS_PER_QUERY - 1n,
          currentBlock,
        ),
      },
    });
  }
}
async function indexLinks(e7l: E7L, block: bigint, currentBlock: bigint) {
  const filter = await client.createContractEventFilter({
    abi: abiE7L,
    address: e7l.contractAddress as `0x${string}`,
    eventName: "Link",
    fromBlock: block,
    toBlock: bigIntMin(block + BLOCKS_PER_QUERY - 1n, currentBlock),
  });

  const filter2 = await client.createContractEventFilter({
    abi: abiE7lNew,
    address: e7l.contractAddress as `0x${string}`,
    eventName: "Link",
    fromBlock: block,
    toBlock: bigIntMin(block + BLOCKS_PER_QUERY - 1n, currentBlock),
  });

  const logs = await client.getFilterLogs({ filter });
  const logs2 = await client.getFilterLogs({ filter: filter2 });

  // Index old E7L
  for (let log of logs) {
    const e7lTokenId = Number(log.args.tokenId);
    const mrcryptoTokenId = Number(log.args.parentTokenId);
    const block = log.blockNumber ?? 0n;

    console.log(
      `[${e7l.name.padStart(10)}] E7L ${e7lTokenId
        .toString()
        .padStart(4)} linked to MrCrypto ${mrcryptoTokenId
        .toString()
        .padStart(4)}`,
    );

    await prisma.e7LToken.update({
      where: {
        e7lId_e7lTokenId: {
          e7lId: e7l.id,
          e7lTokenId,
        },
      },
      data: {
        mrcryptoTokenId,
        linkedAt: block,
      },
    });
  }

  // Index new E7L (with parentContract in the abi)
  for (let log of logs2) {
    const e7lTokenId = Number(log.args.tokenId);
    const mrcryptoTokenId = Number(log.args.parentTokenId);
    const block = log.blockNumber ?? 0n;

    if (log.args.parentContract != MRCRYPTO_ADDRESS) {
      continue;
    }

    console.log(
      `[${e7l.name.padStart(10)}] E7L ${e7lTokenId
        .toString()
        .padStart(4)} linked to MrCrypto ${mrcryptoTokenId
        .toString()
        .padStart(4)}`,
    );

    await prisma.e7LToken.update({
      where: {
        e7lId_e7lTokenId: {
          e7lId: e7l.id,
          e7lTokenId,
        },
      },
      data: {
        mrcryptoTokenId,
        linkedAt: block,
      },
    });
  }
}

async function indexTransfers(e7l: E7L, block: bigint, currentBlock: bigint) {
  const filter = await client.createContractEventFilter({
    abi: abiE7L,
    address: e7l.contractAddress as `0x${string}`,
    eventName: "Transfer",
    fromBlock: block,
    toBlock: bigIntMin(block + BLOCKS_PER_QUERY - 1n, currentBlock),
  });

  const logs = await client.getFilterLogs({ filter });

  for (let log of logs) {
    const to = log.args.to;
    const e7lTokenId = Number(log.args.tokenId);
    const block = log.blockNumber ?? 0n;

    if (!to) {
      throw new Error("E7L indexing: Error indexing transfer");
    }

    const existToken = await prisma.e7LToken.findUnique({
      where: {
        e7lId_e7lTokenId: {
          e7lId: e7l.id,
          e7lTokenId,
        },
      },
    });

    if (existToken) {
      await prisma.e7LToken.update({
        where: {
          id: existToken.id,
        },
        data: {
          Owner: {
            connectOrCreate: {
              create: {
                address: to,
              },
              where: {
                address: to,
              },
            },
          },
        },
      });

      continue;
    }

    const uri = await client.readContract({
      abi: abiE7L,
      functionName: "tokenURI",
      address: e7l.contractAddress as `0x${string}`,
      args: [BigInt(e7lTokenId)],
    });

    const metadata = (await fetch(uri).then((res) => res.json())) as {
      image: string;
    };

    const image = metadata.image;

    await prisma.e7LToken.create({
      data: {
        E7L: {
          connect: {
            id: e7l.id,
          },
        },
        e7lTokenId,
        linkedAt: block,
        imageURL: image,
        metadataURL: uri,
        Owner: {
          connectOrCreate: {
            create: {
              address: to,
            },
            where: {
              address: to,
            },
          },
        },
      },
    });
  }
}
