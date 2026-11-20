import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global error handling middleware
 * This should be registered last in the middleware chain
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    const validationErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    return errorResponse(res, 'Validation failed', 422, validationErrors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return errorResponse(res, 'Duplicate entry', 409);

      case '23503': // Foreign key violation
        return errorResponse(res, 'Referenced resource does not exist', 400);

      case '23502': // Not null violation
        return errorResponse(res, 'Required field is missing', 400);

      case '22P02': // Invalid text representation
        return errorResponse(res, 'Invalid data format', 400);

      default:
        console.error('Unhandled database error:', err.code, err.message);
    }
  }

  // Custom application errors
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // Default to 500 server error
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Create a custom application error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
