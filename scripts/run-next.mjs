import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import process, { loadEnvFile } from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const environmentFile = path.join(root, ".env");
await access(environmentFile);
loadEnvFile(environmentFile);

const command = process.argv[2];
if (command !== "dev" && command !== "start") {
  throw new Error("Use run-next.mjs com o comando dev ou start.");
}

const port = parsePort(process.env.API_PORT, 3011);
const nextBinary = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBinary, command, "--port", String(port)], {
  cwd: path.join(root, "apps", "api"),
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  process.stderr.write(`Falha ao iniciar o Next: ${error.message}\n`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal === null ? 1 : 0);
});

function parsePort(value, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error("API_PORT deve ser uma porta TCP valida.");
  }
  return parsed;
}
