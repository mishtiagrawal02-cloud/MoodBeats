import { z } from 'zod';

/**
 * Validation schemas for study session endpoints
 */

/**
 * Schema for creating a new study session
 * Includes session details and pre-study check-in data
 */
export const createSessionSchema = z.object({
  body: z.object({
    sessionId: z.number()
      .int()
      .positive('Session ID must be a positive integer'),
    taskId: z.number()
      .int()
      .positive('Task ID must be a positive integer'),
    audioId: z.string()
      .min(1, 'Audio ID is required')
      .max(20, 'Audio ID must not exceed 20 characters'),
    targetMinutes: z.number()
      .int()
      .min(1, 'Target minutes must be at least 1')
      .max(180, 'Target minutes must not exceed 180'),
    preMood: z.number()
      .int()
      .min(1, 'Pre-mood must be between 1 and 5')
      .max(5, 'Pre-mood must be between 1 and 5'),
    preStress: z.number()
      .int()
      .min(1, 'Pre-stress must be between 1 and 10')
      .max(10, 'Pre-stress must be between 1 and 10'),
    preFocus: z.number()
      .int()
      .min(1, 'Pre-focus must be between 1 and 10')
      .max(10, 'Pre-focus must be between 1 and 10'),
  }),
});

/**
 * Schema for completing a study session
 * Includes actual duration and post-study check-in data
 */
export const completeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string()
      .regex(/^\d+$/, 'Session ID must be a valid number')
      .transform(Number),
  }),
  body: z.object({
    actualMinutes: z.number()
      .int()
      .min(0, 'Actual minutes must be non-negative'),
    completionType: z.enum(['TIMER', 'EARLY'], {
      errorMap: () => ({ message: 'Completion type must be TIMER or EARLY' }),
    }),
    postMood: z.number()
      .int()
      .min(1, 'Post-mood must be between 1 and 5')
      .max(5, 'Post-mood must be between 1 and 5'),
    postStress: z.number()
      .int()
      .min(1, 'Post-stress must be between 1 and 10')
      .max(10, 'Post-stress must be between 1 and 10'),
    postFocus: z.number()
      .int()
      .min(1, 'Post-focus must be between 1 and 10')
      .max(10, 'Post-focus must be between 1 and 10'),
    taskCompletion: z.enum(['completed', 'partial', 'not_completed'], {
      errorMap: () => ({ message: 'Task completion must be completed, partial, or not_completed' }),
    }),
    notes: z.string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional()
      .nullable(),
  }),
});

/**
 * Schema for retrieving sessions with pagination
 */
export const getSessionsSchema = z.object({
  query: z.object({
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .optional(),
    offset: z.string()
      .regex(/^\d+$/, 'Offset must be a number')
      .transform(Number)
      .optional(),
  }),
});

/**
 * Schema for session ID parameter
 */
export const sessionIdParamSchema = z.object({
  params: z.object({
    sessionId: z.string()
      .regex(/^\d+$/, 'Session ID must be a valid number')
      .transform(Number),
  }),
});
