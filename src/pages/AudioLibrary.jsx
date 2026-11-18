import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import AudioPreviewControls from '../components/shared/AudioPreviewControls';
import { useAudioPreview } from '../hooks/useAudioPreview';
import { useUserData } from '../hooks/useUserData';
import { AUDIO, getAudioName } from '../utils/constants';

function AudioLibrary() {
  const { userName, quickStudyConfig, updateQuickStudyConfig } = useUserData();
  const { preview, canPreview, toggle } = useAudioPreview();
  const selected = AUDIO.find(({ id }) => id === quickStudyConfig?.audio)?.id ?? 'lofi';

  return (
    <main className="workspace-page" aria-labelledby="page-title">
      <Header title="Audio Library" userName={userName} />

      <section className="workspace-panel workspace-section-intro" aria-labelledby="soundscapes-title">
        <div>
          <h2 id="soundscapes-title">Focus soundscapes</h2>
          <p><strong>{getAudioName(selected)}</strong> is selected for your next session.</p>
        </div>
        <Link className="btn btn-primary workspace-primary" to="/study">
          <i className="fas fa-arrow-right" aria-hidden="true" /> Go to study room
        </Link>
      </section>

      <div className="workspace-panel">
        <AudioPreviewControls showVisualizer />
      </div>

      <div className="workspace-library-grid">
        {AUDIO.map(({ id, n, d, glyph, category }) => (
          <section className="workspace-panel workspace-audio-card" key={id} aria-labelledby={`soundscape-${id}`}>
            <span className="workspace-setup-icon" aria-hidden="true"><i className={`fas ${glyph}`} /></span>
            <div>
              <span className="soundscape-category">{category}</span>
              <h2 id={`soundscape-${id}`}>{n}</h2>
              <p>{d}</p>
            </div>
            <div className="workspace-audio-actions">
              {id !== 'none' && canPreview && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={preview?.id === id ? `${preview.paused ? 'Resume' : 'Pause'} ${n} preview` : `Preview ${n}`}
                >
                  <i className={`fas ${preview?.id === id && !preview.paused ? 'fa-pause' : 'fa-play'}`} aria-hidden="true" />
                  {preview?.id === id ? preview.paused ? 'Resume' : 'Pause' : 'Preview'}
                </button>
              )}
              <button
                className="btn control-option workspace-choice"
                type="button"
                aria-pressed={selected === id}
                aria-label={`Use ${n} next session`}
                onClick={() => updateQuickStudyConfig({ audio: id })}
              >
                {selected === id && <i className="fas fa-check" aria-hidden="true" />}
                {selected === id ? 'Selected' : 'Use next'}
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default AudioLibrary;
