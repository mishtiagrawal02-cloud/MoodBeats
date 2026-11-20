import express from 'express';
import * as goalController from '../controllers/goal.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { goalSchema } from '../validators/goal.validator.js';

const router = express.Router();

/**
 * @route   GET /api/goals
 * @desc    Get user's study goal
 * @access  Private
 */
router.get('/', authenticate, goalController.getGoal);

/**
 * @route   POST /api/goals
 * @desc    Set or update user's study goal
 * @access  Private
 */
router.post('/', authenticate, validate(goalSchema), goalController.setGoal);

/**
 * @route   PUT /api/goals
 * @desc    Update user's study goal
 * @access  Private
 */
router.put('/', authenticate, validate(goalSchema), goalController.updateGoal);

/**
 * @route   GET /api/goals/progress
 * @desc    Get user's goal progress
 * @access  Private
 */
router.get('/progress', authenticate, goalController.getGoalProgress);

/**
 * @route   DELETE /api/goals
 * @desc    Delete user's study goal
 * @access  Private
 */
router.delete('/', authenticate, goalController.deleteGoal);

export default router;
