import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAudioName, getAudioGlyph, MOODS } from '../../utils/constants';
import { formatDurationLabel } from '../../utils/studyFormatting';
import {
  badgeEntry,
  staggerContainer,
  staggerItem,
  proceedButton
} from '../../utils/motionVariants';

function SessionCompleteCard({ receipt, onNewSession }) {
  const navigate = useNavigate();

  if (!receipt) return null;

  const { task, audio, mins, pre, post, taskCompletion, notes } = receipt;

  // Calculate deltas only when both values are present
  const focusDelta = (typeof post?.focus === 'number' && typeof pre?.focus === 'number')
    ? post.focus - pre.focus
    : null;
  const stressDelta = (typeof pre?.stress === 'number' && typeof post?.stress === 'number')
    ? pre.stress - post.stress
    : null;
  const moodDelta = (typeof post?.mood === 'number' && typeof pre?.mood === 'number')
    ? post.mood - pre.mood
    : null;

  const focusClass = focusDelta === null ? 'metric-neutral' : focusDelta > 0 ? 'metric-pos' : focusDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const stressClass = stressDelta === null ? 'metric-neutral' : stressDelta > 0 ? 'metric-pos' : stressDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const moodClass = moodDelta === null ? 'metric-neutral' : moodDelta > 0 ? 'metric-pos' : moodDelta < 0 ? 'metric-neg' : 'metric-neutral';

  return (
    <motion.div
      className="study-card-wrapper complete-celebration-card"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        className="celebration-badge"
        variants={badgeEntry}
        initial="hidden"
        animate="visible"
      >
        <i className="fas fa-check"></i>
      </motion.div>

      <motion.h2
        className="celebration-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        Study Session Saved!
      </motion.h2>
      <motion.p
        className="celebration-subtitle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        Your focus stats, daily streak, and weekly goal progress have been updated.
      </motion.p>

      {/* Overview Pill */}
      <motion.div
        className="receipt-pill-row"
        variants={staggerContainer(0.05, 0.2)}
        initial="hidden"
        animate="visible"
      >
        <motion.span className="receipt-pill" variants={staggerItem}>
          <i className="fas fa-book-open"></i> {task}
        </motion.span>
        <motion.span className="receipt-pill" variants={staggerItem}>
          <i className="far fa-clock"></i> {formatDurationLabel(mins)}
        </motion.span>
        <motion.span className="receipt-pill" variants={staggerItem}>
          <i className={`fas ${getAudioGlyph(audio)}`} aria-hidden="true" /> {getAudioName(audio)}
        </motion.span>
        <motion.span className="receipt-pill completion-tag" variants={staggerItem}>
          <i className="fas fa-circle-check"></i> {taskCompletion ? taskCompletion.replace('_', ' ') : 'Not specified'}
        </motion.span>
      </motion.div>

      {/* Delta Metric Cards */}
      <motion.div
        className="celebration-metrics-grid"
        variants={staggerContainer(0.08, 0.3)}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="delta-stat-card" variants={staggerItem}>
          <div className="delta-stat-icon">
            <i className="fas fa-brain"></i>
          </div>
          <span className={`delta-stat-value ${focusClass}`}>
            {focusDelta === null ? 'Not recorded' : focusDelta > 0 ? `+${focusDelta} pts` : focusDelta === 0 ? '0 pts' : `${focusDelta} pts`}
          </span>
          <span className="delta-stat-label">Focus Shift</span>
          <span className="delta-stat-sub">
            {typeof pre?.focus === 'number' && typeof post?.focus === 'number'
              ? `From ${pre.focus} to ${post.focus}`
              : 'Not recorded'}
          </span>
        </motion.div>

        <motion.div className="delta-stat-card" variants={staggerItem}>
          <div className="delta-stat-icon">
            <i className="fas fa-heart-pulse"></i>
          </div>
          <span className={`delta-stat-value ${stressClass}`}>
            {stressDelta === null ? 'Not recorded' : stressDelta > 0 ? `+${stressDelta} pts` : stressDelta === 0 ? '0 pts' : `${stressDelta} pts`}
          </span>
          <span className="delta-stat-label">Stress Relief</span>
          <span className="delta-stat-sub">
            {typeof pre?.stress === 'number' && typeof post?.stress === 'number'
              ? `From ${pre.stress} to ${post.stress}`
              : 'Not recorded'}
          </span>
        </motion.div>

        <motion.div className="delta-stat-card" variants={staggerItem}>
          <div className="delta-stat-icon">
            <i className="fas fa-face-smile"></i>
          </div>
          <span className={`delta-stat-value ${moodClass}`}>
            {moodDelta === null
              ? 'Not recorded'
              : `${MOODS[(post?.mood ?? 3) - 1] || '🙂'} ${moodDelta > 0 ? `+${moodDelta}` : moodDelta === 0 ? 'steady' : moodDelta}`}
          </span>
          <span className="delta-stat-label">Mood Change</span>
          <span className="delta-stat-sub">
            {typeof pre?.mood === 'number' && typeof post?.mood === 'number'
              ? `From ${MOODS[(pre.mood ?? 3) - 1]} to ${MOODS[(post.mood ?? 3) - 1]}`
              : 'Not recorded'}
          </span>
        </motion.div>
      </motion.div>

      {notes && (
        <motion.div
          className="receipt-notes-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
        >
          <span className="notes-heading"><i className="far fa-note-sticky"></i> Session Notes:</span>
          <p className="notes-body">{notes}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        className="celebration-actions"
        variants={staggerContainer(0.08, 0.5)}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
          variants={staggerItem}
          whileHover="hover"
          whileTap="tap"
          initial="rest"
          {...proceedButton}
        >
          <i className="fas fa-th-large"></i>
          <span>View on Dashboard</span>
        </motion.button>

        <motion.button
          type="button"
          className="btn btn-secondary"
          onClick={onNewSession}
          variants={staggerItem}
          whileHover="hover"
          whileTap="tap"
          initial="rest"
          {...proceedButton}
        >
          <i className="fas fa-plus"></i>
          <span>Start Another Session</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default SessionCompleteCard;
