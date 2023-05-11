import { builder } from "@/builder";
import "@/schema/mr-crypto";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { printSchema } from "graphql";

export const schema = builder.toSchema({});

writeFileSync(resolve(__dirname, "../../schema.graphql"), printSchema(schema));
