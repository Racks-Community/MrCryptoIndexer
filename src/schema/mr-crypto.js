"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var builder_1 = require("@/builder");
var db_1 = require("@/db");
var viem_1 = require("viem");
builder_1.builder.prismaObject("MrCrypto", {
    fields: function (t) { return ({
        tokenId: t.exposeInt("tokenId"),
        imageURL: t.exposeString("imageURL"),
        metadata: t.exposeString("metadataURL"),
        E7LTokens: t.relation("E7LTokensLinked"),
        Owner: t.relation("Owner"),
    }); },
});
builder_1.builder.prismaObject("Holder", {
    fields: function (t) { return ({
        address: t.exposeString("address"),
        mrCryptosOwned: t.relation("MrCryptosOwned"),
    }); },
});
builder_1.builder.prismaObject("E7LToken", {
    fields: function (t) { return ({
        mrCrypto: t.relation("MrCrypto"),
        E7L: t.relation("E7L"),
        toeknId: t.exposeInt("e7lTokenId"),
        imageURL: t.exposeString("imageURL"),
        metadata: t.exposeString("metadataURL"),
    }); },
});
builder_1.builder.prismaObject("E7L", {
    fields: function (t) { return ({
        E7LTokens: t.relation("Tokens"),
        name: t.exposeString("name"),
    }); },
});
var AddressInput = builder_1.builder.inputType("AddressInput", {
    fields: function (t) { return ({
        address: t.string({ required: true }),
    }); },
});
builder_1.builder.queryFields(function (t) { return ({
    mrCryptoByAddress: t.prismaField({
        type: ["MrCrypto"],
        args: { data: t.arg({ type: AddressInput, required: true }) },
        resolve: function (query, _parent, args) {
            var address = (0, viem_1.getAddress)(args.data.address);
            return db_1.prisma.mrCrypto.findMany(__assign(__assign({}, query), { where: {
                    Owner: {
                        address: address,
                    },
                } }));
        },
    }),
}); });
var TokenIdInput = builder_1.builder.inputType("TokenIdInput", {
    fields: function (t) { return ({
        tokenId: t.int({ required: true }),
    }); },
});
builder_1.builder.queryFields(function (t) { return ({
    mrCryptoById: t.prismaField({
        type: "MrCrypto",
        args: { data: t.arg({ type: TokenIdInput, required: true }) },
        resolve: function (query, _parent, args) {
            return db_1.prisma.mrCrypto.findUnique(__assign(__assign({}, query), { where: {
                    tokenId: args.data.tokenId,
                } }));
        },
    }),
}); });
