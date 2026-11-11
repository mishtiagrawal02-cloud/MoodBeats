import { useNavigate } from 'react-router-dom';
import { getAudioName, getAudioIcon, MOODS } from '../../utils/constants';

function SessionCompleteCard({ receipt, onNewSession }) {
  const navigate = useNavigate();

  if (!receipt) return null;

  const { task, audio, mins, pre, post, taskCompletion, notes } = receipt;

  const focusDelta = (post?.focus ?? 5) - (pre?.focus ?? 5);
  const stressDelta = (pre?.stress ?? 5) - (post?.stress ?? 5);
  const moodDelta = (post?.mood ?? 3) - (pre?.mood ?? 3);

  const focusClass = focusDelta > 0 ? 'metric-pos' : focusDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const stressClass = stressDelta > 0 ? 'metric-pos' : stressDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const moodClass = moodDelta > 0 ? 'metric-pos' : moodDelta < 0 ? 'metric-neg' : 'metric-neutral';

  return (
    <div className="study-card-wrapper complete-celebration-card">
      <div className="celebration-badge">
        <i className="fas fa-check"></i>
      </div>

      <h2 className="celebration-title">Study Session Saved!</h2>
      <p className="celebration-subtitle">
        Your focus stats, daily streak, and weekly goal progress have been updated.
      </p>

      {/* Overview Pill */}
      <div className="receipt-pill-row">
        <span className="receipt-pill">
          <i className="fas fa-book-open"></i> {task}
        </span>
        <span className="receipt-pill">
          <i className="far fa-clock"></i> {mins} minutes
        </span>
        <span className="receipt-pill">
          <span>{getAudioIcon(audio)}</span> {getAudioName(audio)}
        </span>
        <span className="receipt-pill completion-tag">
          <i className="fas fa-circle-check"></i> {taskCompletion?.replace('_', ' ')}
        </span>
      </div>

      {/* Delta Metric Cards */}
      <div className="celebration-metrics-grid">
        <div className="delta-stat-card">
          <div className="delta-stat-icon">
            <i className="fas fa-brain"></i>
          </div>
          <span className={`delta-stat-value ${focusClass}`}>
            {focusDelta > 0 ? `+${focusDelta}` : focusDelta} pts
          </span>
          <span className="delta-stat-label">Focus Shift</span>
          <span className="delta-stat-sub">From {pre?.focus} to {post?.focus}</span>
        </div>

        <div className="delta-stat-card">
          <div className="delta-stat-icon">
            <i className="fas fa-heart-pulse"></i>
          </div>
          <span className={`delta-stat-value ${stressClass}`}>
            {stressDelta > 0 ? `-${stressDelta}` : stressDelta < 0 ? `+${Math.abs(stressDelta)}` : '0'} pts
          </span>
          <span className="delta-stat-label">Stress Relief</span>
          <span className="delta-stat-sub">From {pre?.stress} to {post?.stress}</span>
        </div>

        <div className="delta-stat-card">
          <div className="delta-stat-icon">
            <i className="fas fa-face-smile"></i>
          </div>
          <span className={`delta-stat-value ${moodClass}`}>
            {MOODS[(post?.mood ?? 3) - 1] || '🙂'} {moodDelta > 0 ? `+${moodDelta}` : moodDelta === 0 ? 'steady' : moodDelta}
          </span>
          <span className="delta-stat-label">Mood Change</span>
          <span className="delta-stat-sub">From {MOODS[(pre?.mood ?? 3) - 1]} to {MOODS[(post?.mood ?? 3) - 1]}</span>
        </div>
      </div>

      {notes && (
        <div className="receipt-notes-card">
          <span className="notes-heading"><i className="far fa-note-sticky"></i> Session Notes:</span>
          <p className="notes-body">{notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="celebration-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-th-large"></i>
          <span>View on Dashboard</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onNewSession}
        >
          <i className="fas fa-plus"></i>
          <span>Start Another Session</span>
        </button>
      </div>
    </div>
  );
}

export default SessionCompleteCard;
