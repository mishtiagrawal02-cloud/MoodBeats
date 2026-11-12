import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MOOD_SCALE } from '../../utils/analyticsCalculations.js';

function formatMoodLabel(val) {
  const match = MOOD_SCALE.find((m) => m.value === Math.round(val));
  return match ? `${match.emoji} ${match.label}` : `${val}`;
}

function CustomMoodTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const preMatch = MOOD_SCALE.find((m) => m.value === Math.round(data.preMood));
    const postMatch = MOOD_SCALE.find((m) => m.value === Math.round(data.postMood));

    const delta = data.postMood !== null && data.preMood !== null
      ? Math.round((data.postMood - data.preMood) * 10) / 10
      : null;

    return (
      <div className="analytics-chart-tooltip">
        <p className="tooltip-title">
          <i className="far fa-calendar"></i> {label}
        </p>

        <div className="tooltip-row-item">
          <span className="dot pre-dot"></span>
          <span className="tooltip-label">Before Study:</span>
          <strong>
            {preMatch ? `${preMatch.emoji} ${data.preMood}/5` : 'No check-in'}
          </strong>
        </div>

        <div className="tooltip-row-item">
          <span className="dot post-dot"></span>
          <span className="tooltip-label">After Study:</span>
          <strong>
            {postMatch ? `${postMatch.emoji} ${data.postMood}/5` : 'No check-in'}
          </strong>
        </div>

        {delta !== null && (
          <div className="tooltip-delta-row">
            <span>Shift:</span>
            <span className={`delta-tag ${delta >= 0 ? 'pos' : 'neg'}`}>
              {delta > 0 ? `+${delta}` : delta} pts
            </span>
          </div>
        )}

        <span className="tooltip-count-note">
          Based on {data.sessions} {data.sessions === 1 ? 'session' : 'sessions'}
        </span>
      </div>
    );
  }
  return null;
}

function MoodTrendsChart({ moodData }) {
  const { chartData, avgPreMood, avgPostMood, moodShift, totalCheckIns } = moodData || {};

  const hasData = Array.isArray(chartData) && chartData.length > 0;

  return (
    <div className="analytics-panel-card mood-trends-panel">
      <div className="panel-card-header">
        <div>
          <div className="panel-title-row">
            <i className="fas fa-face-smile text-gradient"></i>
            <h2 className="panel-title">Mood Trajectory Over Time</h2>
          </div>
          <p className="panel-subtitle">
            Longitudinal comparison of your mental state before and after studying.
          </p>
        </div>

        {hasData && moodShift !== null && (
          <div className="header-stat-pill">
            <span className="pill-sub">Average Shift:</span>
            <span className={`pill-val ${moodShift >= 0 ? 'pos' : 'neg'}`}>
              {moodShift > 0 ? `+${moodShift}` : moodShift} pts
            </span>
          </div>
        )}
      </div>

      {/* Mood scale guide legend */}
      <div className="mood-scale-guide-bar" aria-label="Mood Scale Legend">
        <span className="scale-title">Scale:</span>
        {MOOD_SCALE.map((m) => (
          <span key={m.value} className="scale-badge">
            <span className="scale-emoji">{m.emoji}</span>
            <span className="scale-num">{m.value}</span>
            <span className="scale-name">{m.label}</span>
          </span>
        ))}
      </div>

      <div className="chart-canvas-area" style={{ height: 320 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 24, left: -10, bottom: 10 }}
            >
              <CartesianGrid stroke="rgba(201, 180, 255, 0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--muted-grey)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(201, 180, 255, 0.12)' }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(val) => {
                  const m = MOOD_SCALE.find((s) => s.value === val);
                  return m ? m.emoji : val;
                }}
                stroke="var(--muted-grey)"
                tick={{ fill: 'var(--muted-grey)', fontSize: 14 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomMoodTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="preMood"
                name="Before Study"
                stroke="#938B9E"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#938B9E', stroke: '#15111D', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#C9B4FF' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="postMood"
                name="After Study"
                stroke="#BF5AFF"
                strokeWidth={3}
                dot={{ r: 5, fill: '#BF5AFF', stroke: '#09070D', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#F7F3FF', stroke: '#BF5AFF', strokeWidth: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="empty-heading">No Mood Records for this Period</h3>
            <p className="empty-desc">
              Log before- and after-study check-ins during your sessions to chart your mood progression.
            </p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="panel-footer-meta">
          <div className="footer-meta-item">
            <span className="meta-k">Pre-Study Average:</span>
            <span className="meta-v">
              {avgPreMood !== null ? formatMoodLabel(avgPreMood) : '—'}
            </span>
          </div>
          <div className="footer-meta-item">
            <span className="meta-k">Post-Study Average:</span>
            <span className="meta-v">
              {avgPostMood !== null ? formatMoodLabel(avgPostMood) : '—'}
            </span>
          </div>
          <div className="footer-meta-item">
            <span className="meta-k">Total Check-Ins:</span>
            <span className="meta-v">{totalCheckIns}</span>
          </div>
        </div>
      )}

      {/* Sparse-data contextual note — shown only when there is exactly 1 data point */}
      {hasData && chartData.length === 1 && (
        <div className="chart-sparse-note">
          <i className="fas fa-circle-info"></i>
          <span>Complete more study check-ins to reveal longer-term mood trends.</span>
        </div>
      )}
    </div>
  );
}

export default MoodTrendsChart;

