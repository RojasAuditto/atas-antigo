import { describe, expect, it } from "vitest";

import {
  getRequestId,
  isDevelopment,
  parseAllowedOrigins,
  resolveCors,
} from "../src/lib/http";

describe("HTTP helpers", () => {
  it("normalizes configured origins and reflects only an allowed origin", () => {
    const allowed = parseAllowedOrigins(
      "http://localhost:5173/, https://app.example.com",
    );
    const cors = resolveCors(
      "https://app.example.com",
      allowed,
      ["GET", "OPTIONS"],
    );

    expect(allowed).toEqual([
      "http://localhost:5173",
      "https://app.example.com",
    ]);
    expect(cors.allowed).toBe(true);
    expect(cors.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://app.example.com",
    );
  });

  it("denies browser origins outside the allowlist", () => {
    const cors = resolveCors(
      "https://untrusted.example",
      ["https://app.example.com"],
      ["GET", "OPTIONS"],
    );

    expect(cors.allowed).toBe(false);
    expect(cors.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("replaces an unsafe request id", () => {
    const headers = new Headers({ "x-request-id": "invalid request id" });
    expect(getRequestId(headers)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("enables development-only resources only in development", () => {
    expect(isDevelopment("development")).toBe(true);
    expect(isDevelopment("test")).toBe(false);
    expect(isDevelopment("production")).toBe(false);
  });
});
