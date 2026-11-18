import { DATE_RANGES } from '../../utils/analyticsCalculations.js';

const RANGE_OPTIONS = [
  { id: DATE_RANGES.WEEK, label: 'Last 7 days' },
  { id: DATE_RANGES.MONTH, label: 'Last 30 days' },
  { id: DATE_RANGES.QUARTER, label: 'Last 90 days' },
  { id: DATE_RANGES.ALL, label: 'All time' }
];

function AnalyticsHeader({ dateRange, onRangeChange }) {
  return (
    <section className="workspace-panel workspace-section-intro" aria-labelledby="analytics-trends-title">
      <div>
        <h2 id="analytics-trends-title">Your study insights</h2>
        <p>Compare study time, mood, and focus across your sessions.</p>
      </div>
      <div className="workspace-compact-field">
        <label htmlFor="analytics-range">Date range</label>
        <select
          className="workspace-select"
          id="analytics-range"
          value={dateRange}
          onChange={(event) => onRangeChange(event.target.value)}
        >
          {RANGE_OPTIONS.map(({ id, label }) => <option value={id} key={id}>{label}</option>)}
        </select>
      </div>
    </section>
  );
}

export default AnalyticsHeader;
