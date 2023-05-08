import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import { indexerProcess } from "@/indexer";

const yoga = createYoga({
  graphqlEndpoint: "/",
  schema,
  context: (req) => {
    return {
      req,
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

indexerProcess()
  .then(() => console.log("Indexer finished"))
  .catch((e) => {
    console.error("Indexer failed");

    const { message, stack } = e;
    console.error(message);
    console.error(stack);

    process.exit(1);
  });
