import { useState, useEffect, memo } from 'react';

/**
 * ClockWidget: Live digital clock and date display.
 * 
 * Updates every 60 seconds to show current time and date.
 * Uses native JavaScript Date object—no external dependencies.
 */

function ClockWidget() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    // Update immediately
    const updateClock = () => setTime(new Date());
    updateClock();

    // Update every second for smooth updates
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="widget-glass-panel clock-widget" style={{ minWidth: '240px' }}>
      <div className="widget-header">
        <div>
          <div className="widget-title">🕐 Current Time</div>
        </div>
      </div>

      <div className="clock-display">
        <div className="clock-time">
          {hours}:{minutes}
        </div>
        <div className="clock-date">
          <div className="clock-day">{dayName}</div>
          <div>{dateStr}</div>
        </div>
      </div>
    </div>
  );
}

export default memo(ClockWidget);
