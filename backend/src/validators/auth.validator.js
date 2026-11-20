import { z } from 'zod';

/**
 * Validation schemas for authentication endpoints
 */

/**
 * Schema for user registration
 */
export const createUserSchema = z.object({
  body: z.object({
    userName: z.string()
      .min(1, 'Username is required')
      .max(100, 'Username must not exceed 100 characters')
      .trim(),
  }),
});

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  body: z.object({
    userName: z.string()
      .min(1, 'Username is required')
      .trim(),
  }),
});

/**
 * Schema for user ID parameter
 */
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string()
      .regex(/^\d+$/, 'User ID must be a valid number')
      .transform(Number),
  }),
});

/**
 * Schema for updating user profile
 */
export const updateUserSchema = z.object({
  body: z.object({
    userName: z.string()
      .min(1, 'Username is required')
      .max(100, 'Username must not exceed 100 characters')
      .trim()
      .optional(),
  }),
});
