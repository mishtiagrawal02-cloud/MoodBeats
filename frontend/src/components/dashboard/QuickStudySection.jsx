import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AUDIO, TASKS } from '../../utils/constants';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

const DURATION_PRESETS = [
  { mins: 15, label: '15 min', tag: 'Sprint' },
  { mins: 25, label: '25 min', tag: 'Pomodoro' },
  { mins: 45, label: '45 min', tag: 'Deep Work' },
  { mins: 60, label: '60 min', tag: 'Mastery' }
];

function QuickStudySection({ quickConfig, onUpdateConfig }) {
  const navigate = useNavigate();

  const selectedMins = quickConfig?.mins || 25;
  const selectedTask = quickConfig?.task || 'Reading';
  const selectedAudio = quickConfig?.audio || 'lofi';

  const handleLaunch = () => {
    // Stage pre-session choices so /study can seamlessly inherit them
    onUpdateConfig({
      mins: selectedMins,
      task: selectedTask,
      audio: selectedAudio
    });
    navigate('/study');
  };

  return (
    <section className="dashboard-section-card quick-study-container" aria-label="Quick Study Setup">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <i className="fas fa-bolt" style={{ color: 'var(--electric-violet)' }}></i>
            Quick Study Session
          </h2>
          <p className="section-subtitle">
            Configure your target duration, focus task, and soundscape to jump straight into study mode.
          </p>
        </div>
        <span className="checkin-workflow-badge">
          <i className="fas fa-shield-alt"></i> Mood check-in occurs inside Study Room
        </span>
      </div>

      <motion.div 
        className="quick-study-grid"
        variants={staggerContainer(0.1, 0)}
        initial="hidden"
        animate="visible"
      >
        {/* Preset Duration */}
        <motion.div className="quick-study-group" variants={staggerItem}>
          <label className="quick-study-label">
            <i className="far fa-clock"></i> Target Duration
          </label>
          <div className="preset-chip-group">
            {DURATION_PRESETS.map((p) => {
              const active = selectedMins === p.mins;
              return (
                <motion.button
                  key={p.mins}
                  type="button"
                  className={`preset-chip ${active ? 'active' : ''}`}
                  onClick={() => onUpdateConfig({ mins: p.mins })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="chip-time">{p.label}</span>
                  <span className="chip-tag">{p.tag}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Task Category */}
        <motion.div className="quick-study-group" variants={staggerItem}>
          <label className="quick-study-label">
            <i className="fas fa-tasks"></i> Focus Task
          </label>
          <div className="task-chip-group">
            {TASKS.map((t) => {
              const active = selectedTask === t;
              return (
                <motion.button
                  key={t}
                  type="button"
                  className={`task-chip ${active ? 'active' : ''}`}
                  onClick={() => onUpdateConfig({ task: t })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {t}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Audio Soundscape */}
        <motion.div className="quick-study-group" variants={staggerItem}>
          <label className="quick-study-label">
            <i className="fas fa-music"></i> Preferred Soundscape
          </label>
          <div className="audio-mini-chips">
            {AUDIO.map((a) => {
              const active = selectedAudio === a.id;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  className={`audio-mini-chip ${active ? 'active' : ''}`}
                  style={{ '--audio-theme': a.c }}
                  onClick={() => onUpdateConfig({ audio: a.id })}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="audio-mini-icon">{a.icon}</span>
                  <span className="audio-mini-name">{a.n}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="quick-study-footer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="quick-study-summary">
          <span>Selected: </span>
          <strong>{selectedMins} minutes</strong> of <strong>{selectedTask}</strong> with <strong>{AUDIO.find(a => a.id === selectedAudio)?.n || 'Lo-fi'}</strong> soundscape
        </div>

        <motion.button
          type="button"
          className="btn btn-primary launch-session-btn"
          onClick={handleLaunch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-play-circle"></i>
          <span>Launch Study Session</span>
        </motion.button>
      </motion.div>
    </section>
  );
}

export default QuickStudySection;

