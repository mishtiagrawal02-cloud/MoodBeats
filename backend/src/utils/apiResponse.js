/**
 * Standard API response utilities
 */

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {object} errors - Validation or detailed errors
 */
export const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {object} res - Express response object
 * @param {object} errors - Validation errors from Zod or other validators
 */
export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 422, errors);
};

/**
 * Send an unauthorized response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

/**
 * Send a not found response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Send an internal server error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
export const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};
