import { memo } from 'react';
import '../../styles/scene-motion.css';

/**
 * Night Study lighting: a warm lamp-glow behind the two window panes
 * (reusing the snow-pane geometry) plus a cool moonlit ambience, all with a
 * slow, barely noticeable pulse. Static under prefers-reduced-motion.
 */
function SceneNightGlow() {
  return (
    <div className="scene-night-glow-layer" aria-hidden="true">
      <span className="scene-glow scene-glow--warm scene-glow--wide" />
      <span className="scene-glow scene-glow--warm scene-glow--narrow" />
      <span className="scene-glow scene-glow--moon" />
    </div>
  );
}

export default memo(SceneNightGlow);
