import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema";
import { startIndexation } from "@/indexer";
import { env } from "./env";

const yoga = createYoga({
  graphqlEndpoint: "/",
  schema,
  context: ({ request }) => {
    return {
      req: request,
      isAuthenticated: env.ADMIN_API_KEY === request.headers.get("x-api-key"),
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

startIndexation();
