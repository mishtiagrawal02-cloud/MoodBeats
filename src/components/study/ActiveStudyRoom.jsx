import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TimerDisplay from './TimerDisplay';
import MusicPlayerCard from './MusicPlayerCard';
import NightWindow from './NightWindow';

function ActiveStudyRoom({
  activeSession,
  timerData,
  onPause,
  onResume,
  onSetVolume,
  onSetAudio,
  onSetBackground,
  audioError,
  onEndForCheckIn,
  onAbandon
}) {
  const dialog = useRef(null);
  const cancelButton = useRef(null);
  const reduceMotion = useReducedMotion();
  const { status, task, audio, volume, totalSeconds } = activeSession;
  const isPaused = status === 'PAUSED';
  const remainingSeconds = timerData?.remainingSeconds ?? totalSeconds;
  const elapsedSeconds = timerData?.elapsedSeconds ?? 0;
  const progress = timerData?.progress ?? 0;
  const percent = Math.round(progress * 100);
  const toggleSession = isPaused ? onResume : onPause;

  function completeSession(action) {
    dialog.current.close();
    action();
  }

  function openEndDialog() {
    dialog.current.showModal();
    cancelButton.current.focus({ preventScroll: true });
  }

  return (
    <motion.div
      className="active-study-room-container"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24 }}
    >
      <header className="room-topbar">
        <div className="room-brand">
          <span className="room-brand-mark" aria-hidden="true">
            <i className="fas fa-wave-square" />
          </span>
          MoodBeats
        </div>
        <Link className="room-dashboard-link" to="/dashboard">
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Dashboard
        </Link>
      </header>

      <div className="room-content">
        <div className="room-heading">
          <div>
            <h1>Study room</h1>
            <p className="room-task">
              <i className="fas fa-book-open" aria-hidden="true" />
              {task || 'Focus session'}
            </p>
          </div>
          <div className="room-status" data-paused={isPaused} role="status">
            <span className="room-status-light" aria-hidden="true" />
            {isPaused ? 'Session paused' : 'Session active'}
          </div>
        </div>

        <div className="room-workspace">
          <NightWindow background={activeSession.background} onSceneChange={onSetBackground} />

          <div className="room-controls">
            <section className="room-panel room-focus" aria-labelledby="room-focus-title">
              <div className="room-panel-heading">
                <h2 id="room-focus-title">Focus timer</h2>
                <span>{Math.round(totalSeconds / 60)} min session</span>
              </div>

              <div className="room-ring">
                <svg
                  viewBox="0 0 160 160"
                  role="progressbar"
                  aria-label="Session progress"
                  aria-valuenow={percent}
                >
                  <circle className="room-ring-track" cx="80" cy="80" r="74" />
                  <circle
                    className="room-ring-fill"
                    cx="80"
                    cy="80"
                    r="74"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - progress * 100}
                  />
                </svg>
                <TimerDisplay
                  remainingSeconds={remainingSeconds}
                  totalSeconds={totalSeconds}
                  isPaused={isPaused}
                />
              </div>

              <div className="room-progress">
                <div className="room-progress-label" aria-hidden="true">
                  <span>Session progress</span>
                  <span>{percent}%</span>
                </div>
              </div>

              <div className="room-actions">
                <button className="btn btn-primary" type="button" onClick={toggleSession}>
                  <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true" />
                  {isPaused ? 'Resume timer' : 'Pause timer'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={openEndDialog}
                >
                  End session
                </button>
              </div>
            </section>

            <MusicPlayerCard
              audio={audio}
              volume={volume}
              isPaused={isPaused}
              onToggle={toggleSession}
              onSetVolume={onSetVolume}
              onSetAudio={onSetAudio}
              audioError={audioError}
            />
          </div>
        </div>
      </div>

      <dialog
        className="dialog-surface room-dialog"
        ref={dialog}
        aria-labelledby="room-dialog-title"
        aria-describedby="room-dialog-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current.close();
        }}
      >
        <div className="room-dialog-content">
          <div className="room-dialog-icon" aria-hidden="true"><i className="fas fa-hourglass-end" /></div>
          <h2 id="room-dialog-title">End this session?</h2>
          <p id="room-dialog-description">
            You’ve studied for {Math.floor(elapsedSeconds / 60)} min {elapsedSeconds % 60} sec.
            Finish to record your progress and check in.
          </p>
          <div className="room-dialog-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => completeSession(onEndForCheckIn)}
            >
              Finish &amp; check in
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => completeSession(onAbandon)}
            >
              Discard session
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              ref={cancelButton}
              onClick={() => dialog.current.close()}
            >
              Return to timer
            </button>
          </div>
        </div>
      </dialog>
    </motion.div>
  );
}

export default ActiveStudyRoom;
