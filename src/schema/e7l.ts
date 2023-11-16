import { builder } from "@/builder";
import { prisma } from "@/db";
import { getAddress } from "viem";

builder.prismaObject("E7LToken", {
  fields: (t) => ({
    mrCrypto: t.relation("MrCrypto", { nullable: true }),
    Owner: t.relation("Owner"),
    E7L: t.relation("E7L"),
    tokenId: t.exposeInt("e7lTokenId"),
    imageURL: t.exposeString("imageURL"),
    metadata: t.exposeString("metadataURL"),
    linked: t.field({
      type: "Boolean",
      resolve: async (e7l) => e7l.mrcryptoTokenId !== null,
    }),
    synced: t.field({
      type: "Boolean",
      resolve: async (e7l) => {
        const rawE7L = await prisma.e7LToken.findUniqueOrThrow({
          where: {
            id: e7l.id,
          },
          select: {
            MrCrypto: {
              select: {
                Owner: {
                  select: {
                    address: true,
                  },
                },
              },
            },
            Owner: {
              select: {
                address: true,
              },
            },
          },
        });

        const mrCryptoOwner = rawE7L.MrCrypto?.Owner.address;
        const e7lOwner = rawE7L.Owner.address;

        return mrCryptoOwner === e7lOwner && mrCryptoOwner !== null;
      },
    }),
  }),
});

builder.prismaObject("E7L", {
  fields: (t) => ({
    E7LTokens: t.relation("Tokens"),
    imageURL: t.exposeString("imageURL"),
    name: t.exposeString("name"),
    contractAddress: t.exposeString("contractAddress"),
    supply: t.field({
      type: "Int",
      resolve: (e7l) => {
        return prisma.e7LToken.count({
          where: {
            e7lId: e7l.id,
          },
        });
      },
    }),
    linked: t.field({
      type: "Int",
      resolve: (e7l) => {
        return prisma.e7LToken.count({
          where: {
            e7lId: e7l.id,
            mrcryptoTokenId: {
              not: null,
            },
          },
        });
      },
    }),
    synchronized: t.field({
      type: "Int",
      resolve: async (e7l) => {
        const res = await prisma.e7LToken.findMany({
          where: {
            e7lId: e7l.id,
            MrCrypto: {
              isNot: null,
            },
          },
          select: {
            ownerId: true,
            MrCrypto: {
              select: {
                ownerId: true,
              },
            },
          },
        });

        return res.filter((e7l) => e7l.ownerId == e7l.MrCrypto?.ownerId).length;
      },
    }),
  }),
});

builder.mutationFields((t) => ({
  addE7lCollection: t.prismaField({
    authScopes: { isAuthenticated: true },
    type: "E7L",
    args: {
      name: t.arg.string({ required: true }),
      imageURL: t.arg.string({ required: true }),
      contractAddress: t.arg.string({ required: true }),
      deployedBlock: t.arg.int({ required: true }),
    },
    resolve: async (_root, _parent, args) => {
      const e7l = await prisma.e7L.create({
        data: {
          lastBlockIndexed: args.deployedBlock,
          deployedBlock: args.deployedBlock,
          contractAddress: args.contractAddress,
          imageURL: args.imageURL,
          name: args.name,
        },
      });

      return e7l;
    },
  }),
}));

builder.queryFields((t) => ({
  e7lTokensByAddress: t.prismaField({
    type: ["E7LToken"],
    args: { address: t.arg.string({ required: true }) },
    resolve: (query, _parent, args) => {
      const address = getAddress(args.address);

      return prisma.e7LToken.findMany({
        ...query,
        where: {
          Owner: {
            address,
          },
        },
      });
    },
  }),
  e7lTokens: t.prismaField({
    type: ["E7LToken"],
    args: {
      first: t.arg.int({ required: true, defaultValue: 100 }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
    },
    resolve: (query, _parent, args) => {
      return prisma.e7LToken.findMany({
        ...query,
        skip: args.skip,
        take: args.first,
        orderBy: [{ E7L: { name: "asc" } }, { e7lTokenId: "asc" }],
      });
    },
  }),
  e7lCollections: t.prismaField({
    type: ["E7L"],
    resolve: (query) => {
      return prisma.e7L.findMany(query);
    },
  }),
}));
