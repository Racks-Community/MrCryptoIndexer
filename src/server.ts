import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import { indexerProcess } from "@/indexer";

const yoga = createYoga({
  graphqlEndpoint: "/",
  schema,
  context: ({ request }) => {
    return {
      req: request,
      isAuthenticated:
        process.env.ADMIN_API_KEY &&
        process.env.ADMIN_API_KEY === request.headers.get("x-api-key"),
    };
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log(`\
🚀 Server ready at: http://127.0.0.1:4000
⭐️ See sample queries: http://pris.ly/e/ts/graphql#using-the-graphql-api
  `);
});

async function indexer() {
  console.log("Indexer stared ⚒️");

  await indexerProcess().catch((e) => {
    console.error("Indexer failed ❌ 😭");

    const { message, stack } = e;
    console.error(message);
    console.error(stack);

    process.exit(1);
  });

  console.log("Indexer finished ✅ 🎉 😄");

  setTimeout(indexer, 1000 * 60 * 5); // 5 minutes
}

indexer();
