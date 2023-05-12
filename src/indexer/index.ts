import { prisma } from "@/db";
import { client } from "./common";
import { indexE7L } from "./E7L";
import { indexMrCrypto } from "./mrcrypto";

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
