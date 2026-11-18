import { useState } from 'react';
import { motion } from 'framer-motion';
import Slider from '../shared/Slider';
import { MOODS } from '../../utils/constants';
import { formatPointDelta } from '../../utils/studyFormatting';
import {
  moodPill,
  taskPill,
  formGroupBlock,
  studyCardEntry,
  proceedButton,
  staggerContainer,
  staggerItem
} from '../../utils/motionVariants';

const MOOD_OPTIONS = [
  { value: 1, label: 'Very Low', emoji: '😞' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Excellent', emoji: '😄' }
];

const COMPLETION_OPTIONS = [
  { id: 'completed', label: 'Completed', icon: 'fa-circle-check', desc: 'Finished planned target' },
  { id: 'partial', label: 'Partially Completed', icon: 'fa-circle-half-stroke', desc: 'Good progress made' },
  { id: 'not_completed', label: 'Not Completed', icon: 'fa-circle-xmark', desc: 'Distracted or interrupted' }
];

function AfterStudyCheckIn({ activeSession, onComplete, saveError }) {
  const pre = activeSession?.pre ?? {};

  const [postMood, setPostMood] = useState(pre.mood || 3);
  const [postStress, setPostStress] = useState(pre.stress ?? 5);
  const [postFocus, setPostFocus] = useState(pre.focus ?? 5);
  const [taskCompletion, setTaskCompletion] = useState('');
  const [notes, setNotes] = useState('');

  // Delta calculations
  const focusDelta = Number.isFinite(pre.focus) ? postFocus - pre.focus : null;
  const stressDelta = Number.isFinite(pre.stress) ? pre.stress - postStress : null;
  const moodDelta = Number.isFinite(pre.mood) ? postMood - pre.mood : null;

  const focusClass = focusDelta > 0 ? 'metric-pos' : focusDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const stressClass = stressDelta > 0 ? 'metric-pos' : stressDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const moodClass = moodDelta > 0 ? 'metric-pos' : moodDelta < 0 ? 'metric-neg' : 'metric-neutral';

  const rawElapsed = typeof activeSession?.elapsedSeconds === 'number'
    ? activeSession.elapsedSeconds
    : (activeSession?.totalSeconds || 0);
  const elapsedMins = rawElapsed > 0 ? Math.ceil(rawElapsed / 60) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskCompletion) return;
    onComplete({
      mood: postMood,
      stress: postStress,
      focus: postFocus,
      taskCompletion,
      notes
    });
  };

  return (
    <motion.div
      className="study-card-wrapper after-checkin-card"
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
        <motion.div className="step-pill success-pill" variants={staggerItem}>
          <i className="fas fa-check"></i> Study Block Complete
        </motion.div>
        <motion.h2 className="study-step-title" variants={staggerItem}>
          <i className="fas fa-chart-line text-gradient"></i> How Do You Feel Now?
        </motion.h2>
        <motion.p className="study-step-subtitle" variants={staggerItem}>
          Record your state honestly for this moment to measure how your focus and calmness evolved.
        </motion.p>
      </motion.div>

      <form onSubmit={handleSubmit} className="study-form-body">
        {/* Post-Session Mood */}
        <motion.div
          className="form-group-block"
          custom={0}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-face-smile"></i></span>
            <span>Mood After Studying</span>
          </label>

          <motion.div
            className="mood-select-row"
            role="radiogroup"
            aria-label="Mood After Studying"
            variants={staggerContainer(0.06, 0)}
            initial="hidden"
            animate="visible"
          >
            {MOOD_OPTIONS.map((m) => {
              const isSelected = postMood === m.value;
              return (
                <motion.button
                  key={m.value}
                  type="button"
                  className={`control-option mood-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setPostMood(m.value)}
                  role="radio"
                  aria-checked={isSelected}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...moodPill}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Post-Session Stress */}
        <motion.div
          className="form-group-block"
          custom={1}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <Slider
            label="Stress Level After Studying"
            description="1 = Relaxed and grounded, 10 = High tension"
            value={postStress}
            onChange={setPostStress}
            min={1}
            max={10}
            step={1}
          />
        </motion.div>

        {/* Post-Session Focus */}
        <motion.div
          className="form-group-block"
          custom={2}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <Slider
            label="Focus Level After Studying"
            description="1 = Drained and fragmented, 10 = Sharp and energized"
            value={postFocus}
            onChange={setPostFocus}
            min={1}
            max={10}
            step={1}
          />
        </motion.div>

        {/* Task Completion Status */}
        <motion.div
          className="form-group-block"
          custom={3}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-list-check"></i></span>
            <span>Task Completion</span>
          </label>

          <motion.div
            className="completion-options-grid"
            variants={staggerContainer(0.05, 0)}
            initial="hidden"
            animate="visible"
          >
            {COMPLETION_OPTIONS.map((opt) => {
              const isSelected = taskCompletion === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  className={`control-option completion-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setTaskCompletion(opt.id)}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...taskPill}
                >
                  <i className={`fas ${opt.icon}`}></i>
                  <div>
                    <span className="completion-title">{opt.label}</span>
                    <span className="completion-sub">{opt.desc}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Optional Notes */}
        <motion.div
          className="form-group-block"
          custom={4}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label htmlFor="session-notes-input" className="form-group-label">
            <span className="label-icon"><i className="far fa-note-sticky"></i></span>
            <span>Study Notes & Takeaways (Optional)</span>
          </label>
          <textarea
            id="session-notes-input"
            className="input notes-textarea"
            rows="3"
            placeholder="Add any reflections, topics mastered, or next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </motion.div>

        {/* Before vs After Live Comparison Box */}
        <motion.div
          className="comparison-callout-box"
          custom={5}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <div className="comparison-header">
            <i className="fas fa-scale-balanced" style={{ color: 'var(--workspace-amber)' }}></i>
            <span>Session Impact Analysis ({elapsedMins} min)</span>
          </div>

          <motion.div
            className="comparison-metrics-row"
            variants={staggerContainer(0.06, 0)}
            initial="hidden"
            animate="visible"
          >
            {/* Focus Change */}
            <motion.div className="comparison-col" variants={staggerItem}>
              <span className="col-label">Focus Shift</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${focusClass}`}>
                  <i className="fas fa-brain"></i>
                  <span>{focusDelta === null ? 'Not recorded' : `${focusDelta > 0 ? '+' : ''}${focusDelta} pts`}</span>
                </span>
              </div>
              <span className="col-subtext">Before: {pre.focus ?? '—'} → Now: {postFocus}</span>
            </motion.div>

            {/* Stress Reduction */}
            <motion.div className="comparison-col" variants={staggerItem}>
              <span className="col-label">Stress Relief</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${stressClass}`}>
                  <i className="fas fa-heart-pulse"></i>
                  <span>{stressDelta === null ? 'Not recorded' : formatPointDelta(stressDelta)}</span>
                </span>
              </div>
              <span className="col-subtext">Before: {pre.stress ?? '—'} → Now: {postStress}</span>
            </motion.div>

            {/* Mood Change */}
            <motion.div className="comparison-col" variants={staggerItem}>
              <span className="col-label">Mood Shift</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${moodClass}`}>
                  <span style={{ fontSize: '1.1rem' }}>{MOODS[postMood - 1] || '🙂'}</span>
                  <span>{moodDelta === null ? 'Not recorded' : `${moodDelta > 0 ? '+' : ''}${moodDelta} pts`}</span>
                </span>
              </div>
              <span className="col-subtext">Before: {MOODS[pre.mood - 1] ?? '—'} → Now: {MOODS[postMood - 1]}</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Submit */}
        {saveError && <p className="validation-error-alert" role="alert">{saveError}</p>}

        <motion.div
          className="form-action-footer"
          custom={6}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="submit"
            disabled={!taskCompletion}
            className="btn btn-primary proceed-btn"
            whileHover="hover"
            whileTap="tap"
            initial="rest"
            {...proceedButton}
          >
            <i className="fas fa-save"></i>
            <span>Save Session & Update Statistics</span>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default AfterStudyCheckIn;
