import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourcePath = resolve("index.html");
const targetPath = resolve("apps/api/src/data/profit-data.json");
const source = await readFile(sourcePath, "utf8");
const match = source.match(/window\.POMIN_PROFIT_DATA\s*=\s*(\{.*\});/m);

if (!match?.[1]) {
  throw new Error("Dataset legado não encontrado em index.html.");
}

const parsed = JSON.parse(match[1]);

if (!parsed || !Array.isArray(parsed.origins) || typeof parsed.meta !== "object") {
  throw new Error("Dataset legado possui estrutura inválida.");
}

await mkdir(dirname(targetPath), { recursive: true });
await writeFile(targetPath, `${JSON.stringify(parsed)}\n`, "utf8");
process.stdout.write(`Dataset extraído com ${parsed.origins.length} origens.\n`);
