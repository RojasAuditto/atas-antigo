import {
  errorResponse,
  handleApiRequest,
  handleOptions,
  isDevelopment,
  successResponse,
} from "../../../../src/lib/http";

const ROUTE = "/api/v1/origins";
const ALLOWED_METHODS = ["GET", "OPTIONS"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) => {
    if (!isDevelopment(process.env.NODE_ENV)) {
      return errorResponse(
        requestId,
        503,
        "ORIGINS_UNAVAILABLE",
        "Origens indisponíveis até a configuração de autenticação e dados.",
      );
    }

    const { readProfitData } = await import("../../../../src/lib/profit-data");
    return successResponse(await readProfitData(), requestId);
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request, ROUTE, ALLOWED_METHODS);
}
