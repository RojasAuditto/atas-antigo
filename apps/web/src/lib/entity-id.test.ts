import { describe, expect, it } from "vitest";
import { createEntityRouteId } from "./entity-id";

describe("createEntityRouteId", () => {
  it("creates a stable route id without exposing the source value", () => {
    const source = "123.456.789-00";
    const routeId = createEntityRouteId(source);

    expect(routeId).toBe(createEntityRouteId(source));
    expect(routeId).not.toContain("123");
  });
});
