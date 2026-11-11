function StatsGrid({ stats }) {
  const {
    totalHours = '0.0',
    totalMins = 0,
    completedSessions = 0,
    streak = 0,
    weekMins = 0,
    goalMinutes = 150,
    goalPercent = 0
  } = stats || {};

  return (
    <section className="stats-four-grid" aria-label="Key Study Statistics">
      {/* 1. Total Study Hours */}
      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <i className="fas fa-clock"></i>
        </div>
        <div className="stat-body">
          <span className="stat-number">{totalHours} <span className="stat-unit">hrs</span></span>
          <span className="stat-title">Total Study Hours</span>
          <span className="stat-subtext">{totalMins} minutes focused</span>
        </div>
      </div>

      {/* 2. Completed Sessions */}
      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-body">
          <span className="stat-number">{completedSessions}</span>
          <span className="stat-title">Completed Sessions</span>
          <span className="stat-subtext">
            {completedSessions === 0 ? 'No sessions logged yet' : `${completedSessions} total sessions recorded`}
          </span>
        </div>
      </div>

      {/* 3. Current Study Streak */}
      <div className="stat-card">
        <div className="stat-icon-wrapper streak-icon">
          <i className="fas fa-fire"></i>
        </div>
        <div className="stat-body">
          <span className="stat-number">{streak} <span className="stat-unit">{streak === 1 ? 'day' : 'days'}</span></span>
          <span className="stat-title">Current Study Streak</span>
          <span className="stat-subtext">
            {streak > 0 ? 'Daily momentum active' : 'Complete today to start a streak'}
          </span>
        </div>
      </div>

      {/* 4. Weekly Goal Progress */}
      <div className="stat-card">
        <div className="stat-icon-wrapper goal-icon">
          <i className="fas fa-bullseye"></i>
        </div>
        <div className="stat-body">
          <div className="stat-number-row">
            <span className="stat-number">{weekMins} <span className="stat-unit">/ {goalMinutes} m</span></span>
            <span className="stat-percent-badge">{goalPercent}%</span>
          </div>
          <span className="stat-title">Weekly Goal Progress</span>
          <div className="stat-mini-progress-track">
            <div
              className="stat-mini-progress-bar"
              style={{ width: `${goalPercent}%` }}
              role="progressbar"
              aria-valuenow={goalPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsGrid;

