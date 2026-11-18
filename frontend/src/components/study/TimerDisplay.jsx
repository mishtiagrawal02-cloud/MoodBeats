import { useEffect, useRef, useState } from 'react';

function TimerDisplay({ remainingSeconds = 0, totalSeconds, isPaused = false }) {
  const previousSeconds = useRef(remainingSeconds);
  const milestoneTimeout = useRef(null);
  const [milestone, setMilestone] = useState('');
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  useEffect(() => {
    const previous = previousSeconds.current;
    previousSeconds.current = remainingSeconds;
    if (isPaused || remainingSeconds <= 0) return;

    const thresholds = [
      [10, '10 seconds left'],
      [60, '1 minute left'],
      [totalSeconds * 0.25, '75% complete'],
      [totalSeconds * 0.5, 'Halfway through'],
      [totalSeconds * 0.75, '25% complete']
    ];
    const crossed = thresholds.find(([threshold]) =>
      remainingSeconds <= threshold && previous > threshold
    );
    if (!crossed) return;

    clearTimeout(milestoneTimeout.current);
    setMilestone(crossed[1]);
    milestoneTimeout.current = setTimeout(() => setMilestone(''), 1800);
  }, [isPaused, remainingSeconds, totalSeconds]);

  useEffect(() => () => clearTimeout(milestoneTimeout.current), []);

  return (
    <div className="room-countdown" data-paused={isPaused}>
      <div
        className="room-time"
        role="timer"
        aria-label={`${minutes} minutes, ${seconds} seconds remaining`}
      >
        {time}
      </div>
      <span key={milestone} className={milestone ? 'room-timer-milestone' : undefined}>
        {milestone || 'Time remaining'}
      </span>
    </div>
  );
}

export default TimerDisplay;
