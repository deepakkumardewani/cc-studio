import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/bin.ts"],
    dts: false,
    fixedExtension: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
