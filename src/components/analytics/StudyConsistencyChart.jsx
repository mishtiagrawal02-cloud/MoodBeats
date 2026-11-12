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

function CustomConsistencyTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="analytics-chart-tooltip">
        <p className="tooltip-title">{label}</p>
        <div className="tooltip-row-item">
          <span className="tooltip-label">Study Time:</span>
          <strong>{data.minutes} mins</strong>
        </div>
        <div className="tooltip-row-item">
          <span className="tooltip-label">Sessions:</span>
          <strong>{data.sessions}</strong>
        </div>
      </div>
    );
  }
  return null;
}

function StudyConsistencyChart({ consistencyData }) {
  const {
    dayBuckets = [],
    bestDay,
    bestDayMinutes,
    totalPeriodFormatted,
    totalCompletedSessions,
    streak
  } = consistencyData || {};

  const hasData = dayBuckets.some((b) => b.minutes > 0);

  return (
    <div className="analytics-panel-card study-consistency-panel">
      <div className="panel-card-header">
        <div>
          <div className="panel-title-row">
            <i className="fas fa-calendar-check text-gradient"></i>
            <h2 className="panel-title">Weekly Rhythm & Consistency</h2>
          </div>
          <p className="panel-subtitle">
            Cumulative study volume and session frequency distributed across days of the week.
          </p>
        </div>

        {streak > 0 && (
          <div className="streak-badge-pill">
            <i className="fas fa-fire text-gradient"></i>
            <span>{streak}-Day Streak</span>
          </div>
        )}
      </div>

      {/* Summary KPI row */}
      <div className="consistency-kpi-row">
        <div className="kpi-mini-card">
          <span className="kpi-label">Peak Focus Day</span>
          <span className="kpi-value highlight">
            {bestDay ? (
              <>
                <i className="fas fa-star" style={{ color: 'var(--warning)', fontSize: '0.85em', marginRight: '6px' }}></i>
                {bestDay} ({bestDayMinutes}m)
              </>
            ) : (
              'None yet'
            )}
          </span>
        </div>

        <div className="kpi-mini-card">
          <span className="kpi-label">Total Time in Period</span>
          <span className="kpi-value">{totalPeriodFormatted || '0m'}</span>
        </div>

        <div className="kpi-mini-card">
          <span className="kpi-label">Sessions Completed</span>
          <span className="kpi-value">{totalCompletedSessions || 0}</span>
        </div>
      </div>

      <div className="chart-canvas-area" style={{ height: 260 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dayBuckets}
              margin={{ top: 16, right: 16, left: -10, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(201, 180, 255, 0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--muted-grey)', fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(201, 180, 255, 0.12)' }}
              />
              <YAxis
                unit="m"
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--muted-grey)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomConsistencyTooltip />} />
              <Bar dataKey="minutes" name="Minutes" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {dayBuckets.map((entry, index) => {
                  const isBest = entry.day === bestDay && entry.minutes > 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isBest ? '#BF5AFF' : 'rgba(139, 53, 255, 0.65)'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <i className="far fa-calendar-alt"></i>
            </div>
            <h3 className="empty-heading">No Weekly Distribution Data</h3>
            <p className="empty-desc">
              Complete study sessions to discover which days of the week you are most focused.
            </p>
          </div>
        )}
      </div>

      {hasData && bestDay && totalCompletedSessions >= 3 && (
        <div className="consistency-footer-note">
          <i className="fas fa-lightbulb" style={{ color: 'var(--soft-lavender)' }}></i>
          <span>
            You log your heaviest study load on <strong>{bestDay}s</strong> ({bestDayMinutes} minutes).
          </span>
        </div>
      )}

      {totalCompletedSessions === 1 && (
        <div className="chart-sparse-note">
          <i className="fas fa-circle-info"></i>
          <span>Based on 1 session. Continue studying to establish your weekly rhythm.</span>
        </div>
      )}
      {totalCompletedSessions === 2 && (
        <div className="chart-sparse-note">
          <i className="fas fa-circle-info"></i>
          <span>Based on 2 sessions. This is not yet an established weekly routine.</span>
        </div>
      )}
    </div>
  );
}

export default StudyConsistencyChart;

