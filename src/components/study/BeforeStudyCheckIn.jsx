import { useState } from 'react';
import Slider from '../shared/Slider';

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
    <div className="study-card-wrapper before-checkin-card">
      <div className="study-card-header">
        <div className="step-pill">
          <span>Step 1 of 2</span>
        </div>
        <h2 className="study-step-title">
          <i className="fas fa-heart-pulse text-gradient"></i> Before-Study Check-In
        </h2>
        <p className="study-step-subtitle">
          Record your baseline state so MoodBeats can measure how audio shifts your focus and calm.
        </p>
      </div>

      <form onSubmit={handleValidateAndProceed} className="study-form-body">
        {/* Mood Selection */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-smile"></i></span>
            <span>Current Mood <span className="req-star">*</span></span>
          </label>
          <p className="form-group-hint">Select the description that best captures your present mental state.</p>

          <div className="mood-select-row" role="radiogroup" aria-label="Current Mood">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = preCheckIn.mood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  className={`mood-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => onChange({ mood: m.value })}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span className="mood-emoji">{m.emoji}</span>
                  <span className="mood-label">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stress Level Slider */}
        <div className="form-group-block">
          <Slider
            label="Stress Level"
            description="1 = Completely relaxed & calm, 10 = High study pressure or overwhelmed"
            value={preCheckIn.stress}
            onChange={(val) => onChange({ stress: val })}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Focus Level Slider */}
        <div className="form-group-block">
          <Slider
            label="Focus Level"
            description="1 = Easily distracted & scattered, 10 = Sharp concentration & ready for flow"
            value={preCheckIn.focus}
            onChange={(val) => onChange({ focus: val })}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Task Selection */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-tasks"></i></span>
            <span>What are you studying? <span className="req-star">*</span></span>
          </label>
          <p className="form-group-hint">Choose your focus category or enter a custom subject.</p>

          <div className="task-pill-grid">
            {STUDY_TASKS.map((t) => {
              const isSelected = preCheckIn.task === t;
              return (
                <button
                  key={t}
                  type="button"
                  className={`task-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleTaskSelect(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {preCheckIn.task === 'Other' && (
            <div className="custom-task-input-wrapper">
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
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="validation-error-alert" role="alert">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-action-footer">
          <button type="submit" className="btn btn-primary proceed-btn">
            <span>Continue to Environment Setup</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </form>
    </div>
  );
}

export default BeforeStudyCheckIn;
