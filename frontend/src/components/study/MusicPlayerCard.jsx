import RangeInput from '../shared/RangeInput';
import { useRef } from 'react';
import { AUDIO, getAudioGlyph, getAudioName } from '../../utils/constants';
import AudioVisualizer from './AudioVisualizer';

function MusicPlayerCard({ audio, volume = 0.6, isPaused, onToggle, onSetVolume, onSetAudio, audioError }) {
  const lastAudibleVolume = useRef(0.6);
  const volumePercent = Math.round(volume * 100);
  const hasAudio = audio !== 'none';

  function toggleMute() {
    if (volume > 0) {
      lastAudibleVolume.current = volume;
      onSetVolume(0);
    } else {
      onSetVolume(lastAudibleVolume.current);
    }
  }

  return (
    <section className="room-panel room-player" aria-labelledby="room-player-title">
      <div className="room-player-heading">
        <span className="room-sound-art" aria-hidden="true">
          <i className={`fas ${getAudioGlyph(audio)}`} />
        </span>
        <div>
          <span className="room-player-caption">Soundscape</span>
          <h2 id="room-player-title">{getAudioName(audio)}</h2>
        </div>
        {hasAudio && (
          <button
            type="button"
            className="btn btn-secondary btn-icon room-playback"
            onClick={onToggle}
            aria-label={isPaused ? 'Resume soundscape and timer' : 'Pause soundscape and timer'}
          >
            <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="workspace-compact-field">
        <label htmlFor="active-soundscape" className="sr-only">Change soundscape</label>
        <select
          id="active-soundscape"
          className="workspace-select"
          value={audio}
          onChange={(event) => onSetAudio(event.target.value)}
        >
          {AUDIO.map(({ id, n }) => <option value={id} key={id}>{n}</option>)}
        </select>
      </div>

      {audioError && <p className="workspace-inline-error" role="alert">{audioError}</p>}

      {hasAudio && (
        <>
          <AudioVisualizer isStill={isPaused || volume === 0 || Boolean(audioError)} />
          <div className="room-volume">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label={volume > 0 ? 'Mute soundscape' : 'Unmute soundscape'}
              onClick={toggleMute}
            >
              <i className={`fas ${volume > 0 ? 'fa-volume-high' : 'fa-volume-xmark'}`} aria-hidden="true" />
            </button>
            <RangeInput
              aria-label="Soundscape volume"
              aria-valuetext={`${volumePercent}%`}
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => onSetVolume(Number(event.target.value))}
            />
            <span aria-hidden="true">{volumePercent}%</span>
          </div>
        </>
      )}
    </section>
  );
}

export default MusicPlayerCard;
