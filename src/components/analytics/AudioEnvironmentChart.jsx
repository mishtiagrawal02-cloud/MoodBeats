import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

function CustomAudioTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="analytics-chart-tooltip">
        <p className="tooltip-title">
          <span>{data.icon}</span> {data.name}
        </p>

        <div className="tooltip-row-item">
          <span className="tooltip-label">Study Time:</span>
          <strong>{data.formattedMinutes} ({data.totalMinutes}m)</strong>
        </div>

        <div className="tooltip-row-item">
          <span className="tooltip-label">Sample Size:</span>
          <strong>N = {data.sessionCount} sessions</strong>
        </div>

        {data.avgFocusChange !== null && (
          <div className="tooltip-row-item">
            <span className="tooltip-label">Avg Focus Shift:</span>
            <span className={`delta-tag ${data.avgFocusChange >= 0 ? 'pos' : 'neg'}`}>
              {data.avgFocusChange > 0 ? `+${data.avgFocusChange}` : data.avgFocusChange} pts
            </span>
          </div>
        )}

        {data.avgStressReduction !== null && (
          <div className="tooltip-row-item">
            <span className="tooltip-label">Stress Relief:</span>
            <span className={`delta-tag ${data.avgStressReduction >= 0 ? 'pos' : 'neg'}`}>
              {data.avgStressReduction > 0 ? `-${data.avgStressReduction}` : data.avgStressReduction} stress
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function AudioEnvironmentChart({ audioData }) {
  const { environmentList = [], mostUsed, bestFocusEnv, totalAudioSessions } = audioData || {};

  const hasData = environmentList.length > 0;

  return (
    <div className="analytics-panel-card audio-environment-panel">
      <div className="panel-card-header">
        <div>
          <div className="panel-title-row">
            <i className="fas fa-headphones text-gradient"></i>
            <h2 className="panel-title">Soundscape & Focus Correlation</h2>
          </div>
          <p className="panel-subtitle">
            Actual study volume and self-rated focus shifts observed across procedural audio environments.
          </p>
        </div>

        {hasData && (
          <div className="header-stat-pill">
            <span className="pill-sub">Total Audio Sessions:</span>
            <span className="pill-val">{totalAudioSessions}</span>
          </div>
        )}
      </div>

      {/* Highlights grid */}
      {hasData && (
        <div className="audio-highlights-grid">
          {mostUsed && (
            <div className="audio-highlight-card">
              <span className="highlight-tag">{mostUsed.sessionCount > 1 ? 'Most Frequent Choice' : 'Recorded Choice'}</span>
              <div className="highlight-main">
                <span className="env-ico">{mostUsed.icon}</span>
                <span className="env-title">{mostUsed.name}</span>
              </div>
              <span className="highlight-detail">
                {mostUsed.sessionCount} sessions • {mostUsed.formattedMinutes}
              </span>
            </div>
          )}

          {bestFocusEnv && bestFocusEnv.avgFocusChange > 0 && (
            <div className="audio-highlight-card">
              <span className="highlight-tag">Top Focus Association</span>
              <div className="highlight-main">
                <span className="env-ico">{bestFocusEnv.icon}</span>
                <span className="env-title">{bestFocusEnv.name}</span>
              </div>
              <span className="highlight-detail">
                +{bestFocusEnv.avgFocusChange} pts avg shift (N = {bestFocusEnv.sessionCount})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart: Total Minutes by Soundscape */}
      <div className="chart-canvas-area" style={{ height: 260 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={environmentList}
              layout="vertical"
              margin={{ top: 8, right: 30, left: 24, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(201, 180, 255, 0.08)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                unit="m"
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--muted-grey)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(201, 180, 255, 0.12)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--soft-lavender)', fontSize: 13 }}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip content={<CustomAudioTooltip />} />
              <Bar dataKey="totalMinutes" name="Minutes" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {environmentList.map((entry) => (
                  <Cell key={entry.id} fill={entry.color || '#BF5AFF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <i className="fas fa-sliders-h"></i>
            </div>
            <h3 className="empty-heading">No Soundscape Data Logged</h3>
            <p className="empty-desc">
              Select different procedural soundscapes when studying to compare how your focus ratings vary across environments.
            </p>
          </div>
        )}
      </div>

      {/* Detailed environment metrics table / cards */}
      {hasData && (
        <div className="env-breakdown-cards-list">
          {environmentList.map((env) => (
            <div key={env.id} className="env-breakdown-row-item">
              <div className="env-row-meta">
                <span className="env-row-icon">{env.icon}</span>
                <div>
                  <strong className="env-row-name">{env.name}</strong>
                  <span className="env-row-sample">N = {env.sessionCount} {env.sessionCount === 1 ? 'session' : 'sessions'}</span>
                </div>
              </div>

              <div className="env-row-stats">
                <div className="env-stat-box">
                  <span className="stat-k">Time Studied</span>
                  <span className="stat-v">{env.formattedMinutes}</span>
                </div>

                <div className="env-stat-box">
                  <span className="stat-k">Focus Shift</span>
                  <span className="stat-v">
                    {env.avgFocusChange !== null ? (
                      <span className={`metric-inline ${env.avgFocusChange >= 0 ? 'pos' : 'neg'}`}>
                        {env.avgFocusChange > 0 ? `+${env.avgFocusChange}` : env.avgFocusChange} pts
                      </span>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>

                <div className="env-stat-box">
                  <span className="stat-k">Stress Relief</span>
                  <span className="stat-v">
                    {env.avgStressReduction !== null ? (
                      <span className={`metric-inline ${env.avgStressReduction >= 0 ? 'pos' : 'neg'}`}>
                        {env.avgStressReduction > 0 ? `-${env.avgStressReduction}` : env.avgStressReduction} pts
                      </span>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasData && !environmentList.some((env) => env.sessionCount >= 2) && (
        <div className="chart-sparse-note">
          <i className="fas fa-circle-info"></i>
          <span>
            {totalAudioSessions === 1
              ? 'Based on 1 session. More soundscape sessions are needed before a preference is meaningful.'
              : 'Each soundscape has fewer than 2 sessions, so these counts are not yet a stable preference.'}
          </span>
        </div>
      )}

      <div className="audio-disclaimer-note">
        <i className="fas fa-circle-info"></i>
        <span>
          Associations reflect historical correlations across completed sessions and do not imply direct clinical causality. Sample sizes (N) indicate observation counts.
        </span>
      </div>
    </div>
  );
}

export default AudioEnvironmentChart;

