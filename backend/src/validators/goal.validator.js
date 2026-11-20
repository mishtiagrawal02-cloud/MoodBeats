import { z } from 'zod';

/**
 * Validation schemas for study goal endpoints
 */

/**
 * Schema for creating or updating a weekly study goal
 * Used for both POST and PUT /api/goals
 */
export const goalSchema = z.object({
  body: z.object({
    weeklyGoalMinutes: z.number()
      .int('Weekly goal must be an integer')
      .positive('Weekly goal must be greater than 0'),
  }),
});
