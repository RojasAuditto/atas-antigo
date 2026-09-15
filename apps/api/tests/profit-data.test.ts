import { describe, expect, it } from "vitest";
import path from "node:path";

import { readProfitData } from "../src/lib/profit-data";

describe("profit data", () => {
  it("loads a valid local dataset", async () => {
    const fixture = path.join(process.cwd(), "tests", "fixtures", "profit-data.json");
    const data = await readProfitData(fixture);
    expect(data.meta.validOrigins).toBe(1);
    expect(data.origins).toHaveLength(1);
  });
});
