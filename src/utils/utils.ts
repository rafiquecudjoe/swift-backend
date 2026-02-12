import { HttpStatus } from '@nestjs/common';
import { CaughtError, RequestResponse } from './entities/utils.entity';
import { Constants } from '../common/enums/generic.enum';

/**
 * Throws an HTTP exception with the given message and status code
 * @param message - Error message
 * @param statusCode - HTTP status code
 */
export function throwError(
  message: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): never {
  const error = new Error(message) as Error & { code?: number };
  error.code = statusCode;
  throw error;
}

/**
 * Generates a standardized success response
 */
export function generateSuccessResponse<T = unknown>(
  response: RequestResponse<T>,
) {
  return {
    status: response.statusCode,
    message: response.message,
    ...(response.data !== undefined && { data: response.data }),
  };
}

/**
 * Generates a standardized error response from caught errors
 */
export function generateErrorResponse(error: CaughtError) {
  if (!error.code || typeof error.code === 'string') {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: Constants.ServerError,
    };
  }
  return {
    status: error.code,
    message: error.message,
  };
}

/**
 * Excludes specified keys from an object
 * @param obj - Source object
 * @param keys - Keys to exclude
 * @returns New object without excluded keys
 */
export function exclude<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ── Query-parameter coercion helpers ──
// URL query params arrive as strings; these safely convert them to
// the types Prisma and business logic expect.

/**
 * Coerces a query-string value to a positive integer, with a
 * fallback and optional upper bound.
 */
export function toPositiveInt(
  value: unknown,
  fallback: number,
  max?: number,
): number {
  const n = Number(value);
  const result = Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
  return max !== undefined ? Math.min(result, max) : result;
}

/**
 * Coerces a query-string value to a boolean.
 * Accepts `true`, `'true'`, and `'1'` as truthy.
 */
export function toBool(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

/**
 * Derives `skip` and `take` from raw page/limit query values,
 * returning the coerced page & limit as well.
 */
export function paginationFromQuery(query: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number; skip: number } {
  const page = toPositiveInt(query.page, 1);
  const limit = toPositiveInt(query.limit, 10, 100);
  return { page, limit, skip: (page - 1) * limit };
}
