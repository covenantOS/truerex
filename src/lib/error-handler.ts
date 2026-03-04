/**
 * Centralized Error Handling Utility for TrueX API Routes
 * 
 * Provides:
 * - ApiError class for structured error responses
 * - errorHandler middleware for Next.js API routes
 * - tryCatch wrapper for cleaner async error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

/**
 * HTTP Status Codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * ApiError class for structured API errors
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create a JSON response from this error
   */
  toResponse(): NextResponse {
    const body: Record<string, unknown> = {
      error: this.message,
    };

    // Include details in development or when explicitly set
    if (this.details && process.env.NODE_ENV === "development") {
      body.details = this.details;
    }

    return NextResponse.json(body, { status: this.statusCode });
  }

  // Static factory methods for common errors

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, details);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(resource: string, id?: string): ApiError {
    const message = id 
      ? `${resource} with id '${id}' not found` 
      : `${resource} not found`;
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, details);
  }

  static unprocessable(message: string, details?: unknown): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
  }

  static internal(message: string = "Internal server error", details?: unknown): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, details, false);
  }

  static serviceUnavailable(message: string = "Service temporarily unavailable"): ApiError {
    return new ApiError(HttpStatus.SERVICE_UNAVAILABLE, message, undefined, false);
  }
}

/**
 * Error handler middleware for Next.js API routes
 * Catches errors and returns appropriate responses
 */
export function errorHandler(
  err: unknown,
  request: NextRequest
): NextResponse {
  // Log error for debugging
  console.error(`[${request.method}] ${request.url} Error:`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return new ApiError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      "Validation failed",
      err.errors
    ).toResponse();
  }

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return err.toResponse();
  }

  // Handle known operational errors
  if (err instanceof Error) {
    // Check for common Supabase errors
    if (err.message.includes("row-level security") || err.message.includes("RLS")) {
      return ApiError.forbidden("You don't have permission to perform this action").toResponse();
    }

    if (err.message.includes("duplicate key") || err.message.includes("unique constraint")) {
      return ApiError.conflict("A record with this information already exists").toResponse();
    }

    if (err.message.includes("foreign key constraint")) {
      return ApiError.badRequest("Referenced record does not exist").toResponse();
    }

    // Generic operational error
    return ApiError.internal("An error occurred while processing your request", {
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    }).toResponse();
  }

  // Handle unknown errors
  console.error("Unknown error type:", typeof err);
  return ApiError.internal("An unexpected error occurred").toResponse();
}

/**
 * tryCatch wrapper for cleaner async route handlers
 * 
 * @param handler - The async route handler function
 * @param options - Optional configuration
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return tryCatch(request, async (req) => {
 *     // Your logic here
 *     return NextResponse.json({ success: true });
 *   });
 * }
 * ```
 */
export function tryCatch(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    /** Custom error handler */
    onError?: (error: unknown) => NextResponse;
    /** Whether to include request info in error logs */
    logRequest?: boolean;
  }
): Promise<NextResponse> {
  const { onError, logRequest = true } = options || {};

  return handler(request)
    .catch((err) => {
      if (logRequest) {
        console.error(`[${request.method}] ${request.url} Error:`, err);
      }
      
      if (onError) {
        return onError(err);
      }
      
      return errorHandler(err, request);
    });
}

/**
 * Async tryCatch wrapper that returns [error, data] tuple
 * Useful for when you need more control over error handling
 * 
 * @param promise - The promise to execute
 * 
 * @example
 * ```typescript
 * const [error, data] = await tryCatchAsync(supabase.from('jobs').select('*'));
 * if (error) {
 *   // Handle error
 * }
 * ```
 */
export async function tryCatchAsync<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
}

/**
 * Validate request body with Zod schema
 * Throws ApiError with 422 if validation fails
 */
export function validateBody<T extends z.ZodType>(
  schema: T,
  body: unknown
): z.infer<T> {
  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw ApiError.unprocessable("Invalid request body", err.errors);
    }
    throw err;
  }
}

/**
 * Validate required fields in request
 * Throws ApiError with 400 if any field is missing
 */
export function validateRequired(
  body: unknown,
  fields: string[]
): void {
  if (!body || typeof body !== "object") {
    throw ApiError.badRequest("Request body is required");
  }

  const obj = body as Record<string, unknown>;
  const missing = fields.filter((field) => {
    const value = obj[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw ApiError.badRequest(`Missing required fields: ${missing.join(", ")}`);
  }
}

/**
 * Auth helper - verifies user is authenticated
 * Throws ApiError with 401 if not authenticated
 */
export async function requireAuth(supabase: ReturnType<typeof import("@/lib/supabase/server").createClient>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw ApiError.unauthorized();
  }

  return user.id;
}
