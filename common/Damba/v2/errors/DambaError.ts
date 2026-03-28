/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Base error class for all Damba framework errors.
 * Carries an HTTP status code, a machine-readable error code, and optional details.
 */
export class DambaError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: any,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      ok: false,
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

// ─── 400 ────────────────────────────────────────────────────────────────────

export class BadRequestError extends DambaError {
  constructor(message = "Bad request", code = "BAD_REQUEST", details?: any) {
    super(message, 400, code, details);
  }
}

export class ValidationError extends DambaError {
  constructor(
    message = "Validation failed",
    details?: any,
    code = "VALIDATION_ERROR",
  ) {
    super(message, 400, code, details);
  }
}

// ─── 401 ────────────────────────────────────────────────────────────────────

export class UnauthorizedError extends DambaError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED", details?: any) {
    super(message, 401, code, details);
  }
}

// ─── 403 ────────────────────────────────────────────────────────────────────

export class ForbiddenError extends DambaError {
  constructor(message = "Forbidden", code = "FORBIDDEN", details?: any) {
    super(message, 403, code, details);
  }
}

// ─── 404 ────────────────────────────────────────────────────────────────────

export class NotFoundError extends DambaError {
  constructor(
    message = "Resource not found",
    code = "NOT_FOUND",
    details?: any,
  ) {
    super(message, 404, code, details);
  }
}

// ─── 409 ────────────────────────────────────────────────────────────────────

export class ConflictError extends DambaError {
  constructor(message = "Conflict", code = "CONFLICT", details?: any) {
    super(message, 409, code, details);
  }
}

// ─── 422 ────────────────────────────────────────────────────────────────────

export class UnprocessableError extends DambaError {
  constructor(
    message = "Unprocessable entity",
    code = "UNPROCESSABLE_ENTITY",
    details?: any,
  ) {
    super(message, 422, code, details);
  }
}

// ─── 429 ────────────────────────────────────────────────────────────────────

export class TooManyRequestsError extends DambaError {
  constructor(
    message = "Too many requests",
    code = "TOO_MANY_REQUESTS",
    details?: any,
  ) {
    super(message, 429, code, details);
  }
}

// ─── 500 ────────────────────────────────────────────────────────────────────

export class InternalError extends DambaError {
  constructor(
    message = "Internal server error",
    code = "INTERNAL_ERROR",
    details?: any,
  ) {
    super(message, 500, code, details, false);
  }
}

// ─── 503 ────────────────────────────────────────────────────────────────────

export class ServiceUnavailableError extends DambaError {
  constructor(
    message = "Service unavailable",
    code = "SERVICE_UNAVAILABLE",
    details?: any,
  ) {
    super(message, 503, code, details);
  }
}
