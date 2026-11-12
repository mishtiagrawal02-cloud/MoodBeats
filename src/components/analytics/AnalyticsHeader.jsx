import { DATE_RANGES } from '../../utils/analyticsCalculations.js';

const RANGE_OPTIONS = [
  { id: DATE_RANGES.WEEK, label: 'Last 7 Days', shortLabel: '7D' },
  { id: DATE_RANGES.MONTH, label: 'Last 30 Days', shortLabel: '30D' },
  { id: DATE_RANGES.QUARTER, label: 'Last 90 Days', shortLabel: '90D' },
  { id: DATE_RANGES.ALL, label: 'All Time', shortLabel: 'All' }
];

function AnalyticsHeader({ dateRange, onRangeChange, userName = 'Awantika' }) {
  return (
    <header className="analytics-header-section" aria-label="Analytics Header">
      <div className="analytics-header-content">
        <div className="analytics-title-group">
          <div className="analytics-eyebrow">
            <span className="eyebrow-pill">
              <i className="fas fa-chart-pie"></i> Personal Intelligence
            </span>
            <span className="eyebrow-user">for {userName}</span>
          </div>

          <h1 className="analytics-page-title">
            <span className="text-gradient">Your Study Insights</span>
          </h1>

          <p className="analytics-page-subtitle">
            Understand your patterns, track your progress, and discover what helps you focus.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="date-range-selector-wrapper" role="region" aria-label="Date Range Selector">
          <span className="range-selector-label">
            <i className="far fa-calendar-alt"></i> Timeframe:
          </span>
          <div className="range-pills-row" role="radiogroup" aria-label="Select Date Range">
            {RANGE_OPTIONS.map((opt) => {
              const isSelected = dateRange === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`range-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onRangeChange(opt.id)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span className="range-pill-text">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AnalyticsHeader;

