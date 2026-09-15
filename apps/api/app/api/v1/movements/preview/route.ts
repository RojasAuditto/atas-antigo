import {
  handleDistributionRequest,
  readJsonBody,
} from "../../../../../src/lib/distribution-http";
import { handleOptions, successResponse } from "../../../../../src/lib/http";
import { movementRepository } from "../../../../../src/repositories/movement-repository";
import { previewMovement } from "../../../../../src/services/distribution-service";

const ROUTE = "/api/v1/movements/preview";
const ALLOWED_METHODS = ["POST", "OPTIONS"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleDistributionRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) =>
    successResponse(
      await previewMovement(movementRepository, await readJsonBody(request)),
      requestId,
    ),
  );
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request, ROUTE, ALLOWED_METHODS);
}

