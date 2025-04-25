import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  format: ["esm"],
  minify: true,
  sourcemap: typeof options.env === "string" && options.env === "production" ? "inline" : true,
  watch: options.watch,
}));
