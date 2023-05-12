import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  bundle: true,
  minify: true,
  dts: true,
  clean: true,
  target: "node18",
  external: ["viem"],
});
