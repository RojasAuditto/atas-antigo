import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "../..");
loadEnvConfig(workspaceRoot);

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingExcludes: {
    "/api/v1/origins": ["./src/data/profit-data.json"],
  },
};

export default nextConfig;
