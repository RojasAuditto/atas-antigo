import { NextResponse } from "next/server";
import { z } from "zod";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const requestIdSchema = z.string().regex(REQUEST_ID_PATTERN);
const originSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username === "" &&
      url.password === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === ""
    );
  }, "A origem deve conter somente esquema e host")
  .transform((value) => new URL(value).origin);

const ALLOWED_HEADERS =
  "Authorization, Content-Type, Idempotency-Key, X-Request-Id";

interface RequestContext {
  requestId: string;
}

interface CorsDecision {
  allowed: boolean;
  headers: Headers;
}

type RouteHandler = (context: RequestContext) => Promise<Response> | Response;

export function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  return z
    .array(originSchema)
    .parse(value.split(",").map((origin) => origin.trim()));
}

export function getRequestId(headers: Headers): string {
  const candidate = headers.get("x-request-id");
  const parsed = requestIdSchema.safeParse(candidate);
  return parsed.success ? parsed.data : crypto.randomUUID();
}

export function isDevelopment(environment: string | undefined): boolean {
  return environment === "development";
}

export function resolveCors(
  origin: string | null,
  allowedOrigins: readonly string[],
  allowedMethods: readonly string[],
): CorsDecision {
  const headers = new Headers({
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": allowedMethods.join(", "),
    "Access-Control-Expose-Headers": "X-Request-Id",
    Vary: "Origin",
  });

  if (origin === null) return { allowed: true, headers };
  if (!allowedOrigins.includes(origin)) return { allowed: false, headers };

  headers.set("Access-Control-Allow-Origin", origin);
  return { allowed: true, headers };
}

export function successResponse<T>(
  data: T,
  requestId: string,
  status = 200,
): NextResponse {
  return NextResponse.json({ data, meta: { requestId } }, { status });
}

export function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  details?: readonly unknown[],
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
      requestId,
    },
    { status },
  );
}

export async function handleApiRequest(
  request: Request,
  route: string,
  allowedMethods: readonly string[],
  handler: RouteHandler,
): Promise<Response> {
  const requestId = getRequestId(request.headers);
  const cors = getCorsDecision(request, allowedMethods, requestId, route);

  if (cors instanceof Response) return cors;
  if (!cors.allowed) {
    return finalizeResponse(
      errorResponse(
        requestId,
        403,
        "CORS_ORIGIN_DENIED",
        "Origem não autorizada.",
      ),
      requestId,
      cors.headers,
    );
  }

  try {
    const response = await handler({ requestId });
    return finalizeResponse(response, requestId, cors.headers);
  } catch (error: unknown) {
    logUnexpectedError(requestId, route, error);
    return finalizeResponse(
      errorResponse(
        requestId,
        500,
        "INTERNAL_ERROR",
        "Não foi possível processar a solicitação.",
      ),
      requestId,
      cors.headers,
    );
  }
}

export async function handleOptions(
  request: Request,
  route: string,
  allowedMethods: readonly string[],
): Promise<Response> {
  return handleApiRequest(request, route, allowedMethods, () =>
    Promise.resolve(new Response(null, { status: 204 })),
  );
}

function getCorsDecision(
  request: Request,
  allowedMethods: readonly string[],
  requestId: string,
  route: string,
): CorsDecision | Response {
  try {
    return resolveCors(
      request.headers.get("origin"),
      parseAllowedOrigins(process.env.API_CORS_ALLOWED_ORIGINS),
      allowedMethods,
    );
  } catch (error: unknown) {
    logUnexpectedError(requestId, route, error);
    return finalizeResponse(
      errorResponse(
        requestId,
        503,
        "SERVICE_CONFIGURATION_ERROR",
        "Serviço temporariamente indisponível.",
      ),
      requestId,
      new Headers({ Vary: "Origin" }),
    );
  }
}

function finalizeResponse(
  response: Response,
  requestId: string,
  corsHeaders: Headers,
): Response {
  corsHeaders.forEach((value, key) => response.headers.set(key, value));
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Request-Id", requestId);
  return response;
}

function logUnexpectedError(
  requestId: string,
  route: string,
  error: unknown,
): void {
  console.error(
    JSON.stringify({
      level: "error",
      message: "Unhandled API error",
      requestId,
      route,
      errorType: error instanceof Error ? error.name : "UnknownError",
    }),
  );
}
