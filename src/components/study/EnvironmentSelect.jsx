import { useState } from 'react';
import { AUDIO, getAudioName, getAudioIcon } from '../../utils/constants';

const DURATION_OPTIONS = [
  { mins: 15, label: '15 min', desc: 'Sprint' },
  { mins: 25, label: '25 min', desc: 'Pomodoro' },
  { mins: 45, label: '45 min', desc: 'Deep Work' },
  { mins: 60, label: '60 min', desc: 'Mastery' }
];

function validateCustomDuration(val) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return 'Please enter a duration in minutes (1–180).';
  }
  const str = String(val).trim();
  const num = Number(str);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return 'Please enter a whole number of minutes (no decimals).';
  }
  if (num < 1) {
    return 'Duration must be at least 1 minute.';
  }
  if (num > 180) {
    return 'Duration cannot exceed 180 minutes (3 hours).';
  }
  return null;
}

function EnvironmentSelect({ envConfig, preCheckIn, onChange, onBack, onStart }) {
  const [isCustomDuration, setIsCustomDuration] = useState(Boolean(envConfig.customDuration));
  const [customError, setCustomError] = useState(() => {
    return envConfig.customDuration ? validateCustomDuration(envConfig.customDuration) : null;
  });

  const effectiveTask = preCheckIn.task === 'Other' && preCheckIn.customTask.trim()
    ? preCheckIn.customTask.trim()
    : preCheckIn.task;

  const handlePresetDuration = (mins) => {
    setIsCustomDuration(false);
    setCustomError(null);
    onChange({ durationMins: mins, customDuration: '' });
  };

  const handleCustomDurationToggle = () => {
    setIsCustomDuration(true);
    const initialVal = envConfig.customDuration || '30';
    setCustomError(validateCustomDuration(initialVal));
    if (!envConfig.customDuration) {
      onChange({ customDuration: '30' });
    }
  };

  const handleCustomDurationChange = (e) => {
    const val = e.target.value;
    setCustomError(validateCustomDuration(val));
    onChange({ customDuration: val });
  };

  const handleStartClick = () => {
    if (isCustomDuration) {
      const err = validateCustomDuration(envConfig.customDuration);
      if (err) {
        setCustomError(err);
        return;
      }
    }
    onStart();
  };

  return (
    <div className="study-card-wrapper environment-select-card">
      <div className="study-card-header">
        <div className="step-pill">
          <span>Step 2 of 2</span>
        </div>
        <h2 className="study-step-title">
          <i className="fas fa-headphones text-gradient"></i> Study Environment Setup
        </h2>
        <p className="study-step-subtitle">
          Configure your timer length and procedural soundscape for this study block.
        </p>
      </div>

      <div className="study-form-body">
        {/* Duration Selection */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="far fa-clock"></i></span>
            <span>Target Duration</span>
          </label>
          <p className="form-group-hint">Select a focused interval or specify custom minutes.</p>

          <div className="duration-pill-row">
            {DURATION_OPTIONS.map((d) => {
              const isSelected = !isCustomDuration && envConfig.durationMins === d.mins;
              return (
                <button
                  key={d.mins}
                  type="button"
                  className={`duration-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handlePresetDuration(d.mins)}
                >
                  <span className="duration-val">{d.label}</span>
                  <span className="duration-sub">{d.desc}</span>
                </button>
              );
            })}

            <button
              type="button"
              className={`duration-select-pill custom-duration-toggle ${isCustomDuration ? 'active' : ''}`}
              onClick={handleCustomDurationToggle}
            >
              <span className="duration-val">Custom</span>
              <span className="duration-sub">Your Time</span>
            </button>
          </div>

          {isCustomDuration && (
            <div className="custom-duration-input-row">
              <label htmlFor="custom-duration-field">Minutes (1 - 180):</label>
              <input
                id="custom-duration-field"
                type="number"
                min="1"
                max="180"
                step="1"
                className={`input custom-duration-input ${customError ? 'input-error' : ''}`}
                placeholder="30"
                value={envConfig.customDuration}
                onChange={handleCustomDurationChange}
                autoFocus
              />
              {customError && (
                <div className="field-error-message" role="alert" style={{ color: '#ff6b8b', fontSize: '0.82rem', marginTop: '6px' }}>
                  <i className="fas fa-circle-exclamation"></i> {customError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Soundscape Selection */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-sliders-h"></i></span>
            <span>Audio Soundscape</span>
          </label>
          <p className="form-group-hint">
            Synthetically generated in real-time by the browser Web Audio API. No external files needed.
          </p>

          <div className="env-audio-grid">
            {AUDIO.map((a) => {
              const isSelected = envConfig.audio === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`env-audio-card ${isSelected ? 'active' : ''}`}
                  style={{ '--card-accent': a.c }}
                  onClick={() => onChange({ audio: a.id })}
                >
                  <div className="env-audio-icon">{a.icon}</div>
                  <div className="env-audio-info">
                    <span className="env-audio-name">{a.n}</span>
                    <span className="env-audio-desc">{a.d}</span>
                  </div>
                  {isSelected && (
                    <div className="env-audio-check">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Summary Card */}
        <div className="session-summary-box">
          <div className="summary-title-row">
            <i className="fas fa-clipboard-check" style={{ color: 'var(--neon-purple)' }}></i>
            <span className="summary-title-text">Session Overview</span>
          </div>

          <div className="summary-meta-grid">
            <div className="summary-meta-item">
              <span className="meta-label">Task</span>
              <span className="meta-value">{effectiveTask}</span>
            </div>
            <div className="summary-meta-item">
              <span className="meta-label">Duration</span>
              <span className="meta-value">
                {isCustomDuration
                  ? (customError ? 'Invalid duration' : `${envConfig.customDuration || 0} minutes`)
                  : `${envConfig.durationMins} minutes`}
              </span>
            </div>
            <div className="summary-meta-item">
              <span className="meta-label">Soundscape</span>
              <span className="meta-value">
                {getAudioIcon(envConfig.audio)} {getAudioName(envConfig.audio)}
              </span>
            </div>
            <div className="summary-meta-item">
              <span className="meta-label">Initial State</span>
              <span className="meta-value">
                Mood {preCheckIn.mood}/5 • Focus {preCheckIn.focus}/10 • Stress {preCheckIn.stress}/10
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-action-footer split-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
            <span>Back to Check-In</span>
          </button>

          <button type="button" className="btn btn-primary start-session-btn" onClick={handleStartClick}>
            <i className="fas fa-play"></i>
            <span>Begin Study Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentSelect;
