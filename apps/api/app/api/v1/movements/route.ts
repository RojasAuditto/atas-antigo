import {
  handleDistributionRequest,
  readJsonBody,
} from "../../../../src/lib/distribution-http";
import { handleOptions, successResponse } from "../../../../src/lib/http";
import { movementRepository } from "../../../../src/repositories/movement-repository";
import {
  listMovements,
  registerMovement,
  resetRegisteredMovements,
} from "../../../../src/services/distribution-service";

const ROUTE = "/api/v1/movements";
const ALLOWED_METHODS = ["GET", "POST", "DELETE", "OPTIONS"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleDistributionRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) =>
    successResponse(await listMovements(movementRepository), requestId),
  );
}

export async function POST(request: Request): Promise<Response> {
  return handleDistributionRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) =>
    successResponse(
      await registerMovement(movementRepository, await readJsonBody(request)),
      requestId,
      201,
    ),
  );
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDistributionRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) =>
    successResponse(await resetRegisteredMovements(movementRepository), requestId),
  );
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request, ROUTE, ALLOWED_METHODS);
}

