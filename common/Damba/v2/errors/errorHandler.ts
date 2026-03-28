/* eslint-disable @typescript-eslint/no-explicit-any */

import { DambaError } from "./DambaError";

export interface DambaErrorHandlerOptions {
  /** Include stack traces in responses (default: false, enable in dev) */
  includeStack?: boolean;
  /** Custom logger — receives (error, req). Falls back to console.error */
  logger?: (error: any, req?: any) => void;
  /** Hook called before sending the response. Can mutate the body or return a replacement. */
  onError?: (error: any, req?: any) => void;
}

/**
 * Standardized JSON error response shape used by all Damba error responses.
 */
export interface DambaErrorResponse {
  ok: false;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Creates an Express error-handling middleware (4-arg signature).
 *
 * Usage:
 * ```ts
 * app.use(createErrorHandler({ includeStack: process.env.DEV === "true" }));
 * ```
 */
export const createErrorHandler = (options: DambaErrorHandlerOptions = {}) => {
  const {
    includeStack = false,
    logger = defaultLogger,
    onError,
  } = options;

  return (err: any, req: any, res: any, _next: any) => {
    // Don't write to an already-sent response
    if (res.headersSent) {
      return _next(err);
    }

    const { statusCode, body } = normalizeError(err, includeStack);

    // Log the error
    logger(err, req);

    // Optional hook
    if (onError) {
      try {
        onError(err, req);
      } catch {
        // swallow — don't let the hook crash the error handler
      }
    }

    return res.status(statusCode).json(body);
  };
};

/**
 * Normalizes any thrown value into a consistent { statusCode, body } shape.
 */
export const normalizeError = (
  err: any,
  includeStack = false
): { statusCode: number; body: DambaErrorResponse } => {
  // ── DambaError (our own hierarchy) ──
  if (err instanceof DambaError) {
    const body: DambaErrorResponse = {
      ok: false,
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
      ...(includeStack && err.stack ? { stack: err.stack } : {}),
    };
    return { statusCode: err.statusCode, body };
  }

  // ── Standard Error with a statusCode/status property (e.g. http-errors) ──
  if (err instanceof Error) {
    const status =
      (err as any).statusCode ?? (err as any).status ?? 500;
    const code =
      (err as any).code ?? (status < 500 ? "CLIENT_ERROR" : "INTERNAL_ERROR");

    const body: DambaErrorResponse = {
      ok: false,
      code,
      message: status < 500 ? err.message : "Internal server error",
      ...(includeStack && err.stack ? { stack: err.stack } : {}),
    };
    return { statusCode: status, body };
  }

  // ── Non-Error throw (string, object, etc.) ──
  const body: DambaErrorResponse = {
    ok: false,
    code: "INTERNAL_ERROR",
    message: typeof err === "string" ? err : "Internal server error",
  };
  return { statusCode: 500, body };
};

function defaultLogger(err: any, req?: any) {
  const method = req?.method ?? "?";
  const url = req?.originalUrl ?? req?.url ?? "?";

  // Operational errors (4xx, expected) get a warning-level log
  if (err instanceof DambaError && err.isOperational) {
    console.warn(
      `[Damba] ${err.statusCode} ${err.code} — ${method} ${url} — ${err.message}`
    );
    return;
  }

  // Unexpected errors get a full error log
  console.error(
    `[Damba] ERROR — ${method} ${url}`,
    err instanceof Error ? err.stack ?? err.message : err
  );
}