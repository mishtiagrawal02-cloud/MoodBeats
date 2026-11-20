import * as goalService from '../services/goal.service.js';
import { successResponse, notFoundResponse } from '../utils/apiResponse.js';

/**
 * Get user's study goal
 * GET /api/goals
 */
export const getGoal = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const goal = await goalService.getGoal(userId);

    if (!goal) {
      return notFoundResponse(res, 'No goal set for this user');
    }

    return successResponse(res, goal, 'Goal retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Set or update user's study goal
 * POST /api/goals
 */
export const setGoal = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { weeklyGoalMinutes } = req.body;

    const goal = await goalService.setGoal(userId, weeklyGoalMinutes);

    return successResponse(res, goal, 'Goal set successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's study goal
 * PUT /api/goals
 */
export const updateGoal = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { weeklyGoalMinutes } = req.body;

    const goal = await goalService.setGoal(userId, weeklyGoalMinutes);

    return successResponse(res, goal, 'Goal updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's progress towards weekly goal
 * GET /api/goals/progress
 */
export const getGoalProgress = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const progress = await goalService.getGoalProgress(userId);

    if (!progress) {
      return notFoundResponse(res, 'No goal set for this user');
    }

    return successResponse(res, progress, 'Goal progress retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user's study goal
 * DELETE /api/goals
 */
export const deleteGoal = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const deleted = await goalService.deleteGoal(userId);

    if (!deleted) {
      return notFoundResponse(res, 'No goal found to delete');
    }

    return successResponse(res, null, 'Goal deleted successfully');
  } catch (error) {
    next(error);
  }
};
