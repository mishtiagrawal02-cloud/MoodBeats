import { useState } from 'react';
import { motion } from 'framer-motion';
import Slider from '../shared/Slider';
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

const STUDY_TASKS = [
  'Reading',
  'Writing',
  'Problem Solving',
  'Memorizing',
  'Revision',
  'Coding',
  'Other'
];

function BeforeStudyCheckIn({ preCheckIn, onChange, onNext }) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleTaskSelect = (taskName) => {
    setErrorMsg('');
    onChange({ task: taskName });
  };

  const handleCustomTaskChange = (e) => {
    setErrorMsg('');
    onChange({ customTask: e.target.value });
  };

  const handleValidateAndProceed = (e) => {
    e.preventDefault();
    if (!preCheckIn.mood) {
      setErrorMsg('Please select your current mood before proceeding.');
      return;
    }
    if (!preCheckIn.task) {
      setErrorMsg('Please select what you are studying.');
      return;
    }
    if (preCheckIn.task === 'Other' && !preCheckIn.customTask.trim()) {
      setErrorMsg('Please enter your custom study task name.');
      return;
    }
    setErrorMsg('');
    onNext();
  };

  return (
    <motion.div
      className="study-card-wrapper before-checkin-card"
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
          <span>Step 1 of 2</span>
        </motion.div>
        <motion.h2 className="study-step-title" variants={staggerItem}>
          <i className="fas fa-heart-pulse text-gradient"></i> Before-Study Check-In
        </motion.h2>
        <motion.p className="study-step-subtitle" variants={staggerItem}>
          Record your baseline state so MoodBeats can measure how audio shifts your focus and calm.
        </motion.p>
      </motion.div>

      <form onSubmit={handleValidateAndProceed} className="study-form-body">
        {/* Mood Selection */}
        <motion.div
          className="form-group-block"
          custom={0}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-smile"></i></span>
            <span>Current Mood <span className="req-star">*</span></span>
          </label>
          <p className="form-group-hint">Select the description that best captures your present mental state.</p>

          <motion.div
            className="mood-select-row"
            role="radiogroup"
            aria-label="Current Mood"
            variants={staggerContainer(0.06, 0)}
            initial="hidden"
            animate="visible"
          >
            {MOOD_OPTIONS.map((m) => {
              const isSelected = preCheckIn.mood === m.value;
              return (
                <motion.button
                  key={m.value}
                  type="button"
                  className={`control-option mood-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onChange({ mood: m.value })}
                  role="radio"
                  aria-checked={isSelected}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  custom={{ isSelected }}
                  {...moodPill}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Stress Level Slider */}
        <motion.div
          className="form-group-block"
          custom={1}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <Slider
            label="Stress Level"
            description="1 = Completely relaxed & calm, 10 = High study pressure or overwhelmed"
            value={preCheckIn.stress}
            onChange={(val) => onChange({ stress: val })}
            min={1}
            max={10}
            step={1}
          />
        </motion.div>

        {/* Focus Level Slider */}
        <motion.div
          className="form-group-block"
          custom={2}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <Slider
            label="Focus Level"
            description="1 = Easily distracted & scattered, 10 = Sharp concentration & ready for flow"
            value={preCheckIn.focus}
            onChange={(val) => onChange({ focus: val })}
            min={1}
            max={10}
            step={1}
          />
        </motion.div>

        {/* Task Selection */}
        <motion.div
          className="form-group-block"
          custom={3}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-tasks"></i></span>
            <span>What are you studying? <span className="req-star">*</span></span>
          </label>
          <p className="form-group-hint">Choose your focus category or enter a custom subject.</p>

          <motion.div
            className="task-pill-grid"
            variants={staggerContainer(0.05, 0)}
            initial="hidden"
            animate="visible"
          >
            {STUDY_TASKS.map((t) => {
              const isSelected = preCheckIn.task === t;
              return (
                <motion.button
                  key={t}
                  type="button"
                  className={`control-option task-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleTaskSelect(t)}
                  variants={staggerItem}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isSelected ? 'active' : 'rest'}
                  initial="rest"
                  {...taskPill}
                >
                  {t}
                </motion.button>
              );
            })}
          </motion.div>

          {preCheckIn.task === 'Other' && (
            <motion.div
              className="custom-task-input-wrapper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <label htmlFor="custom-task-field" className="custom-task-label">
                Enter Custom Task Name:
              </label>
              <input
                id="custom-task-field"
                type="text"
                className="input custom-task-input"
                placeholder="e.g. Thesis Research, Physics Problem Set, Japanese Kanji"
                value={preCheckIn.customTask}
                onChange={handleCustomTaskChange}
                autoFocus
              />
            </motion.div>
          )}
        </motion.div>

        {errorMsg && (
          <motion.div
            className="validation-error-alert"
            role="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <i className="fas fa-exclamation-triangle"></i>
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <motion.div
          className="form-action-footer"
          custom={4}
          variants={formGroupBlock}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="submit"
            className="btn btn-primary proceed-btn"
            whileHover="hover"
            whileTap="tap"
            initial="rest"
            {...proceedButton}
          >
            <span>Continue to Environment Setup</span>
            <i className="fas fa-arrow-right"></i>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default BeforeStudyCheckIn;
