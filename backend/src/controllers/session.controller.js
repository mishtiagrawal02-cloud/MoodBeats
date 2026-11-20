import * as sessionService from '../services/session.service.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Create a new study session
 * POST /api/sessions
 */
export const createSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const sessionData = req.body;

    const session = await sessionService.createSession(userId, sessionData);

    return successResponse(res, session, 'Session created successfully', 201);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return errorResponse(res, 'Session ID already exists', 409);
    }
    next(error);
  }
};

/**
 * Complete a study session
 * PUT /api/sessions/:sessionId/complete
 */
export const completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params; // Already validated and transformed by Zod
    const { userId } = req.user;
    const completionData = req.body;

    const session = await sessionService.completeSession(
      sessionId,
      userId,
      completionData
    );

    return successResponse(res, session, 'Session completed successfully');
  } catch (error) {
    if (error.message.includes('not found')) {
      return notFoundResponse(res, 'Session not found or unauthorized');
    }
    next(error);
  }
};

/**
 * Get user's study sessions
 * GET /api/sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const sessions = await sessionService.getSessions(userId, limit, offset);

    return successResponse(res, {
      sessions,
      pagination: {
        limit,
        offset,
        count: sessions.length,
      },
    }, 'Sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single session by ID
 * GET /api/sessions/:sessionId
 */
export const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params; // Already validated and transformed by Zod
    const { userId } = req.user;

    const session = await sessionService.getSessionById(sessionId, userId);

    if (!session) {
      return notFoundResponse(res, 'Session not found');
    }

    return successResponse(res, session, 'Session retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get session history with filtering
 * GET /api/sessions/history
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      startDate,
      endDate,
      completionType,
      taskId,
      audioId,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    const filters = {
      startDate,
      endDate,
      completionType,
      taskId: taskId ? parseInt(taskId) : undefined,
      audioId,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await sessionService.getSessionHistory(userId, filters);

    return successResponse(res, result, 'Session history retrieved successfully');
  } catch (error) {
    next(error);
  }
};
