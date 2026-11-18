import { useMemo } from 'react';

/**
 * InsightsWidget: Displays today's productivity insights.
 * 
 * Pulls all data from useDashboardStats hook:
 * - completedSessions: Sessions completed
 * - streak: Current active streak
 * - last7Days: Weekly data for mini-chart
 * 
 * NO mock data—all values calculated from real stored sessions.
 */

function InsightsWidget({ stats = {} }) {
  const {
    completedSessions = 0,
    streak = 0,
    last7Days = []
  } = stats;

  // Format minutes to hours:minutes
  const formatTime = (mins) => {
    if (mins === 0) return '0m';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  // Get today's data from last7Days (last item is today)
  const todayData = useMemo(() => {
    if (last7Days.length > 0) {
      return last7Days[last7Days.length - 1];
    }
    return { minutes: 0, sessionCount: 0 };
  }, [last7Days]);

  return (
    <div className="widget-glass-panel insights-widget" style={{ minWidth: '260px' }}>
      <div className="widget-header">
        <div>
          <div className="widget-title">📊 Today's Progress</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--va-text-muted)', marginTop: '3px' }}>
            Real-time analytics
          </div>
        </div>
      </div>

      <div className="insights-mini-stat">
        <span className="insights-stat-label">Study Time</span>
        <span className="insights-stat-value">{formatTime(todayData.minutes)}</span>
      </div>

      <div className="insights-mini-stat">
        <span className="insights-stat-label">Sessions</span>
        <span className="insights-stat-value">{todayData.sessionCount}</span>
      </div>

      <div className="insights-mini-stat">
        <span className="insights-stat-label">Streak</span>
        <span
          className="insights-stat-value"
          style={{ color: streak > 0 ? '#FF8F66' : 'var(--va-accent-gold)' }}
        >
          {streak} {streak === 1 ? 'day' : 'days'}
        </span>
      </div>

      {completedSessions > 0 && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--va-text-muted)',
            paddingTop: '10px',
            marginTop: '10px',
            borderTop: '1px solid rgba(214, 189, 145, 0.1)'
          }}
        >
          <strong style={{ color: 'var(--va-accent-gold)' }}>{completedSessions}</strong> total
          session{completedSessions !== 1 ? 's' : ''} completed
        </div>
      )}
    </div>
  );
}

export default InsightsWidget;
