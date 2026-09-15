import {
  handleApiRequest,
  handleOptions,
  successResponse,
} from "../../../../src/lib/http";

const ROUTE = "/api/v1/health";
const ALLOWED_METHODS = ["GET", "OPTIONS"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleApiRequest(request, ROUTE, ALLOWED_METHODS, ({ requestId }) =>
    successResponse(
      { status: "ok", service: "atas-e-lucros-api" },
      requestId,
    ),
  );
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request, ROUTE, ALLOWED_METHODS);
}
