import { query } from '../config/db.js';

/**
 * Study goal service
 * Handles study goal operations
 */

/**
 * Get user's study goal
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} Study goal or null if not found
 */
export const getGoal = async (userId) => {
  const result = await query(
    'SELECT user_id, weekly_goal_minutes FROM study_goal WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const goal = result.rows[0];
  return {
    userId: goal.user_id,
    weeklyGoalMinutes: goal.weekly_goal_minutes,
  };
};

/**
 * Set or update user's study goal
 * @param {number} userId - User ID
 * @param {number} weeklyGoalMinutes - Weekly goal in minutes
 * @returns {Promise<object>} Updated or created goal
 */
export const setGoal = async (userId, weeklyGoalMinutes) => {
  const result = await query(
    `INSERT INTO study_goal (user_id, weekly_goal_minutes)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET weekly_goal_minutes = $2
     RETURNING user_id, weekly_goal_minutes`,
    [userId, weeklyGoalMinutes]
  );

  const goal = result.rows[0];
  return {
    userId: goal.user_id,
    weeklyGoalMinutes: goal.weekly_goal_minutes,
  };
};

/**
 * Get user's progress towards weekly goal
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} Progress data or null if no goal set
 */
export const getGoalProgress = async (userId) => {
  // Get goal
  const goal = await getGoal(userId);
  if (!goal) {
    return null;
  }

  // Calculate minutes studied this week
  const result = await query(
    `SELECT COALESCE(SUM(actual_minutes), 0) as minutes_this_week
     FROM study_session
     WHERE user_id = $1
       AND session_timestamp >= date_trunc('week', CURRENT_TIMESTAMP)`,
    [userId]
  );

  const minutesThisWeek = parseInt(result.rows[0].minutes_this_week);
  const percentageComplete = Math.min(
    100,
    Math.round((minutesThisWeek / goal.weeklyGoalMinutes) * 100)
  );

  return {
    weeklyGoalMinutes: goal.weeklyGoalMinutes,
    minutesThisWeek,
    percentageComplete,
    isComplete: minutesThisWeek >= goal.weeklyGoalMinutes,
  };
};

/**
 * Delete user's study goal
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if goal was deleted
 */
export const deleteGoal = async (userId) => {
  const result = await query(
    'DELETE FROM study_goal WHERE user_id = $1 RETURNING user_id',
    [userId]
  );

  return result.rowCount > 0;
};
