import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AUDIO } from '../../utils/constants';
import { staggerContainer, staggerItem, selectionRing } from '../../utils/motionVariants';

function AudioExplorerSection({ selectedAudio = 'lofi', onSelectAudio }) {
  const navigate = useNavigate();

  return (
    <section id="audio-explorer-section" className="dashboard-section-card audio-explorer-container" aria-label="Audio Environment Explorer">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <i className="fas fa-headphones" style={{ color: 'var(--soft-lavender)' }}></i>
            Audio Environment Explorer
          </h2>
          <p className="section-subtitle">
            Choose from six synthetically synthesized audio engines engineered for deep focus.
          </p>
        </div>

        <motion.button
          type="button"
          className="link-view-all-btn"
          onClick={() => navigate('/audio')}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span>Open Full Audio Library</span>
          <i className="fas fa-arrow-right"></i>
        </motion.button>
      </div>

      <motion.div 
        className="audio-cards-grid"
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="visible"
      >
        {AUDIO.map((audio) => {
          const isSelected = selectedAudio === audio.id;

          return (
            <motion.div
              key={audio.id}
              className={`audio-explorer-card ${isSelected ? 'is-selected' : ''}`}
              style={{ '--audio-accent': audio.c }}
              onClick={() => onSelectAudio && onSelectAudio({ audio: audio.id })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAudio && onSelectAudio({ audio: audio.id });
                }
              }}
              aria-pressed={isSelected}
              variants={staggerItem}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 8px 24px rgba(139, 53, 255, 0.2)',
                borderColor: 'rgba(139, 53, 255, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="audio-card-top">
                <motion.span 
                  className="audio-card-icon"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {audio.icon}
                </motion.span>
                {isSelected && (
                  <motion.span 
                    className="audio-active-badge"
                    variants={selectionRing}
                    initial="initial"
                    animate="animate"
                  >
                    <i className="fas fa-check"></i> Active Preset
                  </motion.span>
                )}
              </div>

              <div className="audio-card-body">
                <h3 className="audio-card-title">{audio.n}</h3>
                <p className="audio-card-desc">{audio.d}</p>
              </div>

              <div className="audio-card-footer">
                <span className="audio-type-tag">
                  {audio.type === 'none' ? 'Zero Sound' : 'Web Audio API'}
                </span>
                <motion.span 
                  className="audio-select-hint"
                  initial={{ opacity: 0.6 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSelected ? 'Ready for study' : 'Click to select'}
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

export default AudioExplorerSection;

