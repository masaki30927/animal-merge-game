import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "www");
const files = ["index.html", "app.js", "styles.css"];

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

for (const file of files) {
  await cp(join(root, file), join(outDir, file));
}

console.log(`Copied ${files.length} web files to ${outDir}`);
