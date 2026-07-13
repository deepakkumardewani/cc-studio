import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = resolve(root, "../../web/dist");
const dest = resolve(root, "../web");

if (!existsSync(resolve(src, "index.html"))) {
  throw new Error(`Missing ${src}/index.html — build the web app first`);
}

rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`copied ${src} -> ${dest}`);
