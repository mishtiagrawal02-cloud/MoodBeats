import { AUDIO } from '../../utils/constants';
import AudioPreviewControls from '../shared/AudioPreviewControls';
import { useAudioPreview } from '../../hooks/useAudioPreview';

const PRESETS = [15, 25, 45, 60];

function SoundEnvironmentMixer({ selectedAudio, duration, onUpdate }) {
  const { preview, canPreview, toggle } = useAudioPreview();
  const durations = PRESETS.includes(duration) ? PRESETS : [...PRESETS, duration].sort((a, b) => a - b);

  return (
    <section className="workspace-panel workspace-setup" aria-labelledby="setup-title">
      <div className="workspace-panel-heading">
        <h2 id="setup-title">Next session</h2>
        <span className="workspace-setup-icon" aria-hidden="true"><i className="fas fa-headphones" /></span>
      </div>

      <div className="workspace-duration">
        <label htmlFor="dashboard-duration">Duration</label>
        <select
          className="workspace-select"
          id="dashboard-duration"
          value={duration}
          onChange={(event) => onUpdate({ mins: Number(event.target.value) })}
        >
          {durations.map((value) => <option key={value} value={value}>{value} min</option>)}
        </select>
      </div>

      <fieldset className="workspace-soundscapes">
        <legend>Soundscape</legend>
        <div className="workspace-sound-grid">
          {AUDIO.map(({ id, n, glyph }) => (
            <label className="control-option workspace-sound-option" key={id}>
              <input
                type="radio"
                name="dashboard-soundscape"
                value={id}
                checked={selectedAudio === id}
                onChange={() => onUpdate({ audio: id })}
              />
              <i className={`fas ${glyph}`} aria-hidden="true" />
              <span>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="workspace-mixer-preview">
        {canPreview && selectedAudio !== 'none' && preview?.id !== selectedAudio && (
          <button type="button" className="btn btn-secondary" onClick={() => toggle(selectedAudio)}>
            <i className="fas fa-play" aria-hidden="true" /> Preview selected
          </button>
        )}
        <AudioPreviewControls />
      </div>
    </section>
  );
}

export default SoundEnvironmentMixer;
