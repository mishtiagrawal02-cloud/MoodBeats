import * as userService from '../services/user.service.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const profile = await userService.getUserProfile(userId);

    if (!profile) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:userId
 */
export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params; // Already validated and transformed by Zod

    const user = await userService.getUserById(userId);

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's profile
 * PUT /api/users/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const updates = req.body;

    const updatedUser = await userService.updateUserProfile(userId, updates);

    if (!updatedUser) {
      return notFoundResponse(res, 'User not found');
    }

    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    if (error.code === '23505') {
      return errorResponse(res, 'Username already taken', 409);
    }
    next(error);
  }
};
