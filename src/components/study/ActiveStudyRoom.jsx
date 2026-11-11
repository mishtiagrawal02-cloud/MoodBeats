import { useState } from 'react';
import { getAudioName, getAudioIcon, getAudioColor } from '../../utils/constants';

function formatClock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function ActiveStudyRoom({
  activeSession,
  timerData,
  onPause,
  onResume,
  onSetVolume,
  onEndForCheckIn,
  onAbandon
}) {
  const [showEndModal, setShowEndModal] = useState(false);

  const { status, task, audio, volume, totalSeconds } = activeSession || {};
  const isPaused = status === 'PAUSED';
  const remainingSeconds = timerData?.remainingSeconds ?? totalSeconds ?? 0;
  const elapsedSeconds = timerData?.elapsedSeconds ?? 0;
  const progress = timerData?.progress ?? 0;

  const audioColor = getAudioColor(audio);
  const audioName = getAudioName(audio);
  const audioIcon = getAudioIcon(audio);

  // SVG Ring metrics: Radius 138, Circumference = 2 * PI * 138 ≈ 867.08
  const radius = 138;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  return (
    <div className={`active-study-room-container ${isPaused ? 'is-paused' : ''}`}>
      {/* Top Session Status Bar */}
      <div className="study-room-header">
        <div className="room-meta-pill">
          <span className="pulse-indicator"></span>
          <span className="room-status-text">
            {isPaused ? 'SESSION PAUSED' : 'STUDY SESSION ACTIVE'}
          </span>
        </div>

        <div className="room-task-badge">
          <i className="fas fa-book-open"></i>
          <span>{task}</span>
        </div>

        <div className="room-audio-badge" style={{ borderColor: audioColor }}>
          <span>{audioIcon}</span>
          <span>{audioName}</span>
        </div>
      </div>

      {/* Main Focus Vinyl & Circular Timer */}
      <div className="study-disc-wrapper">
        <div className={`study-vinyl-disc ${isPaused ? 'paused-animation' : ''}`}>
          <svg viewBox="0 0 320 320" className="vinyl-svg" aria-hidden="true">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B35FF" />
                <stop offset="100%" stopColor="#BF5AFF" />
              </linearGradient>

              <radialGradient id="center-label" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#BF5AFF" />
                <stop offset="60%" stopColor="#8B35FF" />
                <stop offset="100%" stopColor="#2E1463" />
              </radialGradient>
            </defs>

            {/* Rotating Vinyl Grooves Group */}
            <g className="spinning-grooves">
              <circle cx="160" cy="160" r="148" fill="#08050D" stroke="#25183A" strokeWidth="3" />
              {[134, 120, 106, 92, 78].map((r) => (
                <circle
                  key={r}
                  cx="160"
                  cy="160"
                  r={r}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.04"
                  strokeWidth="1.5"
                />
              ))}
              {/* Highlight sheen lines */}
              <path
                d="M160 18 A142 142 0 0 1 292 100"
                stroke="#FFFFFF"
                strokeOpacity="0.12"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M160 302 A142 142 0 0 1 28 220"
                stroke="#FFFFFF"
                strokeOpacity="0.08"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Outer Background Track */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="rgba(139, 53, 255, 0.16)"
              strokeWidth="6"
            />

            {/* Live Progress Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 160 160)"
              className="progress-ring-stroke"
            />

            {/* Center Record Label */}
            <circle cx="160" cy="160" r="58" fill="url(#center-label)" stroke="#BF5AFF" strokeWidth="1.5" />
            <circle cx="160" cy="160" r="6" fill="#09070D" />
          </svg>

          {/* Central Digital Clock */}
          <div className="study-clock-display" aria-live="polite">
            <span className="study-time-digits">{formatClock(remainingSeconds)}</span>
            <span className="study-time-sub">
              {isPaused ? 'Timer Paused' : `${Math.round(progress * 100)}% Complete`}
            </span>
          </div>
        </div>
      </div>

      {/* Audio Volume Controls (when audio is active) */}
      {audio !== 'none' && (
        <div className="study-room-volume-box">
          <i
            className={`fas ${volume > 0 ? 'fa-volume-high' : 'fa-volume-xmark'}`}
            style={{ color: 'var(--soft-lavender)' }}
          ></i>
          <label htmlFor="study-room-vol-slider" className="sr-only">
            Volume Control
          </label>
          <input
            id="study-room-vol-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume ?? 0.6}
            onChange={(e) => onSetVolume(Number(e.target.value))}
            className="room-vol-slider"
            title={`Volume: ${Math.round((volume ?? 0.6) * 100)}%`}
          />
          <span className="room-vol-label">{Math.round((volume ?? 0.6) * 100)}%</span>
        </div>
      )}

      {/* Main Controls: Pause/Resume & End Session */}
      <div className="study-room-actions">
        {isPaused ? (
          <button type="button" className="btn btn-primary room-control-btn" onClick={onResume}>
            <i className="fas fa-play"></i>
            <span>Resume Focus</span>
          </button>
        ) : (
          <button type="button" className="btn btn-secondary room-control-btn" onClick={onPause}>
            <i className="fas fa-pause"></i>
            <span>Pause Timer</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary room-end-btn"
          onClick={() => setShowEndModal(true)}
        >
          <i className="fas fa-stop"></i>
          <span>End Session</span>
        </button>
      </div>

      {/* End Session Confirmation Dialog */}
      {showEndModal && (
        <div className="room-modal-backdrop" onClick={() => setShowEndModal(false)}>
          <div className="room-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge">
              <i className="fas fa-hourglass-end"></i>
            </div>
            <h3 className="modal-heading">Wrap Up Your Study Block?</h3>
            <p className="modal-copy">
              You have studied for <strong>{elapsedSeconds > 0 ? `${Math.ceil(elapsedSeconds / 60)} minutes` : '0 minutes'}</strong> of this session.
              How would you like to proceed?
            </p>

            <div className="modal-choices">
              <button
                type="button"
                className="btn btn-primary modal-choice-btn"
                onClick={() => {
                  setShowEndModal(false);
                  onEndForCheckIn();
                }}
              >
                <i className="fas fa-check-circle"></i>
                <div>
                  <strong>Finish & Check In</strong>
                  <span className="sub-desc">Save your progress and measure focus change</span>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary modal-choice-btn abandon-btn"
                onClick={() => {
                  setShowEndModal(false);
                  onAbandon();
                }}
              >
                <i className="fas fa-trash-alt"></i>
                <div>
                  <strong>Discard Session</strong>
                  <span className="sub-desc">Abandon this session without saving to statistics</span>
                </div>
              </button>

              <button
                type="button"
                className="modal-cancel-link"
                onClick={() => setShowEndModal(false)}
              >
                Return to Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActiveStudyRoom;
