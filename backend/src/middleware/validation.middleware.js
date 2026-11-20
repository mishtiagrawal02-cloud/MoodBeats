/**
 * Validation middleware
 * Provides Zod schema validation for request data
 */

/**
 * Validation middleware wrapper
 * Validates request body, query, and params against a Zod schema
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Update request with validated and transformed data
    req.body = validated.body || req.body;
    req.query = validated.query || req.query;
    req.params = validated.params || req.params;

    next();
  } catch (error) {
    next(error);
  }
};
