import { query } from '../config/db.js';

/**
 * User service
 * Handles user-related operations
 */

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} User object or null if not found
 */
export const getUserById = async (userId) => {
  const result = await query(
    'SELECT user_id, user_name FROM users WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    userId: user.user_id,
    userName: user.user_name,
  };
};

/**
 * Get user profile with stats
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} User profile with statistics
 */
export const getUserProfile = async (userId) => {
  // Get user basic info
  const userResult = await query(
    'SELECT user_id, user_name FROM users WHERE user_id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  // Get total sessions count
  const sessionsResult = await query(
    'SELECT COUNT(*) as total_sessions FROM study_session WHERE user_id = $1',
    [userId]
  );

  // Get total study minutes
  const minutesResult = await query(
    'SELECT COALESCE(SUM(actual_minutes), 0) as total_minutes FROM study_session WHERE user_id = $1',
    [userId]
  );

  const user = userResult.rows[0];
  return {
    userId: user.user_id,
    userName: user.user_name,
    totalSessions: parseInt(sessionsResult.rows[0].total_sessions),
    totalMinutes: parseInt(minutesResult.rows[0].total_minutes),
  };
};

/**
 * Check if user exists
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if user exists
 */
export const userExists = async (userId) => {
  const result = await query(
    'SELECT 1 FROM users WHERE user_id = $1',
    [userId]
  );
  return result.rows.length > 0;
};

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {object} updates - Profile updates
 * @returns {Promise<object|null>} Updated user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const { userName } = updates;

  // Check if new username is already taken by another user
  if (userName) {
    const existingUser = await query(
      'SELECT user_id FROM users WHERE user_name = $1 AND user_id != $2',
      [userName, userId]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error('Username already taken');
      error.code = '23505';
      throw error;
    }
  }

  const result = await query(
    'UPDATE users SET user_name = COALESCE($1, user_name) WHERE user_id = $2 RETURNING user_id, user_name',
    [userName || null, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    userId: user.user_id,
    userName: user.user_name,
  };
};
