import jwt from 'jsonwebtoken';
import { unauthorizedResponse } from '../utils/apiResponse.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      userName: decoded.userName,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expired');
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Does not fail if no token is provided, but validates if present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        userId: decoded.userId,
        userName: decoded.userName,
      };
    }

    next();
  } catch (error) {
    // Invalid token, but proceed without user info
    next();
  }
};
