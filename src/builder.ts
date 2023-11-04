import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";

import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateTimeResolver, BigIntResolver } from "graphql-scalars";
import { prisma } from "@/db";
import { isIndexerCronJobRunning, startIndexation } from "./indexer";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    isAuthenticated: boolean;
  };
  AuthScopes: {
    isAuthenticated: boolean;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    BigInt: {
      Input: bigint;
      Output: bigint;
    };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin, ScopeAuthPlugin],
  authScopes: async (context) => ({
    isAuthenticated: context.isAuthenticated,
  }),
  scopeAuthOptions: {},
  relayOptions: {
    clientMutationId: "omit",
    cursorType: "String",
  },
  prisma: {
    client: prisma,
  },
});

export interface IVolumen {
  currency: string;
  amount: number;
}

export interface ICollectionInfo {
  name: string;
  holders: number;
  lastSale: string;
  address: string;
  description: string;
  volumen: IVolumen[];
}

export const CollectionInfo =
  builder.objectRef<ICollectionInfo>("CollectionInfo");
export const Volumen = builder.objectRef<IVolumen>("Volumen");

Volumen.implement({
  fields: (t) => ({
    currency: t.exposeString("currency"),
    amount: t.exposeFloat("amount"),
  }),
});

CollectionInfo.implement({
  fields: (t) => ({
    name: t.exposeString("name"),
    holders: t.exposeInt("holders"),
    address: t.exposeString("address"),
    lastSale: t.exposeString("lastSale"),
    description: t.exposeString("description"),
    volumen: t.expose("volumen", { type: [Volumen] }),
  }),
});

builder.queryType({
  fields: (t) => ({
    isAuthenticated: t.field({
      type: "Boolean",
      resolve: (_root, _args, context) => context.isAuthenticated,
    }),
    isIndexerCronJobRunning: t.field({
      type: "Boolean",

      authScopes: { isAuthenticated: true },
      resolve: () => isIndexerCronJobRunning,
    }),
    collectionInfo: t.field({
      type: CollectionInfo,
      resolve: async () => {
        const numHolders = await prisma.holder.count({
          where: {
            // have al least one token
            MrCryptosOwned: {
              some: {},
            },
          },
        });

        const lastSale = await prisma.transfer.findFirstOrThrow({
          orderBy: {
            blockNumber: "desc",
          },
          where: {
            paymentId: { not: null },
          },
          select: {
            Payment: {
              select: {
                Currency: {
                  select: {
                    name: true,
                    amount: true,
                  },
                },
              },
            },
          },
        });

        const currencies = await prisma.currency.groupBy({
          _sum: {
            amount: true,
          },
          by: ["name"],
        });

        const volumen: IVolumen[] = currencies.map((c) => ({
          amount: c._sum.amount ?? 0,
          currency: c.name,
        }));

        return {
          name: "Mr. Crypto by Racksmafia",
          description: "The official RACKS® NFT collection",
          holders: numHolders,
          address: "0xeF453154766505FEB9dBF0a58E6990fd6eB66969",
          lastSale: `${Number(
            lastSale.Payment!.Currency[0].amount.toFixed(3),
          )} ${lastSale.Payment!.Currency[0].name}`,
          volumen,
        };
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    // Add mutation that returns a simple boolean
    startIndexationManually: t.string({
      authScopes: { isAuthenticated: true },
      resolve: () => {
        return startIndexation();
      },
    }),
  }),
});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("BigInt", BigIntResolver, {});
