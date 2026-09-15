import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import process, { loadEnvFile } from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const environmentFile = path.join(root, ".env");
await access(environmentFile);
loadEnvFile(environmentFile);

const apiPort = parsePort(process.env.API_PORT, 3011, "API_PORT");
const processes = [
  spawn(
    process.execPath,
    [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--port", String(apiPort)],
    { cwd: path.join(root, "apps", "api"), env: process.env, stdio: "inherit" },
  ),
  spawn(
    process.execPath,
    [path.join(root, "node_modules", "vite", "bin", "vite.js")],
    { cwd: path.join(root, "apps", "web"), env: process.env, stdio: "inherit" },
  ),
];

let stopping = false;

function stop(exitCode, signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of processes) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  }
  process.exitCode = exitCode;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => stop(0, signal));
}

for (const child of processes) {
  child.on("error", (error) => {
    process.stderr.write(`Falha ao iniciar um servidor: ${error.message}\n`);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) stop(code ?? (signal === null ? 1 : 0));
  });
}

function parsePort(value, fallback, name) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(`${name} deve ser uma porta TCP valida.`);
  }
  return parsed;
}
