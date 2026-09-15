import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { movementListSchema, type Movement } from "../domain/distribution-schemas";

export interface MovementRepository {
  list(): Promise<Movement[]>;
  replace(movements: readonly Movement[]): Promise<void>;
  update(transform: (current: readonly Movement[]) => readonly Movement[]): Promise<Movement[]>;
}

export class FileMovementRepository implements MovementRepository {
  private operation = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(): Promise<Movement[]> {
    await this.operation;
    return this.readCurrent();
  }

  async replace(movements: readonly Movement[]): Promise<void> {
    await this.update(() => movements);
  }

  async update(
    transform: (current: readonly Movement[]) => readonly Movement[],
  ): Promise<Movement[]> {
    let result: Movement[] = [];
    const write = this.operation.then(async () => {
      const current = await this.readCurrent();
      result = movementListSchema.parse(transform(current));
      await this.writeAtomically(result);
    });
    this.operation = write.catch(() => undefined);
    await write;
    return result;
  }

  private async readCurrent(): Promise<Movement[]> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(content);
      return movementListSchema.parse(parsed);
    } catch (error: unknown) {
      if (isMissingFile(error)) return [];
      throw error;
    }
  }

  private async writeAtomically(movements: readonly Movement[]): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(movements, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

const workspaceRoot = path.resolve(process.cwd(), "../..");
const configuredPath = process.env.PROFIT_MOVEMENTS_FILE?.trim() || ".data/movements.json";

export const movementRepository = new FileMovementRepository(
  path.resolve(/* turbopackIgnore: true */ workspaceRoot, configuredPath),
);
