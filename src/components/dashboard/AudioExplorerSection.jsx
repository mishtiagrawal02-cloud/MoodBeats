import { useNavigate } from 'react-router-dom';
import { AUDIO } from '../../utils/constants';

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

        <button
          type="button"
          className="link-view-all-btn"
          onClick={() => navigate('/audio')}
        >
          <span>Open Full Audio Library</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      <div className="audio-cards-grid">
        {AUDIO.map((audio) => {
          const isSelected = selectedAudio === audio.id;

          return (
            <div
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
            >
              <div className="audio-card-top">
                <span className="audio-card-icon">{audio.icon}</span>
                {isSelected && (
                  <span className="audio-active-badge">
                    <i className="fas fa-check"></i> Active Preset
                  </span>
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
                <span className="audio-select-hint">
                  {isSelected ? 'Ready for study' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AudioExplorerSection;

