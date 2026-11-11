import { useNavigate } from 'react-router-dom';
import StudyDeskIllustration from './StudyDeskIllustration';

function HeroSection({ streak = 0, hasDemoData = false, onRemoveDemoData }) {
  const navigate = useNavigate();

  return (
    <section className="dashboard-hero-card" aria-label="Study Companion Hero">
      <div className="hero-content-wrapper">
        <div className="hero-text-block">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            <span>{streak > 0 ? `${streak} Day Focus Streak Active` : 'Your Ambient Focus Sanctuary'}</span>
          </div>

          <h2 className="hero-title">
            Find Your Flow In Deep <span className="text-gradient">Soundscapes</span>
          </h2>

          <p className="hero-description">
            Immerse yourself in synthetically synthesized audio environments designed to sharpen concentration, dissolve mental stress, and turn study hours into effortless flow.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn btn-primary hero-primary-btn"
              onClick={() => navigate('/study')}
            >
              <i className="fas fa-play"></i>
              <span>Start Studying</span>
            </button>

            <button
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
            >
              <i className="fas fa-headphones"></i>
              <span>Explore Audio Types</span>
            </button>
          </div>

          {hasDemoData && (
            <div className="demo-data-alert">
              <div className="demo-data-info">
                <i className="fas fa-info-circle"></i>
                <span>Showing <strong>DEMO DATA</strong>. Real sessions will appear here as you study.</span>
              </div>
              <button
                type="button"
                className="demo-remove-btn"
                onClick={onRemoveDemoData}
                title="Remove simulated demo sessions"
              >
                <i className="fas fa-trash-alt"></i>
                <span>Remove Demo Data</span>
              </button>
            </div>
          )}
        </div>

        <div className="hero-illustration-block">
          <StudyDeskIllustration />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

