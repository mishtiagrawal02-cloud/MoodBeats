function AnalyticsOverview({ overview, dateRange }) {
  const {
    totalTimeFormatted,
    completedSessions,
    avgFocus,
    avgStressReduction,
    avgFocusImprovement,
    diffTimeMinutes,
    diffSessions,
    hasPriorPeriod
  } = overview || {};

  const rangeLabel = dateRange === '7d'
    ? 'prev 7 days'
    : dateRange === '30d'
      ? 'prev 30 days'
      : dateRange === '90d'
        ? 'prev 90 days'
        : 'prev period';

  return (
    <section className="analytics-overview-section" aria-label="Overview Statistics">
      <div className="overview-cards-grid">
        {/* Card 1: Total Study Time */}
        <div className="overview-card">
          <div className="card-top-meta">
            <span className="card-label">Total Study Time</span>
            <div className="card-icon-bubble violet-bubble">
              <i className="far fa-clock"></i>
            </div>
          </div>

          <div className="card-main-val">
            <span className="val-text">{totalTimeFormatted || '0m'}</span>
          </div>

          <div className="card-sub-info">
            {hasPriorPeriod && diffTimeMinutes !== null ? (
              <span className={`diff-pill ${diffTimeMinutes >= 0 ? 'pos' : 'neg'}`}>
                <i className={`fas fa-arrow-${diffTimeMinutes >= 0 ? 'up' : 'down'}`}></i>
                <span>{diffTimeMinutes >= 0 ? `+${diffTimeMinutes}` : diffTimeMinutes}m vs {rangeLabel}</span>
              </span>
            ) : (
              <span className="sub-hint">Active study blocks logged</span>
            )}
          </div>
        </div>

        {/* Card 2: Completed Sessions */}
        <div className="overview-card">
          <div className="card-top-meta">
            <span className="card-label">Completed Sessions</span>
            <div className="card-icon-bubble purple-bubble">
              <i className="fas fa-circle-check"></i>
            </div>
          </div>

          <div className="card-main-val">
            <span className="val-text">{completedSessions ?? 0}</span>
            <span className="val-unit">sessions</span>
          </div>

          <div className="card-sub-info">
            {hasPriorPeriod && diffSessions !== null ? (
              <span className={`diff-pill ${diffSessions >= 0 ? 'pos' : 'neg'}`}>
                <i className={`fas fa-arrow-${diffSessions >= 0 ? 'up' : 'down'}`}></i>
                <span>{diffSessions >= 0 ? `+${diffSessions}` : diffSessions} vs {rangeLabel}</span>
              </span>
            ) : (
              <span className="sub-hint">Verified study intervals</span>
            )}
          </div>
        </div>

        {/* Card 3: Average Focus Level */}
        <div className="overview-card">
          <div className="card-top-meta">
            <span className="card-label">Average Focus</span>
            <div className="card-icon-bubble lavender-bubble">
              <i className="fas fa-brain"></i>
            </div>
          </div>

          <div className="card-main-val">
            {avgFocus !== null ? (
              <>
                <span className="val-text">{avgFocus}</span>
                <span className="val-unit">/ 10</span>
              </>
            ) : (
              <span className="val-text empty-dash">—</span>
            )}
          </div>

          <div className="card-sub-info">
            {avgFocus !== null ? (
              <span className="quality-pill high">
                <i className="fas fa-bolt"></i>
                <span>{avgFocus >= 7 ? 'Deep Concentration' : avgFocus >= 5 ? 'Steady Focus' : 'Developing'}</span>
              </span>
            ) : (
              <span className="sub-hint">Requires focus check-ins</span>
            )}
          </div>
        </div>

        {/* Card 4: Average Stress Reduction */}
        <div className="overview-card">
          <div className="card-top-meta">
            <span className="card-label">Stress Reduction</span>
            <div className="card-icon-bubble teal-bubble">
              <i className="fas fa-heart-pulse"></i>
            </div>
          </div>

          <div className="card-main-val">
            {avgStressReduction !== null ? (
              <>
                <span className={`val-text ${avgStressReduction > 0 ? 'color-pos' : ''}`}>
                  {avgStressReduction > 0 ? `-${avgStressReduction}` : `${avgStressReduction}`}
                </span>
                <span className="val-unit">pts</span>
              </>
            ) : (
              <span className="val-text empty-dash">—</span>
            )}
          </div>

          <div className="card-sub-info">
            {avgStressReduction !== null ? (
              <span className="sub-hint">
                {avgStressReduction > 0
                  ? 'Average calm gained after study'
                  : avgStressReduction < 0
                    ? 'Average stress increased after study'
                    : 'Stress remained level'}
              </span>
            ) : (
              <span className="sub-hint">Requires before/after stress</span>
            )}
          </div>
        </div>

        {/* Card 5: Focus Improvement */}
        <div className="overview-card">
          <div className="card-top-meta">
            <span className="card-label">Focus Improvement</span>
            <div className="card-icon-bubble emerald-bubble">
              <i className="fas fa-arrow-trend-up"></i>
            </div>
          </div>

          <div className="card-main-val">
            {avgFocusImprovement !== null ? (
              <>
                <span className={`val-text ${avgFocusImprovement > 0 ? 'color-pos' : ''}`}>
                  {avgFocusImprovement > 0 ? `+${avgFocusImprovement}` : `${avgFocusImprovement}`}
                </span>
                <span className="val-unit">pts</span>
              </>
            ) : (
              <span className="val-text empty-dash">—</span>
            )}
          </div>

          <div className="card-sub-info">
            {avgFocusImprovement !== null ? (
              <span className="sub-hint">Average shift from start to end</span>
            ) : (
              <span className="sub-hint">Requires before/after focus</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsOverview;

