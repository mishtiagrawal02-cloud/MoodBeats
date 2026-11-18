import { memo, useMemo } from 'react';
import '../../styles/scene-motion.css';

/**
 * Soft sunlight for the Sunny Afternoon Study scene: translucent diagonal
 * golden rays entering from the window side, with a few dust motes drifting
 * inside the light. Purely decorative lighting — no harsh overlays, gentle
 * brightness variation only.
 */
function SceneSunlight({ rayCount = 3, dustCount = 14 }) {
  const rays = useMemo(() => Array.from({ length: rayCount }, (_, index) => {
    const duration = 9 + index * 2.5;

    return {
      left: `${6 + index * 11}%`,
      '--ray-width': `${88 + index * 34}px`,
      '--ray-opacity': (0.5 + index * 0.12).toFixed(2),
      animationDelay: `${-duration / 2}s`,
      animationDuration: `${duration}s`
    };
  }), [rayCount]);

  const dust = useMemo(() => Array.from({ length: dustCount }, () => {
    const duration = 12 + Math.random() * 10;

    return {
      left: `${4 + Math.random() * 58}%`,
      top: `${10 + Math.random() * 62}%`,
      animationDelay: `${-Math.random() * duration}s`,
      animationDuration: `${duration}s`,
      '--dust-size': `${(1.6 + Math.random() * 1.8).toFixed(1)}px`,
      '--dust-opacity': (0.25 + Math.random() * 0.4).toFixed(2),
      '--dust-x': `${Math.round((Math.random() - 0.5) * 46)}px`,
      '--dust-y': `${Math.round(-14 - Math.random() * 26)}px`
    };
  }), [dustCount]);

  return (
    <div className="scene-sunlight-layer" aria-hidden="true">
      {rays.map((style, index) => (
        <span key={`ray-${index}`} className="scene-sun-ray" style={style} />
      ))}
      {dust.map((style, index) => (
        <span key={`dust-${index}`} className="scene-dust" style={style} />
      ))}
    </div>
  );
}

export default memo(SceneSunlight);
