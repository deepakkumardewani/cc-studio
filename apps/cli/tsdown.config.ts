/**
 * Bundler config for the published CLI (`vp pack` / tsdown).
 * Runtime deps stay external (package.json dependencies); `schema` + `zod` are inlined.
 * Web assets are copied by `scripts/copy-web-dist.mjs` after pack.
 */
export default {
  entry: ["src/bin.ts"],
  format: ["esm"],
  platform: "node",
  outDir: "dist",
  clean: true,
  fixedExtension: true,
  dts: false,
  deps: {
    neverBundle: ["hono", "@hono/node-server", "open", "citty"],
  },
};
