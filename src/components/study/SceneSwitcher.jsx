import { memo } from 'react';
import { STUDY_SCENES } from '../../utils/studyScenes';

/**
 * Compact in-room scene switcher: a small pill of artwork thumbnails.
 * Sits inside the scene figure, opposite the ambient-motion toggle.
 */
function SceneSwitcher({ selectedId, onSelect }) {
  return (
    <div className="room-scene-switcher" role="group" aria-label="Background scene">
      {STUDY_SCENES.map((scene) => {
        const isSelected = scene.id === selectedId;
        return (
          <button
            key={scene.id}
            type="button"
            className={`scene-switcher-option control-option ${isSelected ? 'active' : ''}`}
            aria-pressed={isSelected}
            aria-label={`Use ${scene.name} background`}
            title={scene.name}
            onClick={() => onSelect(scene.id)}
          >
            <img src={scene.art} alt="" loading="lazy" />
            {isSelected && <i className="fas fa-check" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

export default memo(SceneSwitcher);
