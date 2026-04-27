import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "www");
const files = [
  "index.html",
  "app.js",
  "styles.css",
  "manifest.webmanifest",
  "sw.js"
];
const dirs = ["icons"];

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(outDir, file));
}

for (const dir of dirs) {
  await cp(join(root, dir), join(outDir, dir), { recursive: true });
}

console.log(
  `Copied ${files.length} files and ${dirs.length} directories to ${outDir}`
);
