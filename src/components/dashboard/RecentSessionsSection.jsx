import { useNavigate } from 'react-router-dom';
import { getAudioName, getAudioIcon, getAudioColor } from '../../utils/constants';

function formatSessionDate(ts) {
  if (!ts) return 'Unknown date';
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function RecentSessionsSection({ sessions = [], onLoadDemoData }) {
  const navigate = useNavigate();

  return (
    <section className="dashboard-section-card recent-sessions-container" aria-label="Recent Study Sessions">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <i className="fas fa-history" style={{ color: 'var(--soft-lavender)' }}></i>
            Recent Study Sessions
          </h2>
          <p className="section-subtitle">
            Review your latest study sessions and observed cognitive shifts.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            type="button"
            className="link-view-all-btn"
            onClick={() => navigate('/sessions')}
          >
            <span>View All History</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state-container">
          <div className="empty-state-icon-glow">
            <i className="fas fa-headphones-alt"></i>
          </div>
          <h3 className="empty-state-heading">Your Study Journal Is Empty</h3>
          <p className="empty-state-copy">
            Begin your first study session with synthetic audio to log time, track focus improvements, and discover your ideal learning environment.
          </p>
          <div className="empty-state-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/study')}
            >
              <i className="fas fa-play"></i>
              <span>Start First Session</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary demo-load-trigger-btn"
              onClick={onLoadDemoData}
            >
              <i className="fas fa-flask"></i>
              <span>Load Demo Data (14 sessions)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => {
            const focusDelta = (session.post?.focus ?? 5) - (session.pre?.focus ?? 5);
            const stressDelta = (session.pre?.stress ?? 5) - (session.post?.stress ?? 5);
            const audioColor = getAudioColor(session.audio);
            const audioIcon = getAudioIcon(session.audio);
            const audioName = getAudioName(session.audio);

            const focusSign = focusDelta > 0 ? `+${focusDelta}` : `${focusDelta}`;
            const focusClass = focusDelta > 0 ? 'metric-pos' : focusDelta < 0 ? 'metric-neg' : 'metric-neutral';

            const stressText = stressDelta > 0 ? `-${stressDelta} stress` : stressDelta < 0 ? `+${Math.abs(stressDelta)} stress` : 'calm';
            const stressClass = stressDelta > 0 ? 'metric-pos' : stressDelta < 0 ? 'metric-neg' : 'metric-neutral';

            return (
              <div key={session.id || session.ts} className="session-item-row">
                <div className="session-left-meta">
                  <div
                    className="session-audio-badge"
                    style={{ borderColor: audioColor, backgroundColor: 'rgba(21, 17, 29, 0.8)' }}
                  >
                    <span className="session-audio-icon">{audioIcon}</span>
                    <span className="session-audio-name">{audioName}</span>
                  </div>

                  <div className="session-info-text">
                    <div className="session-task-row">
                      <span className="session-task-name">{session.task || 'Study Session'}</span>
                      {session.isDemo && (
                        <span className="demo-badge-pill" title="This is simulated demonstration data">
                          DEMO
                        </span>
                      )}
                    </div>
                    <span className="session-timestamp">{formatSessionDate(session.ts)}</span>
                  </div>
                </div>

                <div className="session-right-metrics">
                  <div className="session-duration-pill">
                    <i className="far fa-clock"></i>
                    <span>{session.mins} min</span>
                  </div>

                  <div className="session-deltas-group">
                    <span className={`metric-tag ${focusClass}`} title="Focus level change (post - pre)">
                      <i className="fas fa-brain"></i> {focusSign} focus
                    </span>
                    <span className={`metric-tag ${stressClass}`} title="Stress reduction (pre - post)">
                      <i className="fas fa-heart"></i> {stressText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentSessionsSection;

