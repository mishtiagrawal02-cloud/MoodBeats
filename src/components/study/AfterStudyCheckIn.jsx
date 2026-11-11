import { useState } from 'react';
import Slider from '../shared/Slider';
import { MOODS } from '../../utils/constants';

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

function AfterStudyCheckIn({ activeSession, onComplete }) {
  const pre = activeSession?.pre || { mood: 3, stress: 5, focus: 5 };

  const [postMood, setPostMood] = useState(pre.mood || 3);
  const [postStress, setPostStress] = useState(Math.max(1, (pre.stress || 5) - 1));
  const [postFocus, setPostFocus] = useState(Math.min(10, (pre.focus || 5) + 1));
  const [taskCompletion, setTaskCompletion] = useState('completed');
  const [notes, setNotes] = useState('');

  // Delta calculations
  const focusDelta = postFocus - pre.focus;
  const stressDelta = pre.stress - postStress; // positive is good (stress reduction)
  const moodDelta = postMood - pre.mood;

  const focusClass = focusDelta > 0 ? 'metric-pos' : focusDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const stressClass = stressDelta > 0 ? 'metric-pos' : stressDelta < 0 ? 'metric-neg' : 'metric-neutral';
  const moodClass = moodDelta > 0 ? 'metric-pos' : moodDelta < 0 ? 'metric-neg' : 'metric-neutral';

  const rawElapsed = typeof activeSession?.elapsedSeconds === 'number'
    ? activeSession.elapsedSeconds
    : (activeSession?.totalSeconds || 0);
  const elapsedMins = rawElapsed > 0 ? Math.ceil(rawElapsed / 60) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      mood: postMood,
      stress: postStress,
      focus: postFocus,
      taskCompletion,
      notes
    });
  };

  return (
    <div className="study-card-wrapper after-checkin-card">
      <div className="study-card-header">
        <div className="step-pill success-pill">
          <i className="fas fa-check"></i> Study Block Complete
        </div>
        <h2 className="study-step-title">
          <i className="fas fa-chart-line text-gradient"></i> How Do You Feel Now?
        </h2>
        <p className="study-step-subtitle">
          Record your state honestly for this moment to measure how your focus and calmness evolved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="study-form-body">
        {/* Post-Session Mood */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-face-smile"></i></span>
            <span>Mood After Studying</span>
          </label>

          <div className="mood-select-row" role="radiogroup" aria-label="Mood After Studying">
            {MOOD_OPTIONS.map((m) => {
              const isSelected = postMood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  className={`mood-select-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setPostMood(m.value)}
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

        {/* Post-Session Stress */}
        <div className="form-group-block">
          <Slider
            label="Stress Level After Studying"
            description="1 = Relaxed and grounded, 10 = High tension"
            value={postStress}
            onChange={setPostStress}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Post-Session Focus */}
        <div className="form-group-block">
          <Slider
            label="Focus Level After Studying"
            description="1 = Drained and fragmented, 10 = Sharp and energized"
            value={postFocus}
            onChange={setPostFocus}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Task Completion Status */}
        <div className="form-group-block">
          <label className="form-group-label">
            <span className="label-icon"><i className="fas fa-list-check"></i></span>
            <span>Task Completion</span>
          </label>

          <div className="completion-options-grid">
            {COMPLETION_OPTIONS.map((opt) => {
              const isSelected = taskCompletion === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`completion-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setTaskCompletion(opt.id)}
                >
                  <i className={`fas ${opt.icon}`}></i>
                  <div>
                    <span className="completion-title">{opt.label}</span>
                    <span className="completion-sub">{opt.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="form-group-block">
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
        </div>

        {/* Before vs After Live Comparison Box */}
        <div className="comparison-callout-box">
          <div className="comparison-header">
            <i className="fas fa-scale-balanced" style={{ color: 'var(--neon-purple)' }}></i>
            <span>Session Impact Analysis ({elapsedMins} min)</span>
          </div>

          <div className="comparison-metrics-row">
            {/* Focus Change */}
            <div className="comparison-col">
              <span className="col-label">Focus Shift</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${focusClass}`}>
                  <i className="fas fa-brain"></i>
                  <span>{focusDelta > 0 ? `+${focusDelta}` : focusDelta} pts</span>
                </span>
              </div>
              <span className="col-subtext">Before: {pre.focus} → Now: {postFocus}</span>
            </div>

            {/* Stress Reduction */}
            <div className="comparison-col">
              <span className="col-label">Stress Relief</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${stressClass}`}>
                  <i className="fas fa-heart-pulse"></i>
                  <span>{stressDelta > 0 ? `-${stressDelta} stress` : stressDelta < 0 ? `+${Math.abs(stressDelta)} stress` : 'calm'}</span>
                </span>
              </div>
              <span className="col-subtext">Before: {pre.stress} → Now: {postStress}</span>
            </div>

            {/* Mood Change */}
            <div className="comparison-col">
              <span className="col-label">Mood Shift</span>
              <div className="col-delta-badge">
                <span className={`metric-tag ${moodClass}`}>
                  <span style={{ fontSize: '1.1rem' }}>{MOODS[postMood - 1] || '🙂'}</span>
                  <span>{moodDelta > 0 ? `+${moodDelta}` : moodDelta === 0 ? 'steady' : moodDelta} pts</span>
                </span>
              </div>
              <span className="col-subtext">Before: {MOODS[pre.mood - 1]} → Now: {MOODS[postMood - 1]}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-action-footer">
          <button type="submit" className="btn btn-primary proceed-btn">
            <i className="fas fa-save"></i>
            <span>Save Session & Update Statistics</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AfterStudyCheckIn;
