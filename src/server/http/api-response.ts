import { ZodError } from "zod";

type ApiErrorCode =
  | "bad_request"
  | "internal_error"
  | "not_found"
  | "validation_error";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Invalid JSON request body.") {
    super(message, "bad_request", 400);
  }
}

export type IdRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export function apiData<T>(data: T, init?: ResponseInit) {
  return Response.json({ data }, init);
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError();
  }
}

export async function getRouteId(context: IdRouteContext) {
  const { id } = await context.params;

  return id;
}

export function ensureFound<T>(
  value: T | null | undefined,
  message = "Resource not found.",
) {
  if (!value) {
    throw new ApiError(message, "not_found", 404);
  }

  return value;
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Validation failed.", "validation_error", 400, {
      issues: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  if (error instanceof ApiError) {
    return apiError(error.message, error.code, error.status, error.details);
  }

  if (isPrismaRecordNotFoundError(error)) {
    return apiError("Resource not found.", "not_found", 404);
  }

  console.error(error);

  return apiError("Internal server error.", "internal_error", 500);
}

function apiError(
  message: string,
  code: ApiErrorCode,
  status: number,
  details?: unknown,
) {
  return Response.json(
    {
      error: {
        message,
        code,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

function isPrismaRecordNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}
