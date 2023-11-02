import { builder } from "@/builder";
import { prisma } from "@/db";

builder.prismaObject("Holder", {
  fields: (t) => ({
    address: t.exposeString("address"),
    mrCryptosOwned: t.relation("MrCryptosOwned", {
      query: { orderBy: { tokenId: "asc" } },
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
}));
