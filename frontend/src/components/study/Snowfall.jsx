import { memo, useMemo } from 'react';
import '../../styles/snowfall.css';

function Snowfall({ layer = 'back', count = layer === 'front' ? 12 : 32 }) {
  const flakes = useMemo(() => {
    const near = layer === 'front';

    return Array.from({ length: count }, () => {
      const duration = (near ? 9 : 15) + Math.random() * 12;

      return {
        left: `${Math.random() * 100}%`,
        animationDelay: `${-Math.random() * duration}s`,
        animationDuration: `${duration}s`,
        '--snow-size': `${(near ? 2.6 : 1.3) + Math.random() * 1.6}px`,
        '--snow-opacity': (near ? 0.2 : 0.32) + Math.random() * 0.32,
        '--snow-drift': `${Math.round((Math.random() - 0.5) * 62)}px`
      };
    });
  }, [count, layer]);

  return (
    <div className={`snow-layer snow-layer--${layer}`} aria-hidden="true">
      {flakes.map((style, index) => (
        <span key={index} className="snow-particle" style={style} />
      ))}
    </div>
  );
}

export default memo(Snowfall);
