import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';

/**
 * Authentication service
 * Handles user authentication and JWT token generation
 */

/**
 * Create a new user
 * @param {string} userName - Username for the new user
 * @returns {Promise<{user: object, token: string}>} Created user with JWT token
 * @throws {Error} If username already exists (error.code === '23505')
 */
export const createUser = async (userName) => {
  // Check if username already exists
  const existingUser = await query(
    'SELECT user_id FROM users WHERE user_name = $1',
    [userName]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error('Username already exists');
    error.code = '23505'; // Postgres unique violation code
    throw error;
  }

  const result = await query(
    'INSERT INTO users (user_name) VALUES ($1) RETURNING user_id, user_name',
    [userName]
  );

  const user = result.rows[0];
  const token = generateToken(user);

  return {
    user: {
      userId: user.user_id,
      userName: user.user_name,
    },
    token,
  };
};

/**
 * Login user (find or create)
 * @param {string} userName - Username to login with
 * @returns {Promise<{user: object, token: string}>} User with JWT token
 */
export const loginUser = async (userName) => {
  // Check if user exists
  let result = await query(
    'SELECT user_id, user_name FROM users WHERE user_name = $1',
    [userName]
  );

  let user;
  if (result.rows.length === 0) {
    // Create new user if doesn't exist
    result = await query(
      'INSERT INTO users (user_name) VALUES ($1) RETURNING user_id, user_name',
      [userName]
    );
    user = result.rows[0];
  } else {
    user = result.rows[0];
  }

  const token = generateToken(user);

  return {
    user: {
      userId: user.user_id,
      userName: user.user_name,
    },
    token,
  };
};

/**
 * Generate JWT token for a user
 * @param {object} user - User object with user_id and user_name
 * @returns {string} JWT token
 * @private
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      userName: user.user_name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};
