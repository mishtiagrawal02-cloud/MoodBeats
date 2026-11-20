import express from 'express';
import * as sessionController from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createSessionSchema,
  completeSessionSchema,
  getSessionsSchema,
  sessionIdParamSchema
} from '../validators/session.validator.js';

const router = express.Router();

/**
 * @route   GET /api/sessions
 * @desc    Get user's study sessions
 * @access  Private
 */
router.get('/', authenticate, validate(getSessionsSchema), sessionController.getSessions);

/**
 * @route   GET /api/sessions/history
 * @desc    Get session history with filtering
 * @access  Private
 */
router.get('/history', authenticate, sessionController.getSessionHistory);

/**
 * @route   POST /api/sessions
 * @desc    Create a new study session
 * @access  Private
 */
router.post('/', authenticate, validate(createSessionSchema), sessionController.createSession);

/**
 * @route   GET /api/sessions/:sessionId
 * @desc    Get a single session by ID
 * @access  Private
 */
router.get('/:sessionId', authenticate, validate(sessionIdParamSchema), sessionController.getSession);

/**
 * @route   PUT /api/sessions/:sessionId/complete
 * @desc    Complete a study session
 * @access  Private
 */
router.put('/:sessionId/complete', authenticate, validate(completeSessionSchema), sessionController.completeSession);

export default router;
