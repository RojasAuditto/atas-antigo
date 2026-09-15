import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, workspaceRoot, "");
  const apiPort = parsePort(environment.API_PORT, 3011, "API_PORT");
  const webPort = parsePort(environment.WEB_PORT, 5174, "WEB_PORT");

  return {
    envDir: workspaceRoot,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: {
      host: "127.0.0.1",
      port: webPort,
      strictPort: true,
      proxy: {
        "/api": {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
        },
      },
    },
  };
});

function parsePort(value: string | undefined, fallback: number, name: string): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(`${name} deve ser uma porta TCP válida.`);
  }
  return parsed;
}
