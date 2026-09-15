import { z } from "zod";
import { catalogSchema, type Catalog } from "@/domain/schemas";

const catalogResponseSchema = z.object({
  data: catalogSchema,
  meta: z.object({ requestId: z.string() }),
});

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (reason: unknown) {
    throw new Error("A API retornou uma resposta inválida.", { cause: reason });
  }
}

export async function getCatalog(signal: AbortSignal): Promise<Catalog> {
  const response = await fetch(`${API_BASE_URL}/api/v1/origins`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = parseJson(await response.text());

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload);
    throw new Error(
      parsedError.success
        ? parsedError.data.error.message
        : "Não foi possível carregar as origens.",
    );
  }

  return catalogResponseSchema.parse(payload).data;
}
