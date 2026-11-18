import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

function CustomFocusStressTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isFocus = label === 'Focus Level';
    const beforeVal = data.Before;
    const afterVal = data.After;
    // Only compute diff when both values are genuinely present
    const diff = beforeVal !== null && beforeVal !== undefined &&
                 afterVal  !== null && afterVal  !== undefined
      ? Math.round((afterVal - beforeVal) * 10) / 10
      : null;

    return (
      <div className="analytics-chart-tooltip">
        <p className="tooltip-title">{label} (1 - 10 Scale)</p>

        <div className="tooltip-row-item">
          <span className="dot pre-dot"></span>
          <span className="tooltip-label">Before Study:</span>
          <strong>{beforeVal != null ? `${beforeVal}/10` : '—'}</strong>
        </div>

        <div className="tooltip-row-item">
          <span className="dot post-dot"></span>
          <span className="tooltip-label">After Study:</span>
          <strong>{afterVal != null ? `${afterVal}/10` : '—'}</strong>
        </div>

        {diff !== null && (
          <div className="tooltip-delta-row">
            <span>{isFocus ? 'Focus Shift:' : 'Stress Shift:'}</span>
            <span className={`delta-tag ${isFocus ? (diff >= 0 ? 'pos' : 'neg') : (diff <= 0 ? 'pos' : 'neg')}`}>
              {diff > 0 ? `+${diff}` : diff} pts
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function FocusStressChart({ focusStressData }) {
  const {
    avgPreFocus,
    avgPostFocus,
    avgPreStress,
    avgPostStress,
    focusDelta,
    stressReduction,
    pairedCount = 0,
    stressPairedCount = 0,
    focusInsight,
    stressInsight,
    comparisonData = []
  } = focusStressData || {};

  // Either metric can stand alone. Hide the chart only when neither row survives.
  const hasData = Array.isArray(comparisonData) && comparisonData.length > 0;
  const pairLabel = pairedCount === stressPairedCount
    ? String(pairedCount)
    : `Focus ${pairedCount} · Stress ${stressPairedCount}`;

  return (
    <div className="analytics-panel-card focus-stress-panel">
      <div className="panel-card-header">
        <div>
          <div className="panel-title-row">
            <i className="fas fa-scale-balanced text-gradient" aria-hidden="true"></i>
            <h2 className="panel-title">Focus & Stress Dynamics</h2>
          </div>
          <p className="panel-subtitle">
            Measured cognitive shifts comparing pre-session baseline against post-session ratings.
          </p>
        </div>

        {hasData && (
          <div className="header-stat-pill">
            <span className="pill-sub">Paired Observations:</span>
            <span className="pill-val">{pairLabel}</span>
          </div>
        )}
      </div>

      <div className="chart-canvas-area" style={{ height: 280 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 280, height: 280 }}>
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
              barGap={12}
            >
              <CartesianGrid stroke="var(--workspace-line)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="metric"
                stroke="var(--workspace-secondary)"
                tick={{ fill: 'var(--workspace-secondary)', fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--workspace-line-strong)' }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                stroke="var(--workspace-secondary)"
                tick={{ fill: 'var(--workspace-secondary)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ fill: 'rgb(var(--workspace-line-rgb) / 0.11)' }} content={<CustomFocusStressTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              <Bar
                isAnimationActive={false}
dataKey="Before"
                name="Before Study"
                fill="var(--workspace-chart-before)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
              <Bar
                isAnimationActive={false}
dataKey="After"
                name="After Study"
                fill="url(#focus-after-grad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
              <defs>
                <linearGradient id="focus-after-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--workspace-chart-after)" />
                  <stop offset="100%" stopColor="var(--workspace-chart-deep)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state">
            <div className="empty-icon-wrap">
              <i className="fas fa-brain"></i>
            </div>
            <h3 className="empty-heading">No Focus/Stress Data Available</h3>
            <p className="empty-desc">
              Rate your focus and stress sliders when checking into study sessions to evaluate cognitive shifts.
            </p>
          </div>
        )}
      </div>

      {/* Grounded Descriptive Insights */}
      <div className="focus-stress-insights-block">
        <div className="insight-callout-item">
          <div className="insight-callout-icon brain-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="insight-callout-content">
            <span className="insight-callout-title">Focus Pattern</span>
            <p className="insight-callout-text">{focusInsight}</p>
          </div>
          {focusDelta !== null && (
            <span className={`insight-delta-badge ${focusDelta >= 0 ? 'pos' : 'neg'}`}>
              {focusDelta > 0 ? `+${focusDelta}` : focusDelta} pts
            </span>
          )}
        </div>

        <div className="insight-callout-item">
          <div className="insight-callout-icon heart-icon">
            <i className="fas fa-heart-pulse"></i>
          </div>
          <div className="insight-callout-content">
            <span className="insight-callout-title">Stress Pattern</span>
            <p className="insight-callout-text">{stressInsight}</p>
          </div>
          {stressReduction !== null && (
            <span className={`insight-delta-badge ${stressReduction >= 0 ? 'pos' : 'neg'}`}>
              {stressReduction > 0 ? `-${stressReduction} stress` : `${stressReduction} pts`}
            </span>
          )}
        </div>
      </div>

      {hasData && (
        <div className="panel-footer-meta">
          <div className="footer-meta-item">
            <span className="meta-k">Focus:</span>
            <span className="meta-v">{avgPreFocus ?? '—'} &rarr; {avgPostFocus ?? '—'} / 10</span>
          </div>
          <div className="footer-meta-item">
            <span className="meta-k">Stress:</span>
            <span className="meta-v">{avgPreStress ?? '—'} &rarr; {avgPostStress ?? '—'} / 10</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FocusStressChart;
