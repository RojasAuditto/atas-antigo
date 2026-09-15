import {
  handleDistributionRequest,
} from "../../../../../../src/lib/distribution-http";
import { handleOptions, successResponse } from "../../../../../../src/lib/http";
import { movementRepository } from "../../../../../../src/repositories/movement-repository";
import { reverseRegisteredMovement } from "../../../../../../src/services/distribution-service";

const ROUTE = "/api/v1/movements/{id}/reversal";
const ALLOWED_METHODS = ["POST", "OPTIONS"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return handleDistributionRequest(request, ROUTE, ALLOWED_METHODS, async ({ requestId }) => {
    const { id } = await context.params;
    return successResponse(
      await reverseRegisteredMovement(movementRepository, id),
      requestId,
    );
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request, ROUTE, ALLOWED_METHODS);
}

