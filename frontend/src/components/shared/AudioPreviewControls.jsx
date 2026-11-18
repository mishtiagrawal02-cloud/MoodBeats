import RangeInput from './RangeInput';
import { useId } from 'react';
import { useAudioPreview } from '../../hooks/useAudioPreview';
import { getAudioName } from '../../utils/constants';
import AudioVisualizer from '../study/AudioVisualizer';

function AudioPreviewControls({ showVisualizer = false }) {
  const { preview, error, canPreview, toggle, stop, volume, changeVolume } = useAudioPreview();
  const sliderId = useId();
  const name = preview ? getAudioName(preview.id) : '';
  return (
    <div className="workspace-preview">
      <div>
        <span className="workspace-preview-label">Audio preview</span>
        <p role="status">
          {preview
            ? `${preview.paused ? 'Paused' : 'Playing'} ${name}`
            : canPreview ? 'Ready to preview' : 'Audio previews are unavailable in this browser.'}
        </p>
        {error && <p className="workspace-inline-error" role="alert">{error}</p>}
      </div>
      {canPreview && (
        <div className="workspace-preview-controls">
          {preview && (
            <>
              <button
                className="btn btn-secondary btn-icon"
                type="button"
                aria-label={preview.paused ? 'Resume preview' : 'Pause preview'}
                onClick={() => toggle(preview.id)}
              >
                <i className={`fas ${preview.paused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true" />
              </button>
              <button className="btn btn-secondary btn-icon" type="button" aria-label="Stop preview" onClick={stop}>
                <i className="fas fa-stop" aria-hidden="true" />
              </button>
            </>
          )}
          <div className="workspace-preview-volume">
            <label htmlFor={sliderId}>Volume</label>
            <RangeInput
              id={sliderId}
              min="0"
              max="1"
              step="0.05"
              value={volume}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              onChange={(event) => changeVolume(Number(event.target.value))}
            />
          </div>
        </div>
      )}
      {showVisualizer && canPreview && (
        <AudioVisualizer isStill={!preview || preview.paused || volume === 0} />
      )}
    </div>
  );
}

export default AudioPreviewControls;
