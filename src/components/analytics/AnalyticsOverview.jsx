import { formatMinutesHuman } from '../../utils/analyticsCalculations';

function signed(value) {
  return value === null ? '—' : `${value > 0 ? '+' : ''}${value}`;
}

function AnalyticsOverview({ overview, dateRange, totals }) {
  const {
    totalMins, totalTimeFormatted, completedSessions, avgFocus,
    avgMoodChange, avgFocusImprovement, avgStressReduction,
    diffTimeMinutes, diffSessions, hasPriorPeriod
  } = overview;
  const comparison = dateRange === 'all' ? 'previous period' : `previous ${dateRange.slice(0, -1)} days`;
  const cards = [
    ['Study time', totalTimeFormatted, '', 'fa-clock', hasPriorPeriod ? `${signed(diffTimeMinutes)} min vs ${comparison}` : ''],
    ['Completed sessions', completedSessions, '', 'fa-circle-check', hasPriorPeriod ? `${signed(diffSessions)} vs ${comparison}` : ''],
    ['Average duration', completedSessions ? formatMinutesHuman(totalMins / completedSessions) : '—', '', 'fa-hourglass-half'],
    ['Current streak', totals.streak, totals.streak === 1 ? 'day' : 'days', 'fa-fire-flame-curved'],
    ['Average focus', avgFocus ?? '—', avgFocus === null ? '' : '/ 10', 'fa-crosshairs'],
    ['Mood change', signed(avgMoodChange), avgMoodChange === null ? '' : 'pts', 'fa-face-smile'],
    ['Focus change', signed(avgFocusImprovement), avgFocusImprovement === null ? '' : 'pts', 'fa-arrow-trend-up'],
    ['Stress change', signed(avgStressReduction === null ? null : -avgStressReduction), avgStressReduction === null ? '' : 'pts', 'fa-heart-pulse']
  ];

  return (
    <section className="workspace-analytics-summary" aria-label="Overview statistics">
      <dl className="workspace-metrics">
        {cards.map(([label, value, unit, icon, hint]) => (
          <div className="workspace-metric" key={label}>
            <dt>
              <span className="workspace-metric-icon" aria-hidden="true"><i className={`fas ${icon}`} /></span>
              {label}
            </dt>
            <dd>{value}{unit && <span>{unit}</span>}</dd>
            {hint && <dd className="workspace-metric-hint">{hint}</dd>}
          </div>
        ))}
      </dl>
      <div className="workspace-panel workspace-goal workspace-analytics-goal">
        <div>
          <h3>Weekly goal</h3>
          <span>{totals.weekMins} / {totals.goalMinutes} min</span>
        </div>
        <progress value={totals.goalPercent} max="100" aria-label="Weekly goal progress" />
      </div>
    </section>
  );
}

export default AnalyticsOverview;
