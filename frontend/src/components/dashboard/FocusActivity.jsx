import { useState } from 'react';
import { Link } from 'react-router-dom';

function FocusActivity({ stats }) {
  const { last7Days, weekMins, goalMinutes, goalPercent } = stats;
  const [dayIndex, setDayIndex] = useState(6);
  const selectedDay = last7Days[dayIndex];
  const plottedMinutes = last7Days.reduce((total, { minutes }) => total + minutes, 0);
  const scaleMax = Math.max(30, Math.ceil(Math.max(...last7Days.map(({ minutes }) => minutes)) / 30) * 30);

  return (
    <section className="workspace-panel workspace-activity" aria-labelledby="activity-title">
      <div className="workspace-panel-heading">
        <div>
          <h2 id="activity-title">Study activity</h2>
          <p>Last 7 days</p>
        </div>
        <Link to="/analytics" className="workspace-text-link">
          Analytics <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
        </Link>
      </div>

      <div className="workspace-chart-summary">
        <span><strong>{plottedMinutes.toLocaleString()}</strong> min studied</span>
        <span>{dayIndex === 6 ? 'Today' : selectedDay.day} · {selectedDay.minutes} min</span>
      </div>

      <div className="workspace-chart" role="group" aria-label="Daily study time in minutes">
        <div className="workspace-chart-axis" aria-hidden="true">
          <span>{scaleMax}</span><span>{scaleMax / 2}</span><span>0</span>
        </div>
        <div className="workspace-chart-bars">
          {last7Days.map(({ day, date, minutes }, index) => (
            <button
              className="workspace-chart-day"
              type="button"
              key={date}
              aria-label={`${index === 6 ? 'Today' : day}, ${date}: ${minutes} minutes`}
              aria-pressed={dayIndex === index}
              onClick={() => setDayIndex(index)}
            >
              <span className="workspace-chart-column" aria-hidden="true">
                <span className="workspace-chart-bar" style={{ '--chart-height': `${minutes / scaleMax * 100}%` }} />
              </span>
              <span aria-hidden="true">{day}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="workspace-goal">
        <div>
          <h3>Weekly goal</h3>
          <span>{weekMins.toLocaleString()} / {goalMinutes.toLocaleString()} min</span>
        </div>
        <progress value={goalPercent} max="100" aria-label="Weekly goal progress" />
      </div>
    </section>
  );
}

export default FocusActivity;
