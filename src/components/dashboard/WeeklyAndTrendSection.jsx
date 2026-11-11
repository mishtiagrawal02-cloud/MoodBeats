import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const delta = data.focusDelta;
    const deltaSign = delta > 0 ? `+${delta}` : `${delta}`;
    const deltaColor = delta > 0 ? 'var(--good)' : delta < 0 ? 'var(--bad)' : 'var(--soft-lavender)';

    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-day">{label} ({data.date})</p>
        <p className="tooltip-stat">
          <span>Avg Focus Change:</span>
          <strong style={{ color: deltaColor }}>{deltaSign} pts</strong>
        </p>
        <p className="tooltip-stat">
          <span>Time Studied:</span>
          <strong>{data.minutes} min</strong>
        </p>
        <p className="tooltip-sessions">
          {data.sessionCount} {data.sessionCount === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    );
  }
  return null;
}

function WeeklyAndTrendSection({ stats }) {
  const {
    weekMins = 0,
    goalMinutes = 150,
    goalPercent = 0,
    last7Days = []
  } = stats || {};

  // Circumference for r=70 is 2 * Math.PI * 70 ≈ 439.82
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference * (1 - Math.min(100, Math.max(0, goalPercent)) / 100);

  const hasAnyActivity = last7Days.some((d) => d.sessionCount > 0);

  return (
    <section className="dashboard-double-card-grid" aria-label="Weekly Progress and Trend">
      {/* Panel 1: Weekly Progress Gauge */}
      <div className="dashboard-section-card weekly-progress-panel">
        <div className="section-header-compact">
          <h2 className="section-title-sm">
            <i className="fas fa-chart-pie" style={{ color: 'var(--neon-purple)' }}></i>
            Weekly Progress
          </h2>
          <span className="window-pill">Last 7 Days</span>
        </div>

        <div className="circular-gauge-container">
          <svg viewBox="0 0 180 180" className="gauge-svg" role="img" aria-label={`Weekly progress: ${goalPercent}%`}>
            <defs>
              <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B35FF" />
                <stop offset="100%" stopColor="#BF5AFF" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              className="gauge-bg"
              cx="90"
              cy="90"
              r={circleRadius}
            />
            {/* Filled Arc */}
            <circle
              className="gauge-fill"
              cx="90"
              cy="90"
              r={circleRadius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
            />
          </svg>

          <div className="gauge-inner-content">
            <span className="gauge-percent">{goalPercent}%</span>
            <span className="gauge-label">
              {goalPercent >= 100 ? 'Target Reached! 🎉' : 'Of Target'}
            </span>
          </div>
        </div>

        <div className="weekly-stats-breakdown">
          <div className="breakdown-row">
            <span className="breakdown-label">Minutes Studied</span>
            <span className="breakdown-value">{weekMins} min</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">Weekly Target</span>
            <span className="breakdown-value">{goalMinutes} min</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">Remaining</span>
            <span className="breakdown-value">
              {Math.max(0, goalMinutes - weekMins)} min
            </span>
          </div>
        </div>
      </div>

      {/* Panel 2: 7-Day Focus Trend */}
      <div className="dashboard-section-card focus-trend-panel">
        <div className="section-header-compact">
          <div>
            <h2 className="section-title-sm">
              <i className="fas fa-chart-line" style={{ color: 'var(--electric-violet)' }}></i>
              7-Day Focus Trend
            </h2>
            <p className="trend-subtitle">Net focus level changes measured across study sessions</p>
          </div>
          <span className="legend-indicator">
            <span className="legend-dot"></span> Focus Delta (pts)
          </span>
        </div>

        <div className="trend-chart-wrapper">
          {hasAnyActivity ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={last7Days} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focus-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BF5AFF" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#8B35FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 180, 255, 0.08)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#938B9E"
                  tickLine={false}
                  fontSize={12}
                  dy={6}
                />
                <YAxis
                  stroke="#938B9E"
                  tickLine={false}
                  fontSize={11}
                  domain={[-3, 4]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="focusDelta"
                  stroke="#BF5AFF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#focus-area-gradient)"
                  activeDot={{ r: 6, fill: '#F7F3FF', stroke: '#8B35FF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-fallback">
              <div className="empty-chart-icon">
                <i className="fas fa-chart-area"></i>
              </div>
              <p className="empty-chart-title">No Focus Data Yet</p>
              <p className="empty-chart-text">
                Complete your first study session to start mapping your 7-day concentration patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeeklyAndTrendSection;

