import { getAddress } from "viem";

import { builder } from "@/builder";
import { prisma } from "@/db";
import {
  BackgroundAttribute,
  ClothesAttribute,
  EyesAttribute,
  HeadwearAttribute,
  MoustacheAttribute,
  TypeAttribute,
} from "@/indexer/metadata/medatada-type";

builder.prismaObject("MrCrypto", {
  fields: (t) => ({
    tokenId: t.exposeInt("tokenId"),
    imageURL: t.exposeString("imageURL"),
    metadata: t.exposeString("metadataURL"),
    E7LTokens: t.relation("E7LTokensLinked"),
    Owner: t.relation("Owner"),
    Transfers: t.relation("Transfers", {
      query: { orderBy: { blockNumber: "desc" } },
    }),
    background: t.exposeString("attBackground"),
    clothes: t.exposeString("attClothes"),
    eyes: t.exposeString("attEyes"),
    headwear: t.exposeString("attHeadwear"),
    moustache: t.exposeString("attMoustache"),
    rarityRanking: t.exposeInt("rarityRanking"),
    rarityScore: t.exposeFloat("rarityScore"),
    type: t.exposeString("attType"),
  }),
});

builder.queryFields((t) => ({
  mrCryptosByAddress: t.prismaField({
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
    args: { tokenId: t.arg.int({ required: true }) },
    resolve: (query, _parent, args) => {
      return prisma.mrCrypto.findUniqueOrThrow({
        ...query,
        where: {
          tokenId: args.tokenId,
        },
      });
    },
  }),
}));

const HeadwearEnum = builder.enumType(HeadwearAttribute, { name: "Headwear" });
const TypeEnum = builder.enumType(TypeAttribute, { name: "Type" });
const EyesEnum = builder.enumType(EyesAttribute, { name: "Eye" });
const ClothesEnum = builder.enumType(ClothesAttribute, { name: "Clothes" });
const BackgroundEnum = builder.enumType(BackgroundAttribute, {
  name: "Background",
});
const MoustacheEnum = builder.enumType(MoustacheAttribute, {
  name: "Moustache",
});

builder.queryFields((t) => ({
  mrCryptoTokens: t.prismaField({
    type: ["MrCrypto"],
    args: {
      first: t.arg.int({ required: true, defaultValue: 100 }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      filter: t.arg({
        type: builder.inputType("MrCryptoFilter", {
          fields: (t) => ({
            headwear: t.field({ type: HeadwearEnum, required: false }),
            type: t.field({ type: TypeEnum, required: false }),
            background: t.field({ type: BackgroundEnum, required: false }),
            eye: t.field({ type: EyesEnum, required: false }),
            moustache: t.field({ type: MoustacheEnum, required: false }),
            clothes: t.field({ type: ClothesEnum, required: false }),
          }),
        }),
        required: false,
      }),
    },
    resolve: (query, _parent, args) => {
      return prisma.mrCrypto.findMany({
        ...query,
        ...(args.filter && {
          where: {
            ...(args.filter.headwear && { attHeadwear: args.filter.headwear }),
            ...(args.filter.type && { attType: args.filter.type }),
            ...(args.filter.clothes && { attClothes: args.filter.clothes }),
            ...(args.filter.eye && { attEyes: args.filter.eye }),
            ...(args.filter.moustache && {
              attMoustache: args.filter.moustache,
            }),
            ...(args.filter.background && {
              attBackground: args.filter.background,
            }),
          },
        }),
        skip: args.skip,
        take: args.first,
        orderBy: [{ tokenId: "asc" }],
      });
    },
  }),
}));
