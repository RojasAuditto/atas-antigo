import { describe, expect, it } from "vitest";

import { GET as getHealth } from "../app/api/v1/health/route";
import { GET as getOrigins } from "../app/api/v1/origins/route";

describe("API routes", () => {
  it("returns a correlated health response", async () => {
    const requestId = "test-request-123";
    const response = await getHealth(
      new Request("http://localhost:3001/api/v1/health", {
        headers: { "x-request-id": requestId },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe(requestId);
    await expect(response.json()).resolves.toEqual({
      data: { status: "ok", service: "atas-e-lucros-api" },
      meta: { requestId },
    });
  });

  it("blocks local origins outside development with a safe envelope", async () => {
    const response = await getOrigins(
      new Request("http://localhost:3001/api/v1/origins"),
    );
    const body: unknown = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      error: {
        code: "ORIGINS_UNAVAILABLE",
        message: expect.any(String),
      },
      requestId: expect.any(String),
    });
    expect(JSON.stringify(body)).not.toContain("origins");
  });
});
