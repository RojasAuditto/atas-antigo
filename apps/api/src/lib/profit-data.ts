import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  catalogSchema,
  type Catalog,
} from "../domain/distribution-schemas";

export type ProfitData = Catalog;

export async function readProfitData(
  filePath = path.join(process.cwd(), "src", "data", "profit-data.json"),
): Promise<ProfitData> {
  const content = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(content);
  return catalogSchema.parse(parsed);
}
