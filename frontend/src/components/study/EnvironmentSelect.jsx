import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUDIO, getAudioName, getAudioGlyph } from '../../utils/constants';
import { formatDurationLabel } from '../../utils/studyFormatting';
import { STUDY_SCENES } from '../../utils/studyScenes';
import {
  durationPill,
  audioCard,
  audioIcon,
  selectionCheckmark,
  formGroupBlock,
  studyCardEntry,
  sessionSummaryBox,
  proceedButton,
  staggerContainer,
  staggerItem
} from '../../utils/motionVariants';

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

function EnvironmentSelect({ envConfig, preCheckIn, onChange, onSceneChange, onBack, onStart }) {
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
    <motion.div
      className="study-card-wrapper environment-select-card"
      variants={studyCardEntry}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="study-card-header"
        variants={staggerContainer(0.08, 0)}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="step-pill" variants={staggerItem}>
          <span>Step 2 of 2</span>
        </motion.div>
        <motion.h2 className="study-step-title" variants={staggerItem}>
          <i className="fas fa-headphones text-gradient"></i> Study Environment Setup
        </motion.h2>
        <motion.p className="study-step-subtitle" variants={staggerItem}>
          Configure your timer length and procedural soundscape for this study block.
        </motion.p>
      </motion.div>

      <div className="study-form-body">
        {/* Duration Selection */}
        <motion.div
          className="form-group-block"
          custom={0}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="far fa-clock"></i></span>
            <span>Target Duration</span>
          </label>
          <p className="form-group-hint">Select a focused interval or specify custom minutes.</p>

          <motion.div
            className="duration-pill-row"
            variants={staggerContainer(0.05, 0)}
            initial="hidden"
            animate="visible"
          >
            {DURATION_OPTIONS.map((d) => {
              const isSelected = !isCustomDuration && envConfig.durationMins === d.mins;
              return (
                <motion.button
                  key={d.mins}
                  type="button"
                  className={`control-option duration-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handlePresetDuration(d.mins)}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...durationPill}
                >
                  <span className="duration-val">{d.label}</span>
                  <span className="duration-sub">{d.desc}</span>
                </motion.button>
              );
            })}

            <motion.button
              type="button"
              className={`control-option duration-select-pill custom-duration-toggle ${isCustomDuration ? 'active' : ''}`}
              onClick={handleCustomDurationToggle}
              variants={staggerItem}
              whileHover="hover"
              whileTap="tap"
              animate={isCustomDuration ? 'active' : 'rest'}
              initial="rest"
              {...durationPill}
            >
              <span className="duration-val">Custom</span>
              <span className="duration-sub">Your Time</span>
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {isCustomDuration && (
              <motion.div
                className="custom-duration-input-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
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
                  <motion.div
                    className="field-error-message"
                    role="alert"
                    style={{ color: 'var(--workspace-error)', fontSize: '0.82rem', marginTop: '6px' }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <i className="fas fa-circle-exclamation"></i> {customError}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Audio Soundscape Selection */}
        <motion.div
          className="form-group-block"
          custom={1}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-sliders-h"></i></span>
            <span>Audio Soundscape</span>
          </label>
          <p className="form-group-hint">
            Synthetically generated in real-time by the browser Web Audio API. No external files needed.
          </p>

          <motion.div
            className="env-audio-grid"
            variants={staggerContainer(0.06, 0)}
            initial="hidden"
            animate="visible"
          >
            {AUDIO.map((a) => {
              const isSelected = envConfig.audio === a.id;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  className={`control-option env-audio-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onChange({ audio: a.id })}
                  aria-pressed={isSelected}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...audioCard}
                >
                  <motion.div
                    className="env-audio-icon"
                    whileHover="hover"
                    initial="rest"
                    {...audioIcon}
                  >
                    <i className={`fas ${a.glyph}`} aria-hidden="true" />
                  </motion.div>
                  <div className="env-audio-info">
                    <span className="env-audio-name">{a.n}</span>
                    <span className="env-audio-desc">{a.d}</span>
                  </div>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="env-audio-check"
                        variants={selectionCheckmark}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <i className="fas fa-check"></i>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Background Scene Selection */}
        <motion.div
          className="form-group-block"
          custom={2}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-image"></i></span>
            <span>Background Scene</span>
          </label>
          <p className="form-group-hint">
            Pick the view for your study room. It follows you into the active session.
          </p>

          <motion.div
            className="scene-select-grid"
            variants={staggerContainer(0.06, 0)}
            initial="hidden"
            animate="visible"
          >
            {STUDY_SCENES.map((scene) => {
              const isSelected = envConfig.background === scene.id;
              return (
                <motion.button
                  key={scene.id}
                  type="button"
                  className={`control-option scene-select-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSceneChange(scene.id)}
                  aria-pressed={isSelected}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...audioCard}
                >
                  <span className="scene-thumb" aria-hidden="true">
                    <img src={scene.art} alt="" loading="lazy" />
                  </span>
                  <span className="scene-info">
                    <span className="scene-name">{scene.name}</span>
                    <span className="scene-desc">{scene.desc}</span>
                  </span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="env-audio-check"
                        variants={selectionCheckmark}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <i className="fas fa-check"></i>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Session Summary Card */}
        <motion.div
          className="session-summary-box"
          variants={sessionSummaryBox}
          initial="hidden"
          animate="visible"
        >
          <div className="summary-title-row">
            <i className="fas fa-clipboard-check" style={{ color: 'var(--workspace-amber)' }}></i>
            <span className="summary-title-text">Session Overview</span>
          </div>

          <motion.div
            className="summary-meta-grid"
            variants={staggerContainer(0.05, 0)}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="summary-meta-item" variants={staggerItem}>
              <span className="meta-label">Task</span>
              <span className="meta-value">{effectiveTask}</span>
            </motion.div>
            <motion.div className="summary-meta-item" variants={staggerItem}>
              <span className="meta-label">Duration</span>
              <span className="meta-value">
                {isCustomDuration
                  ? (customError ? 'Invalid duration' : formatDurationLabel(envConfig.customDuration || 0))
                  : formatDurationLabel(envConfig.durationMins)}
              </span>
            </motion.div>
            <motion.div className="summary-meta-item" variants={staggerItem}>
              <span className="meta-label">Soundscape</span>
              <span className="meta-value">
                <i className={`fas ${getAudioGlyph(envConfig.audio)}`} aria-hidden="true" /> {getAudioName(envConfig.audio)}
              </span>
            </motion.div>
            <motion.div className="summary-meta-item" variants={staggerItem}>
              <span className="meta-label">Initial State</span>
              <span className="meta-value">
                Mood {preCheckIn.mood}/5 • Focus {preCheckIn.focus}/10 • Stress {preCheckIn.stress}/10
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="form-action-footer split-actions"
          custom={2}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            whileHover="hover"
            whileTap="tap"
            initial="rest"
            {...proceedButton}
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Check-In</span>
          </motion.button>

          <motion.button
            type="button"
            className="btn btn-primary start-session-btn"
            onClick={handleStartClick}
            whileHover="hover"
            whileTap="tap"
            initial="rest"
            {...proceedButton}
          >
            <i className="fas fa-play"></i>
            <span>Begin Study Session</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default EnvironmentSelect;
