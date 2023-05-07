import {builder} from "@/builder"

builder.prismaObject("MrCrypto",{
  fields: (t) => ({
    tokenId : t.exposeInt("tokenId"),
    imageURL : t.exposeString("imageURL"),
    metadata : t.exposeString("metadataURl"),
    E7LTokens: t.relation("E7LTokensLinked"),
    Owner: t.relation("Owner"),
  })
})

builder.prismaObject("Holder", {
  fields: (t) => ({
    address: t.exposeString("address"),
    mrCryptosOwned: t.relation("MrCryptosOwned"),
  })
})

builder.prismaObject("E7LToken", {
  fields: (t) => ({
    mrCrypto: t.relation("MrCrypto"),})
})

builder.prismaObject("E7L", {
  fields: (t) => ({
    E7LTokens: t.relation("Tokens")})
})

