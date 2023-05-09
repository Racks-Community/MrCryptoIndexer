import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateTimeResolver, BigIntResolver } from "graphql-scalars";
import { prisma } from "@/db";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {};
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
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
  },
});

builder.queryType({});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("BigInt", BigIntResolver, {});
