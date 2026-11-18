import { useCallback } from 'react';
import { getAudioName } from '../../utils/constants';
import { AUDIO } from '../../utils/constants';

/**
 * MusicMixerWidget: Floating widget for quick audio environment selection.
 * 
 * Wires to:
 * - audioEngine.js for playback (existing functionality)
 * - quickStudyConfig from useUserData hook
 * - updateQuickStudyConfig callback
 * 
 * Respects existing audio architecture - no independent mixing,
 * only environment selection.
 */

function MusicMixerWidget({ selectedAudio = 'lofi', onSelectAudio }) {
  const handleAudioSelect = useCallback((audioId) => {
    if (onSelectAudio) {
      onSelectAudio({ audio: audioId });
    }
  }, [onSelectAudio]);

  return (
    <div className="widget-glass-panel music-mixer-widget" style={{ minWidth: '280px' }}>
      <div className="widget-header">
        <div>
          <div className="widget-title">🎵 Sound Environment</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--va-text-muted)', marginTop: '3px' }}>
            Select your focus audio
          </div>
        </div>
      </div>

      <div className="music-mixer-grid">
        {AUDIO.map((audio) => (
          <button
            key={audio.id}
            className={`audio-env-btn ${selectedAudio === audio.id ? 'active' : ''}`}
            onClick={() => handleAudioSelect(audio.id)}
            title={audio.d}
            type="button"
          >
            <span className="audio-env-icon">{audio.icon}</span>
            <span className="audio-env-label">{audio.n}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--va-text-muted)',
          paddingTop: '10px',
          borderTop: '1px solid rgba(214, 189, 145, 0.1)',
          marginTop: '10px'
        }}
      >
        {selectedAudio && (
          <>
            <strong style={{ color: 'var(--va-accent-gold)' }}>Active:</strong>{' '}
            {getAudioName(selectedAudio)}
          </>
        )}
      </div>
    </div>
  );
}

export default MusicMixerWidget;
