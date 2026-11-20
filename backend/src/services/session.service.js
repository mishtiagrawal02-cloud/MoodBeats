import { query, getClient } from '../config/db.js';

/**
 * Study session service
 * Handles study session operations
 */

/**
 * Create a new study session
 * @param {number} userId - User ID
 * @param {object} sessionData - Session data
 * @returns {Promise<object>} Created session
 */
export const createSession = async (userId, sessionData) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Insert study session
    const sessionResult = await client.query(
      `INSERT INTO study_session
       (session_id, user_id, task_id, audio_id, session_timestamp, actual_minutes, target_minutes, completion_type)
       VALUES ($1, $2, $3, $4, NOW(), 0, $5, 'TIMER')
       RETURNING session_id, user_id, task_id, audio_id, session_timestamp, actual_minutes, target_minutes, completion_type`,
      [sessionData.sessionId, userId, sessionData.taskId, sessionData.audioId, sessionData.targetMinutes]
    );

    // Insert pre-check-in
    await client.query(
      `INSERT INTO pre_check_in (session_id, mood, stress, focus)
       VALUES ($1, $2, $3, $4)`,
      [sessionData.sessionId, sessionData.preMood, sessionData.preStress, sessionData.preFocus]
    );

    await client.query('COMMIT');

    const session = sessionResult.rows[0];
    return {
      sessionId: session.session_id,
      userId: session.user_id,
      taskId: session.task_id,
      audioId: session.audio_id,
      sessionTimestamp: session.session_timestamp,
      actualMinutes: session.actual_minutes,
      targetMinutes: session.target_minutes,
      completionType: session.completion_type,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Complete a study session
 * @param {number} sessionId - Session ID
 * @param {number} userId - User ID
 * @param {object} completionData - Completion data
 * @returns {Promise<object>} Updated session
 */
export const completeSession = async (sessionId, userId, completionData) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Update study session
    const sessionResult = await client.query(
      `UPDATE study_session
       SET actual_minutes = $1, completion_type = $2
       WHERE session_id = $3 AND user_id = $4
       RETURNING session_id, user_id, task_id, audio_id, session_timestamp, actual_minutes, target_minutes, completion_type`,
      [completionData.actualMinutes, completionData.completionType, sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error('Session not found or unauthorized');
    }

    // Insert post-check-in
    await client.query(
      `INSERT INTO post_check_in (session_id, mood, stress, focus, task_completion, notes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessionId,
        completionData.postMood,
        completionData.postStress,
        completionData.postFocus,
        completionData.taskCompletion,
        completionData.notes || null,
      ]
    );

    await client.query('COMMIT');

    const session = sessionResult.rows[0];
    return {
      sessionId: session.session_id,
      userId: session.user_id,
      taskId: session.task_id,
      audioId: session.audio_id,
      sessionTimestamp: session.session_timestamp,
      actualMinutes: session.actual_minutes,
      targetMinutes: session.target_minutes,
      completionType: session.completion_type,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user's study sessions
 * @param {number} userId - User ID
 * @param {number} limit - Number of sessions to retrieve
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of sessions
 */
export const getSessions = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT
       ss.session_id, ss.user_id, ss.task_id, ss.audio_id,
       ss.session_timestamp, ss.actual_minutes, ss.target_minutes, ss.completion_type,
       st.task_name,
       at.audio_name,
       pre.mood as pre_mood, pre.stress as pre_stress, pre.focus as pre_focus,
       post.mood as post_mood, post.stress as post_stress, post.focus as post_focus,
       post.task_completion, post.notes
     FROM study_session ss
     JOIN study_task st ON ss.task_id = st.task_id
     JOIN audio_type at ON ss.audio_id = at.audio_id
     LEFT JOIN pre_check_in pre ON ss.session_id = pre.session_id
     LEFT JOIN post_check_in post ON ss.session_id = post.session_id
     WHERE ss.user_id = $1
     ORDER BY ss.session_timestamp DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows.map(row => ({
    sessionId: row.session_id,
    userId: row.user_id,
    taskId: row.task_id,
    taskName: row.task_name,
    audioId: row.audio_id,
    audioName: row.audio_name,
    sessionTimestamp: row.session_timestamp,
    actualMinutes: row.actual_minutes,
    targetMinutes: row.target_minutes,
    completionType: row.completion_type,
    preCheckIn: row.pre_mood ? {
      mood: row.pre_mood,
      stress: row.pre_stress,
      focus: row.pre_focus,
    } : null,
    postCheckIn: row.post_mood ? {
      mood: row.post_mood,
      stress: row.post_stress,
      focus: row.post_focus,
      taskCompletion: row.task_completion,
      notes: row.notes,
    } : null,
  }));
};

/**
 * Get a single session by ID
 * @param {number} sessionId - Session ID
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} Session or null if not found
 */
export const getSessionById = async (sessionId, userId) => {
  const result = await query(
    `SELECT
       ss.session_id, ss.user_id, ss.task_id, ss.audio_id,
       ss.session_timestamp, ss.actual_minutes, ss.target_minutes, ss.completion_type,
       st.task_name,
       at.audio_name,
       pre.mood as pre_mood, pre.stress as pre_stress, pre.focus as pre_focus,
       post.mood as post_mood, post.stress as post_stress, post.focus as post_focus,
       post.task_completion, post.notes
     FROM study_session ss
     JOIN study_task st ON ss.task_id = st.task_id
     JOIN audio_type at ON ss.audio_id = at.audio_id
     LEFT JOIN pre_check_in pre ON ss.session_id = pre.session_id
     LEFT JOIN post_check_in post ON ss.session_id = post.session_id
     WHERE ss.session_id = $1 AND ss.user_id = $2`,
    [sessionId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    taskId: row.task_id,
    taskName: row.task_name,
    audioId: row.audio_id,
    audioName: row.audio_name,
    sessionTimestamp: row.session_timestamp,
    actualMinutes: row.actual_minutes,
    targetMinutes: row.target_minutes,
    completionType: row.completion_type,
    preCheckIn: row.pre_mood ? {
      mood: row.pre_mood,
      stress: row.pre_stress,
      focus: row.pre_focus,
    } : null,
    postCheckIn: row.post_mood ? {
      mood: row.post_mood,
      stress: row.post_stress,
      focus: row.post_focus,
      taskCompletion: row.task_completion,
      notes: row.notes,
    } : null,
  };
};

/**
 * Get session history with filtering and pagination
 * @param {number} userId - User ID
 * @param {object} filters - Filter options
 * @returns {Promise<object>} Sessions with pagination metadata
 */
export const getSessionHistory = async (userId, filters = {}) => {
  const {
    startDate,
    endDate,
    completionType,
    taskId,
    audioId,
    sortBy = 'session_timestamp',
    sortOrder = 'DESC',
    limit = 20,
    offset = 0,
  } = filters;

  // Build WHERE clause dynamically
  const conditions = ['ss.user_id = $1'];
  const params = [userId];
  let paramCount = 1;

  if (startDate) {
    paramCount++;
    conditions.push(`ss.session_timestamp >= $${paramCount}`);
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    conditions.push(`ss.session_timestamp <= $${paramCount}`);
    params.push(endDate);
  }

  if (completionType) {
    paramCount++;
    conditions.push(`ss.completion_type = $${paramCount}`);
    params.push(completionType);
  }

  if (taskId) {
    paramCount++;
    conditions.push(`ss.task_id = $${paramCount}`);
    params.push(taskId);
  }

  if (audioId) {
    paramCount++;
    conditions.push(`ss.audio_id = $${paramCount}`);
    params.push(audioId);
  }

  // Only allow safe column names for sorting - use exact column mapping
  const sortColumnMap = {
    'session_timestamp': 'ss.session_timestamp',
    'actual_minutes': 'ss.actual_minutes',
    'target_minutes': 'ss.target_minutes',
  };

  const safeSortColumn = sortColumnMap[sortBy] || 'ss.session_timestamp';
  const safeSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM study_session ss
     WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get sessions
  paramCount++;
  params.push(limit);
  paramCount++;
  params.push(offset);

  const sessionsResult = await query(
    `SELECT
       ss.session_id, ss.user_id, ss.task_id, ss.audio_id,
       ss.session_timestamp, ss.actual_minutes, ss.target_minutes, ss.completion_type,
       st.task_name,
       at.audio_name,
       pre.mood as pre_mood, pre.stress as pre_stress, pre.focus as pre_focus,
       post.mood as post_mood, post.stress as post_stress, post.focus as post_focus,
       post.task_completion, post.notes
     FROM study_session ss
     JOIN study_task st ON ss.task_id = st.task_id
     JOIN audio_type at ON ss.audio_id = at.audio_id
     LEFT JOIN pre_check_in pre ON ss.session_id = pre.session_id
     LEFT JOIN post_check_in post ON ss.session_id = post.session_id
     WHERE ${whereClause}
     ORDER BY ${safeSortColumn} ${safeSortOrder}
     LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
    params
  );

  const sessions = sessionsResult.rows.map(row => ({
    sessionId: row.session_id,
    userId: row.user_id,
    taskId: row.task_id,
    taskName: row.task_name,
    audioId: row.audio_id,
    audioName: row.audio_name,
    sessionTimestamp: row.session_timestamp,
    actualMinutes: row.actual_minutes,
    targetMinutes: row.target_minutes,
    completionType: row.completion_type,
    preCheckIn: row.pre_mood ? {
      mood: row.pre_mood,
      stress: row.pre_stress,
      focus: row.pre_focus,
    } : null,
    postCheckIn: row.post_mood ? {
      mood: row.post_mood,
      stress: row.post_stress,
      focus: row.post_focus,
      taskCompletion: row.task_completion,
      notes: row.notes,
    } : null,
  }));

  return {
    sessions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};
