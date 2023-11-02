import "viem";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { printSchema } from "graphql";

import { builder } from "@/builder";

import "@/schema/mr-crypto";
import "@/schema/e7l";
import "@/schema/holder";
import "@/schema/transactions";

export const schema = builder.toSchema({});

writeFileSync(resolve(__dirname, "../../schema.graphql"), printSchema(schema));
