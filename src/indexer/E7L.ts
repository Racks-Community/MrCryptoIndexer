import { prisma } from "@/db";
import { BLOCKS_PER_QUERY, bigIntMin, client } from "./common";
import { abiE7L } from "./abis/abi-E7L";
import { E7L } from "@prisma/client";

export async function indexE7L(
  lastBlockIndexed: bigint,
  currentBlock: bigint,
  e7l: E7L
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
          block + BLOCKS_PER_QUERY - BigInt(1),
          currentBlock
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
    toBlock: bigIntMin(block + BLOCKS_PER_QUERY - BigInt(1), currentBlock),
  });

  const logs = await client.getFilterLogs({ filter });

  for (let log of logs) {
    const e7lTokenId = Number(log.args.tokenId);
    const mrcryptoTokenId = Number(log.args.parentTokenId);
    const block = log.blockNumber ?? BigInt(0);

    console.log(
      `[${e7l.name.padStart(10)}] E7L ${e7lTokenId
        .toString()
        .padStart(4)} linked to MrCrypto ${e7lTokenId.toString().padStart(4)}`
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
    toBlock: bigIntMin(block + BLOCKS_PER_QUERY - BigInt(1), currentBlock),
  });

  const logs = await client.getFilterLogs({ filter });

  for (let log of logs) {
    const to = log.args.to;
    const e7lTokenId = Number(log.args.tokenId);
    const block = log.blockNumber ?? BigInt(0);

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

    const metadata = await fetch(uri).then((res) => res.json());

    const image = metadata.image as string;

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
