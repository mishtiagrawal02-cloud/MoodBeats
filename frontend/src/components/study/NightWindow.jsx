import { memo, useEffect, useRef, useState } from 'react';
import { resolveScene } from '../../utils/studyScenes';
import Snowfall from './Snowfall';
import ScenePetals from './ScenePetals';
import SceneBreeze from './SceneBreeze';
import SceneSunlight from './SceneSunlight';
import SceneNightGlow from './SceneNightGlow';
import SceneSwitcher from './SceneSwitcher';

/**
 * Renders the selected study room background scene with its ambient layers
 * (snow / petals / breeze, plus scene lighting), a toggle for the particle
 * layers, and — during a live session — a compact scene switcher.
 *
 * Scene changes crossfade: the outgoing artwork stays mounted on top and
 * fades out (~650ms) while the new scene fades in beneath it. Only one
 * outgoing image is ever mounted and it is always cleaned up.
 */
function NightWindow({ background = 'night', onSceneChange }) {
  const scene = resolveScene(background);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [leaving, setLeaving] = useState(null);
  const currentIdRef = useRef(background);

  useEffect(() => {
    if (currentIdRef.current === background) return undefined;
    const fromScene = resolveScene(currentIdRef.current);
    currentIdRef.current = background;
    setLeaving(fromScene);
    const timer = setTimeout(() => setLeaving(null), 700);
    return () => clearTimeout(timer);
  }, [background]);

  return (
    <figure className="room-scene" data-scene={scene.id}>
      <div
        className="room-scene-art"
        style={{ aspectRatio: scene.ratio, '--scene-cover': scene.cover }}
      >
        <img
          key={scene.id}
          className="scene-art-img"
          src={scene.art}
          alt={scene.alt}
          width="780"
          height="438"
          fetchPriority="high"
        />
        {leaving && (
          <img
            key={`leaving-${leaving.id}`}
            className="scene-art-img scene-art-img--leaving"
            src={leaving.art}
            alt=""
            aria-hidden="true"
          />
        )}
        {scene.overlay === 'snow' && (
          <>
            <SceneNightGlow />
            {overlayEnabled && (
              <>
                <div className="room-snow-pane room-snow-pane--wide">
                  <Snowfall count={27} />
                  <Snowfall layer="front" count={7} />
                </div>
                <div className="room-snow-pane room-snow-pane--narrow"><Snowfall count={10} /></div>
              </>
            )}
          </>
        )}
        {scene.overlay === 'petals' && overlayEnabled && (
          <>
            <ScenePetals />
            <ScenePetals layer="front" />
          </>
        )}
        {scene.overlay === 'breeze' && (
          <>
            <SceneSunlight />
            {overlayEnabled && <SceneBreeze />}
          </>
        )}
      </div>
      {onSceneChange && (
        <SceneSwitcher selectedId={scene.id} onSelect={onSceneChange} />
      )}
      <button
        className="btn btn-secondary control-option room-scene-toggle"
        type="button"
        aria-label={scene.toggleLabel}
        aria-pressed={overlayEnabled}
        onClick={() => setOverlayEnabled((enabled) => !enabled)}
      >
        <i className={`fas ${scene.toggleIcon}`} aria-hidden="true" />
        <span>{scene.toggleLabel} {overlayEnabled ? 'on' : 'off'}</span>
      </button>
    </figure>
  );
}

export default memo(NightWindow);
