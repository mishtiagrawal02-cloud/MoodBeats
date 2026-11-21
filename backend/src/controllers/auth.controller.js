import crypto from 'crypto';
import * as authService from '../services/auth.service.js';
import * as googleAuthService from '../services/googleAuth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Parse raw Cookie header string into key-value map
 * @param {string} [cookieHeader]
 * @returns {Record<string, string>}
 */
const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts[0]?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
};

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

/**
 * Initiate Google OAuth 2.0 flow
 * GET /api/auth/google
 */
export const initiateGoogleAuth = async (req, res, next) => {
  try {
    // Generate secure anti-CSRF state token
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in an HTTP-only, secure cookie (valid for 10 minutes)
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    const authUrl = googleAuthService.getGoogleAuthUrl(state);
    return res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Google OAuth 2.0 callback
 * GET /api/auth/google/callback
 */
export const handleGoogleCallback = async (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    const { code, state, error: oauthError } = req.query;

    // Handle user cancellation / consent denied
    if (oauthError) {
      console.warn('[GoogleAuth] OAuth consent error:', oauthError);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(oauthError)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientUrl}/login?error=missing_callback_parameters`);
    }

    // Validate anti-CSRF state
    const cookies = parseCookies(req.headers.cookie);
    const storedState = cookies.oauth_state;

    // Clear state cookie
    res.clearCookie('oauth_state', { path: '/' });

    if (!storedState || storedState !== state) {
      console.error('[GoogleAuth] CSRF state mismatch or expired.');
      return res.redirect(`${clientUrl}/login?error=invalid_oauth_state`);
    }

    // Exchange authorization code for tokens
    const tokens = await googleAuthService.exchangeCodeForTokens(code);

    // Fetch user profile from Google
    const profile = await googleAuthService.getGoogleUserProfile(tokens.access_token);

    // Find or create user in PostgreSQL and sign application JWT
    const { token } = await googleAuthService.findOrCreateGoogleUser(profile);

    // Redirect to frontend callback route with application token
    return res.redirect(`${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('[GoogleAuth] Callback error:', error.message);
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message || 'authentication_failed')}`);
  }
};
