import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { userName } = req.body;

    const result = await authService.createUser(userName);

    return successResponse(res, result, 'User created successfully', 201);
  } catch (error) {
    if (error.code === '23505') {
      return errorResponse(res, 'Username already exists', 409);
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { userName } = req.body;

    const result = await authService.loginUser(userName);

    return successResponse(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};
