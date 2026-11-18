import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateActivitySeries } from '../../utils/analyticsCalculations';

const INTERVALS = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
const MEASURES = { minutes: 'Study time', focus: 'Focus after study', stress: 'Stress after study' };
const SHORT_DATE = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const MONTH = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' });

function ActivityTrends({ sessions }) {
  const [interval, setInterval] = useState('day');
  const [measure, setMeasure] = useState('minutes');
  const data = useMemo(() => calculateActivitySeries(sessions, interval), [sessions, interval]);
  const isDuration = measure === 'minutes';
  const hasValues = data.some((bucket) => bucket[measure] !== null);
  const formatDate = (value) => (interval === 'month' ? MONTH : SHORT_DATE).format(value);
  const Chart = isDuration ? BarChart : LineChart;
  const tint = isDuration ? 'var(--workspace-amber)' : 'var(--workspace-chart-after)';

  return (
    <section className="workspace-panel workspace-activity-trends" aria-labelledby="activity-trends-title">
      <div className="workspace-panel-heading">
        <div>
          <h2 id="activity-trends-title">Activity and rating trends</h2>
          <p>Change the time grouping or switch to a post-study rating.</p>
        </div>
        <div className="workspace-chart-filters">
          <div className="workspace-compact-field">
            <label htmlFor="trend-interval">Group by</label>
            <select className="workspace-select" id="trend-interval" value={interval} onChange={(event) => setInterval(event.target.value)}>
              {Object.entries(INTERVALS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div className="workspace-compact-field">
            <label htmlFor="trend-measure">Measure</label>
            <select className="workspace-select" id="trend-measure" value={measure} onChange={(event) => setMeasure(event.target.value)}>
              {Object.entries(MEASURES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
        </div>
      </div>
      {hasValues ? (
        <div className="workspace-trend-chart" aria-label={`${INTERVALS[interval]} ${MEASURES[measure].toLowerCase()}`}>
          <ResponsiveContainer width="100%" height={244} minWidth={0} initialDimension={{ width: 320, height: 244 }}>
            <Chart data={data} margin={{ left: 0, right: 10, top: 8, bottom: 5 }}>
              <CartesianGrid stroke="var(--workspace-line)" vertical={false} />
              <XAxis dataKey="timestamp" minTickGap={22} tickFormatter={formatDate} tick={{ fill: 'var(--workspace-muted)', fontSize: 11 }} />
              <YAxis width={34} allowDecimals={false} domain={isDuration ? [0, 'auto'] : [0, 10]} tick={{ fill: 'var(--workspace-muted)', fontSize: 11 }} />
              <Tooltip
                labelFormatter={(value) => formatDate(Number(value))}
                formatter={(value) => [`${value} ${isDuration ? 'min' : '/ 10'}`, MEASURES[measure]]}
                contentStyle={{ background: 'var(--workspace-control)', border: '1px solid var(--workspace-line-strong)', borderRadius: '10px' }}
                labelStyle={{ color: 'var(--workspace-text)' }}
                itemStyle={{ color: 'var(--workspace-text)' }}
                cursor={{ fill: 'rgb(var(--workspace-line-rgb) / 0.11)' }}
              />
              {isDuration
                ? <Bar dataKey="minutes" fill={tint} radius={[5, 5, 0, 0]} maxBarSize={42} isAnimationActive={false} />
                : <Line dataKey={measure} stroke={tint} strokeWidth={2} dot={{ r: 4, fill: tint }} isAnimationActive={false} />}
            </Chart>
          </ResponsiveContainer>
          <details className="workspace-chart-data">
            <summary>View data</summary>
            <ul>{data.map((bucket) => (
              <li key={bucket.timestamp}>
                {formatDate(bucket.timestamp)} · {bucket[measure] === null ? 'Not recorded' : `${bucket[measure]} ${isDuration ? 'min' : '/ 10'}`}
              </li>
            ))}</ul>
          </details>
        </div>
      ) : (
        <p className="workspace-data-empty">No {MEASURES[measure].toLowerCase()} data in this date range.</p>
      )}
    </section>
  );
}

export default ActivityTrends;
