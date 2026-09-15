import { constants } from "node:fs";
import { access, copyFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const target = path.join(root, ".env");

try {
  await access(target, constants.F_OK);
  process.stdout.write(".env da raiz ja existe; nenhum arquivo foi alterado.\n");
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  await copyFile(path.join(root, ".env.example"), target, constants.COPYFILE_EXCL);
  process.stdout.write(".env criado na raiz a partir de .env.example.\n");
}
