import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';

/**
 * Google OAuth 2.0 Service
 * Implements Authorization Code Flow with Google APIs
 */

/**
 * Build the Google OAuth 2.0 authorization URL
 * @param {string} state - Cryptographically random CSRF protection state
 * @returns {string} URL to redirect the user to Google
 */
export const getGoogleAuthUrl = (state) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    throw new Error('Google OAuth is not configured: GOOGLE_CLIENT_ID or GOOGLE_CALLBACK_URL is missing.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Exchange authorization code for Google access token & ID token
 * @param {string} code - Authorization code from callback
 * @returns {Promise<{ access_token: string, id_token?: string }>}
 */
export const exchangeCodeForTokens = async (code) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth credentials not configured on backend.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error_description || data.error || 'Failed to exchange code with Google';
    throw new Error(`Google token exchange error: ${errorMsg}`);
  }

  return data;
};

/**
 * Retrieve verified user profile from Google's UserInfo API
 * @param {string} accessToken - Google access token
 * @returns {Promise<{ id: string, email: string, name: string, picture: string }>}
 */
export const getGoogleUserProfile = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve user profile from Google UserInfo endpoint.');
  }

  const profile = await response.json();

  if (!profile.email) {
    throw new Error('Google account does not have an accessible email address.');
  }

  return {
    id: profile.sub,
    email: profile.email,
    name: profile.name || profile.email.split('@')[0],
    picture: profile.picture || null,
  };
};

/**
 * Find or create a user in PostgreSQL based on Google profile
 * Generates an application JWT for the session
 * @param {{ id: string, email: string, name: string, picture: string }} profile
 * @returns {Promise<{ user: object, token: string }>}
 */
export const findOrCreateGoogleUser = async (profile) => {
  const { id: googleId, email, name, picture } = profile;

  let user = null;

  try {
    // 1. Try matching by google_id
    const googleResult = await query(
      'SELECT user_id, user_name, email, google_id, avatar_url FROM users WHERE google_id = $1',
      [googleId]
    );

    if (googleResult.rows.length > 0) {
      user = googleResult.rows[0];

      // Update avatar if changed
      if (picture && user.avatar_url !== picture) {
        await query('UPDATE users SET avatar_url = $1 WHERE user_id = $2', [picture, user.user_id]);
        user.avatar_url = picture;
      }
    } else {
      // 2. Try matching by email to avoid duplicate account creation
      const emailResult = await query(
        'SELECT user_id, user_name, email, google_id, avatar_url FROM users WHERE email = $1',
        [email]
      );

      if (emailResult.rows.length > 0) {
        // Link existing user to Google account
        user = emailResult.rows[0];
        await query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE($2, avatar_url) WHERE user_id = $3',
          [googleId, picture, user.user_id]
        );
        user.google_id = googleId;
        user.avatar_url = picture || user.avatar_url;
      } else {
        // 3. Create new user record
        const insertResult = await query(
          `INSERT INTO users (user_name, email, google_id, avatar_url)
           VALUES ($1, $2, $3, $4)
           RETURNING user_id, user_name, email, google_id, avatar_url`,
          [name, email, googleId, picture]
        );
        user = insertResult.rows[0];
      }
    }
  } catch (err) {
    // Fallback if migration columns (email, google_id) are not yet present in users table
    if (err.code === '42703') { // undefined_column
      console.warn('[GoogleAuth] Google columns not found in users table. Falling back to username-only query.');
      let fallbackResult = await query(
        'SELECT user_id, user_name FROM users WHERE user_name = $1',
        [name]
      );

      if (fallbackResult.rows.length === 0) {
        fallbackResult = await query(
          'INSERT INTO users (user_name) VALUES ($1) RETURNING user_id, user_name',
          [name]
        );
      }
      user = fallbackResult.rows[0];
    } else {
      throw err;
    }
  }

  // Generate MoodBeats application JWT
  const token = jwt.sign(
    {
      userId: user.user_id,
      userName: user.user_name,
      email: user.email || null,
      avatarUrl: user.avatar_url || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );

  return {
    user: {
      userId: user.user_id,
      userName: user.user_name,
      email: user.email || null,
      avatarUrl: user.avatar_url || null,
    },
    token,
  };
};
