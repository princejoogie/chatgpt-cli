import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  minify: true,
  entry: ["./src/index.tsx"],
  format: ["esm"],
});
