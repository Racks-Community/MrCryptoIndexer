import { builder } from "@/builder";
import { prisma } from "@/db";

const AscendDescentEnum = builder.enumType("AscendDescentByEnum", {
  values: ["asc", "desc"] as const,
});

const MrCryptoOrderByEnum = builder.enumType("MrCryptoOrderByEnum", {
  values: ["rarityRanking", "tokenId"] as const,
});

builder.prismaObject("Holder", {
  fields: (t) => ({
    address: t.exposeString("address"),
    bankingPercentage: t.float({
      resolve: async (param) => {
        const totalHoldersScore = await prisma.holder.aggregate({
          _sum: {
            holderScore: true,
          },
        });

        if (!totalHoldersScore._sum.holderScore) return 0;

        return (
          (Number(param.holderScore) /
            Number(totalHoldersScore._sum.holderScore)) *
          100
        );
      },
    }),
    holderScore: t.expose("holderScore", { type: "BigInt" }),
    holderRanking: t.int({
      resolve: async (param) => {
        const totalHoldersScore = await prisma.holder.aggregate({
          _count: {
            holderScore: true,
          },
          where: {
            holderScore: {
              gt: param.holderScore,
            },
          },
        });

        return totalHoldersScore._count.holderScore + 1;
      },
    }),
    mrCryptosOwned: t.relation("MrCryptosOwned", {
      args: {
        first: t.arg.int({ required: true, defaultValue: 100 }),
        skip: t.arg.int({ required: true, defaultValue: 0 }),
        order: t.arg({
          required: true,
          defaultValue: { type: "desc", by: "tokenId" },
          type: builder.inputType("MrCryptoOrderBy", {
            fields: (t) => ({
              type: t.field({
                type: AscendDescentEnum,
                required: true,
                defaultValue: "desc",
              }),
              by: t.field({
                type: MrCryptoOrderByEnum,
                required: true,
                defaultValue: "tokenId",
              }),
            }),
          }),
        }),
      },
      query: (args) => ({
        orderBy: { [args.order.by]: args.order.type },
        take: args.first,
        skip: args.skip,
      }),
    }),
    numberOfMrCryptos: t.field({
      select: {
        MrCryptosOwned: {
          orderBy: {
            tokenId: "desc",
          },
        },
      },
      type: "Int",
      resolve: (parent) => parent.MrCryptosOwned.length,
    }),
  }),
});

builder.queryFields((t) => ({
  topHolders: t.prismaField({
    type: ["Holder"],
    args: { take: t.arg.int({ required: true, defaultValue: 10 }) },
    resolve: (query, _parent, args) => {
      return prisma.holder.findMany({
        ...query,
        take: args.take,
        orderBy: {
          MrCryptosOwned: { _count: "desc" },
        },
      });
    },
  }),
  holderByAddress: t.prismaField({
    type: "Holder",
    args: {
      address: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args) => {
      return prisma.holder.findUniqueOrThrow({
        ...query,
        where: {
          address: args.address,
        },
      });
    },
  }),
}));
