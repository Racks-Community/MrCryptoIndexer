import { prisma } from "@/db";
import { client } from "./common";
import { indexE7L } from "./E7L";
import { indexMrCrypto } from "./mrcrypto";

async function indexerProcess() {
  const currentBlock = await client.getBlockNumber();

  console.log(`Current block number: ${currentBlock}`);

  await indexMrCrypto(currentBlock);

  const E7Ls = await prisma.e7L.findMany();

  for (const e7l of E7Ls) {
    const lastBlockIndexed = e7l.lastBlockIndexed + 1n;

    await indexE7L(lastBlockIndexed, currentBlock, e7l);
  }
}

const FIVE_MINUTES = 1000 * 60 * 5;
export let isIndexerCronJobRunning = false;
let nextExecutionTimeOut: NodeJS.Timeout | null = null;

async function indexerCronJob() {
  isIndexerCronJobRunning = true;
  console.log("Indexer stared ⚒️");

  await indexerProcess().catch((e) => {
    console.error("Indexer failed ❌ 😭");

    const { message, stack } = e;
    console.error(message);
    console.error(stack);

    process.exit(1);
  });

  isIndexerCronJobRunning = false;
  console.log("Indexer finished ✅ 🎉 😄");

  console.log("Waiting 5 minutes for next indexation ⏰");
  nextExecutionTimeOut = setTimeout(indexerCronJob, FIVE_MINUTES);
}

export async function startIndexation() {
  if (isIndexerCronJobRunning) {
    return "Indexer cron job already running ⏳" as const;
  }

  if (nextExecutionTimeOut) {
    clearTimeout(nextExecutionTimeOut);
  }

  indexerCronJob();
  return "Indexer cron job started 🏃" as const;
}
