import { builder } from "@/builder";
import { prisma } from "@/db";

builder.prismaObject("Transfer", {
  fields: (t) => ({
    from: t.exposeString("from"),
    to: t.exposeString("to"),
    MrCrypto: t.relation("Token"),
    txHash: t.exposeString("hash"),
    blockNumber: t.expose("blockNumber", { type: "BigInt" }),
    Payment: t.relation("Payment", { nullable: true }),
  }),
});

builder.prismaObject("Payment", {
  fields: (t) => ({
    blockNumber: t.expose("blockNumber", { type: "BigInt" }),
    Currencies: t.relation("Currency"),
    Transfer: t.relation("Transfer"),
  }),
});

builder.prismaObject("Currency", {
  fields: (t) => ({
    amount: t.exposeFloat("amount"),
    name: t.exposeString("name"),
  }),
});

const OrderTypeInput = builder.enumType("OrderByInput", {
  values: { asc: {}, desc: {} },
});

const SalesOrderByEnum = builder.enumType("SalesOrderByEnum", {
  values: { blockNumber: {}, amount: {} },
});

builder.queryFields((t) => ({
  transfers: t.prismaField({
    type: ["Transfer"],
    args: {
      first: t.arg.int({ required: true, defaultValue: 100 }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      order: t.arg({
        type: OrderTypeInput,
        required: true,
        defaultValue: "desc",
      }),
    },
    resolve: (query, _parent, args) =>
      prisma.transfer.findMany({
        ...query,
        skip: args.skip,
        take: args.first,
        orderBy: [
          {
            blockNumber: args.order,
          },
          {
            tokenId: args.order,
          },
        ],
      }),
  }),
  sales: t.prismaField({
    type: ["Payment"],
    args: {
      first: t.arg.int({ required: true, defaultValue: 100 }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      order: t.arg({
        type: OrderTypeInput,
        required: true,
        defaultValue: "desc",
      }),
      orderBy: t.arg({
        type: SalesOrderByEnum,
        required: true,
        defaultValue: "blockNumber",
      }),
    },
    resolve: (query, _parent, args) =>
      prisma.payment.findMany({
        ...query,
        skip: args.skip,
        take: args.first,
        // TODO: Make this work
        orderBy: {
          blockNumber: args.order,
        },
      }),
  }),
}));
