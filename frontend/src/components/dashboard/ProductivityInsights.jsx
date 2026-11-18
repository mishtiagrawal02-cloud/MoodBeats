import { motion } from 'framer-motion';

/**
 * ProductivityInsights: Floating widget showing today's study metrics.
 *
 * Data pulled from useDashboardStats:
 * - Study time
 * - Completed sessions
 * - Current streak
 * - Weekly progress
 *
 * All values are calculated from real session data in LocalStorage.
 */

function ProductivityInsights({ stats = {} }) {
  const {
    totalMins = 0,
    completedSessions = 0,
    streak = 0,
    weekMins = 0,
    goalMinutes = 150,
    _goalPercent = 0
  } = stats;

  const formatTime = (mins) => {
    if (mins === 0) return '0 min';
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (hours === 0) return `${remaining}m`;
    return `${hours}h ${remaining}m`;
  };

  const weekProgress = goalMinutes > 0 ? Math.min(100, (weekMins / goalMinutes) * 100) : 0;

  return (
    <motion.div
      className="widget glass-panel insights-widget"
      layout
    >
      <div className="widget-header">
        <div className="widget-title-section">
          <span className="widget-icon">📊</span>
          <div>
            <h3 className="widget-title">Today's Progress</h3>
            <p className="widget-subtitle">Real-time analytics</p>
          </div>
        </div>
      </div>

      <div className="insights-metrics">
        {/* Study Time */}
        <div className="metric-item">
          <span className="metric-label">Study Time</span>
          <motion.span
            className="metric-value"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatTime(totalMins)}
          </motion.span>
        </div>

        {/* Completed Sessions */}
        <div className="metric-item">
          <span className="metric-label">Sessions</span>
          <motion.span
            className="metric-value"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {completedSessions}
          </motion.span>
        </div>

        {/* Streak */}
        <div className="metric-item">
          <span className="metric-label">Streak</span>
          <motion.span
            className={`metric-value ${streak > 0 ? 'streak-active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {streak} {streak === 1 ? 'day' : 'days'}
          </motion.span>
        </div>

        {/* Weekly Goal Progress */}
        <div className="metric-item">
          <span className="metric-label">Weekly Goal</span>
          <div className="progress-display">
            <span className="progress-value">{weekMins}min / {goalMinutes}min</span>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${weekProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="progress-percent">{Math.round(weekProgress)}%</span>
          </div>
        </div>
      </div>

      {completedSessions > 0 && (
        <div className="insights-footer">
          <span className="footer-label">Total sessions completed</span>
          <span className="footer-value">{completedSessions}</span>
        </div>
      )}
    </motion.div>
  );
}

export default ProductivityInsights;
