import { memo, useMemo } from 'react';
import '../../styles/scene-motion.css';

/**
 * Sakura petal layers for the Sakura Study scene.
 *
 * layer="back"   — the original background drift (z 1)
 * layer="front"  — a sparse foreground drift that passes in front of the
 *                  desk (z 8): fewer, larger, slower petals with a touch of
 *                  blur for depth. Both hidden under prefers-reduced-motion.
 */
function ScenePetals({ layer = 'back', count }) {
  const isFront = layer === 'front';
  const petalCount = count ?? (isFront ? 7 : 22);

  const petals = useMemo(() => Array.from({ length: petalCount }, () => {
    const duration = isFront
      ? 11 + Math.random() * 9
      : 9 + Math.random() * 10;

    return {
      left: `${Math.random() * 100}%`,
      animationDelay: `${-Math.random() * duration}s`,
      animationDuration: `${duration}s`,
      '--petal-size': isFront
        ? `${(9 + Math.random() * 8).toFixed(1)}px`
        : `${(5 + Math.random() * 6).toFixed(1)}px`,
      '--petal-opacity': (isFront ? 0.5 + Math.random() * 0.35 : 0.35 + Math.random() * 0.4).toFixed(2),
      '--petal-drift': `${Math.round((Math.random() - 0.5) * (isFront ? 150 : 90))}px`,
      '--petal-spin': `${Math.random() > 0.5 ? '' : '-'}${160 + Math.round(Math.random() * (isFront ? 300 : 240))}deg`
    };
  }), [isFront, petalCount]);

  return (
    <div className={`scene-petal-layer ${isFront ? 'scene-petal-layer--front' : ''}`} aria-hidden="true">
      {petals.map((style, index) => (
        <span key={index} className="scene-petal" style={style} />
      ))}
    </div>
  );
}

export default memo(ScenePetals);
