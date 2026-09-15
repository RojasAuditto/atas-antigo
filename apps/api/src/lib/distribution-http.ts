import { DistributionRuleError } from "../domain/movements";
import {
  errorResponse,
  handleApiRequest,
  isDevelopment,
} from "./http";

interface RequestContext {
  requestId: string;
}

type DistributionHandler = (context: RequestContext) => Promise<Response> | Response;

export function handleDistributionRequest(
  request: Request,
  route: string,
  allowedMethods: readonly string[],
  handler: DistributionHandler,
): Promise<Response> {
  return handleApiRequest(request, route, allowedMethods, async ({ requestId }) => {
    if (!isDevelopment(process.env.NODE_ENV)) {
      return errorResponse(
        requestId,
        503,
        "DISTRIBUTION_STORAGE_UNAVAILABLE",
        "Movimentacoes indisponiveis ate a configuracao do repositorio de producao.",
      );
    }

    try {
      return await handler({ requestId });
    } catch (error: unknown) {
      if (error instanceof DistributionRuleError) {
        return errorResponse(requestId, error.status, error.code, error.message, error.details);
      }
      throw error;
    }
  });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new DistributionRuleError(
      "INVALID_JSON",
      "O corpo da solicitacao deve conter JSON valido.",
      400,
    );
  }
}
