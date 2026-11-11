function PersonalInsightsSection({ stats }) {
  const {
    avgFocusDelta = 0,
    avgStressReduction = 0,
    topAudio = null,
    latestMood = null,
    completedSessions = 0
  } = stats || {};

  const focusSign = avgFocusDelta > 0 ? `+${avgFocusDelta}` : `${avgFocusDelta}`;
  const stressSign = avgStressReduction > 0 ? `+${avgStressReduction}` : `${avgStressReduction}`;

  const hasData = completedSessions > 0;

  return (
    <section className="dashboard-section-card personal-insights-container" aria-label="Personal Insights">
      <div className="section-header-compact">
        <div>
          <h2 className="section-title">
            <i className="fas fa-brain" style={{ color: 'var(--neon-purple)' }}></i>
            Personal Study Insights
          </h2>
          <p className="section-subtitle">
            Longitudinal patterns derived from your pre- and post-session check-ins.
          </p>
        </div>
      </div>

      <div className="insights-quad-grid">
        {/* 1. Focus Shift */}
        <div className="insight-card-item">
          <div className="insight-top-meta">
            <span className="insight-label">Average Focus Shift</span>
            <div className="insight-icon-bubble focus-bubble">
              <i className="fas fa-arrow-trend-up"></i>
            </div>
          </div>
          <div className="insight-big-value">
            {hasData ? (
              <span className={avgFocusDelta >= 0 ? 'color-pos' : 'color-neg'}>
                {focusSign} <span className="insight-val-unit">pts</span>
              </span>
            ) : (
              <span className="color-neutral">--</span>
            )}
          </div>
          <p className="insight-desc">
            {hasData
              ? 'Average change in self-rated concentration after session completion.'
              : 'Log study sessions to discover your typical focus trajectory.'}
          </p>
        </div>

        {/* 2. Stress Relief */}
        <div className="insight-card-item">
          <div className="insight-top-meta">
            <span className="insight-label">Stress Relief Index</span>
            <div className="insight-icon-bubble stress-bubble">
              <i className="fas fa-heart-pulse"></i>
            </div>
          </div>
          <div className="insight-big-value">
            {hasData ? (
              <span className={avgStressReduction >= 0 ? 'color-pos' : 'color-neg'}>
                {stressSign} <span className="insight-val-unit">pts</span>
              </span>
            ) : (
              <span className="color-neutral">--</span>
            )}
          </div>
          <p className="insight-desc">
            {hasData
              ? 'Reduction in felt tension and study fatigue during sessions.'
              : 'Soundscapes can help de-escalate study fatigue and anxiety.'}
          </p>
        </div>

        {/* 3. Optimal Audio Environment */}
        <div className="insight-card-item">
          <div className="insight-top-meta">
            <span className="insight-label">Top Soundscape</span>
            <div className="insight-icon-bubble audio-bubble">
              <i className="fas fa-sliders-h"></i>
            </div>
          </div>
          <div className="insight-big-value">
            {topAudio ? (
              <span className="color-accent">
                {topAudio.icon} {topAudio.name}
              </span>
            ) : (
              <span className="color-neutral">Synthesizing...</span>
            )}
          </div>
          <p className="insight-desc">
            {topAudio
              ? `Delivers highest focus gains (+${topAudio.avgDelta} avg) over ${topAudio.sessionCount} sessions.`
              : 'Identifies the audio formula that generates your peak performance.'}
          </p>
        </div>

        {/* 4. Latest Recorded Mood (Read-Only) */}
        <div className="insight-card-item">
          <div className="insight-top-meta">
            <span className="insight-label">Latest Check-In Mood</span>
            <div className="insight-icon-bubble mood-bubble">
              <i className="fas fa-smile-beam"></i>
            </div>
          </div>
          <div className="insight-big-value">
            {latestMood ? (
              <span>
                <span className="insight-mood-emoji">{latestMood.emoji}</span>{' '}
                <span className="insight-mood-score">{latestMood.value}/5</span>
              </span>
            ) : (
              <span className="color-neutral">Not recorded</span>
            )}
          </div>
          <p className="insight-desc">
            {latestMood
              ? `Read-only state captured at the end of your last study session.`
              : 'Mood check-in takes place during your active study session workflow.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PersonalInsightsSection;

