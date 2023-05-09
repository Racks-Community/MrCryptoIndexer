import { builder } from "@/builder";
import { prisma } from "@/db";
import { getAddress } from "viem";

builder.prismaObject("MrCrypto", {
  fields: (t) => ({
    tokenId: t.exposeInt("tokenId"),
    imageURL: t.exposeString("imageURL"),
    metadata: t.exposeString("metadataURL"),
    E7LTokens: t.relation("E7LTokensLinked"),
    Owner: t.relation("Owner"),
    Transfers: t.relation("Transfers"),
  }),
});

builder.prismaObject("Transfer", {
  fields: (t) => ({
    from: t.exposeString("from"),
    to: t.exposeString("to"),
    MrCrypto: t.relation("Token"),
    blockNumber: t.expose("blockNumber", { type: "BigInt" }),
    Payment: t.relation("Payment", { nullable: true }),
  }),
});

builder.prismaObject("Payment", {
  fields: (t) => ({
    amount: t.exposeFloat("amount"),
    currency: t.exposeString("currency"),
  }),
});

builder.prismaObject("Holder", {
  fields: (t) => ({
    address: t.exposeString("address"),
    mrCryptosOwned: t.relation("MrCryptosOwned"),
  }),
});

builder.prismaObject("E7LToken", {
  fields: (t) => ({
    mrCrypto: t.relation("MrCrypto"),
    E7L: t.relation("E7L"),
    toeknId: t.exposeInt("e7lTokenId"),
    imageURL: t.exposeString("imageURL"),
    metadata: t.exposeString("metadataURL"),
  }),
});

builder.prismaObject("E7L", {
  fields: (t) => ({
    E7LTokens: t.relation("Tokens"),
    name: t.exposeString("name"),
  }),
});

const TokenIdInput = builder.inputType("TokenIdInput", {
  fields: (t) => ({
    tokenId: t.int({ required: true }),
  }),
});

builder.queryFields((t) => ({
  mrCryptoByAddress: t.prismaField({
    type: ["MrCrypto"],
    args: { address: t.arg.string({ required: true }) },
    resolve: (query, _parent, args) => {
      const address = getAddress(args.address);

      return prisma.mrCrypto.findMany({
        ...query,
        where: {
          Owner: {
            address,
          },
        },
      });
    },
  }),
  mrCryptoById: t.prismaField({
    type: "MrCrypto",
    args: { data: t.arg({ type: TokenIdInput, required: true }) },
    resolve: (query, _parent, args) => {
      return prisma.mrCrypto.findUniqueOrThrow({
        ...query,
        where: {
          tokenId: args.data.tokenId,
        },
      });
    },
  }),
}));
