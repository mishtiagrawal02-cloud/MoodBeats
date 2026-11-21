import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { createUserSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(createUserSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth 2.0 flow
 * @access  Public
 */
router.get('/google', authController.initiateGoogleAuth);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth 2.0 callback endpoint
 * @access  Public
 */
router.get('/google/callback', authController.handleGoogleCallback);

export default router;
