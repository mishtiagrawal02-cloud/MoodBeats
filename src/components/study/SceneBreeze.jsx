import { memo, useMemo } from 'react';
import '../../styles/scene-motion.css';

/**
 * Warm breeze layer for the Sunny Afternoon Study scene.
 * A slow light sheen plus a few drifting leaves; purely decorative and
 * hidden entirely under prefers-reduced-motion.
 */
function SceneBreeze({ leafCount = 6 }) {
  const leaves = useMemo(() => Array.from({ length: leafCount }, () => {
    const duration = 7 + Math.random() * 6;

    return {
      left: `${8 + Math.random() * 84}%`,
      top: `${12 + Math.random() * 55}%`,
      animationDelay: `${-Math.random() * duration}s`,
      animationDuration: `${duration}s`,
      '--leaf-size': `${(9 + Math.random() * 7).toFixed(1)}px`,
      '--leaf-opacity': (0.22 + Math.random() * 0.3).toFixed(2),
      '--leaf-sway': `${Math.round(8 + Math.random() * 14)}px`,
      '--leaf-tilt': `${Math.round((Math.random() - 0.5) * 40)}deg`
    };
  }), [leafCount]);

  return (
    <div className="scene-breeze-layer" aria-hidden="true">
      <span className="scene-breeze-light" />
      {leaves.map((style, index) => (
        <span key={index} className="scene-breeze-leaf" style={style} />
      ))}
    </div>
  );
}

export default memo(SceneBreeze);
