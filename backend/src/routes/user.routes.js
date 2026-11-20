import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { userIdParamSchema, updateUserSchema } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, validate(updateUserSchema), userController.updateProfile);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:userId', authenticate, validate(userIdParamSchema), userController.getUser);

export default router;
