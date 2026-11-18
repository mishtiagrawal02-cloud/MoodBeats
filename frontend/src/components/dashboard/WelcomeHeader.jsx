import { motion } from 'framer-motion';

/**
 * WelcomeHeader: Premium personalized greeting with live clock and CTA.
 *
 * Features:
 * - Personalized greeting using actual username
 * - Live digital clock
 * - Current date
 * - Quick "Start Studying" action
 * - Demo data management
 */

function WelcomeHeader({
  userName = 'Study Companion',
  currentTime = new Date(),
  onStartStudy,
  hasDemoData = false,
  onRemoveDemoData
}) {
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      className="widget glass-panel welcome-widget"
      layout
    >
      <div className="welcome-content">
        <div className="welcome-greeting">
          <motion.h1
            className="welcome-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Welcome back, <span className="accent-name">{userName}</span>
          </motion.h1>
          <motion.p
            className="welcome-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Let's find your flow and make today productive.
          </motion.p>
        </div>

        <div className="welcome-clock">
          <div className="clock-display">
            <span className="clock-time">
              {hours}:{minutes}
            </span>
            <div className="clock-date-info">
              <div className="clock-day">{dayName}</div>
              <div className="clock-date">{dateStr}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-actions">
        {hasDemoData && (
          <motion.div
            className="demo-alert"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="demo-label">Showing demo data</span>
            <button
              type="button"
              className="demo-remove-btn"
              onClick={onRemoveDemoData}
              title="Remove demo data"
            >
              Clear
            </button>
          </motion.div>
        )}

        <motion.button
          type="button"
          className="btn-start-study"
          onClick={onStartStudy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-play"></i>
          <span>Start Studying</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default WelcomeHeader;
