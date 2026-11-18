import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StudyDeskIllustration from './StudyDeskIllustration';


function HeroSection({ streak = 0, hasDemoData = false, onRemoveDemoData }) {
  const navigate = useNavigate();

  return (
    <section className="dashboard-hero-card" aria-label="Study Companion Hero">
      <div className="hero-content-wrapper">
        <motion.div 
          className="hero-text-block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.span 
              className="pulse-dot"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: streak > 0 ? Infinity : 0 }}
            />
            <span>{streak > 0 ? `${streak} Day Focus Streak Active` : 'Your Ambient Focus Sanctuary'}</span>
          </motion.div>

          <motion.h2 
            className="hero-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Find Your Flow In Deep <span className="text-gradient">Soundscapes</span>
          </motion.h2>

          <motion.p 
            className="hero-description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Immerse yourself in synthetically synthesized audio environments designed to sharpen concentration, dissolve mental stress, and turn study hours into effortless flow.
          </motion.p>

          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button
              type="button"
              className="btn btn-primary hero-primary-btn"
              onClick={() => navigate('/study')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-play"></i>
              <span>Start Studying</span>
            </motion.button>

            <motion.button
              type="button"
              className="btn btn-secondary hero-secondary-btn"
              onClick={() => {
                const el = document.getElementById('audio-explorer-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/audio');
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-headphones"></i>
              <span>Explore Audio Types</span>
            </motion.button>
          </motion.div>

          {hasDemoData && (
            <motion.div 
              className="demo-data-alert"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="demo-data-info">
                <i className="fas fa-info-circle"></i>
                <span>Showing <strong>DEMO DATA</strong>. Real sessions will appear here as you study.</span>
              </div>
              <motion.button
                type="button"
                className="demo-remove-btn"
                onClick={onRemoveDemoData}
                title="Remove simulated demo sessions"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-trash-alt"></i>
                <span>Remove Demo Data</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="hero-illustration-block"
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StudyDeskIllustration />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;

