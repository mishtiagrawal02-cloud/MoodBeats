import { motion } from 'framer-motion';
import { ambientGradient } from '../../utils/motionVariants';

/**
 * AmbientEnvironment: Animated gradient background reflecting audio category
 * Provides calm, non-distracting visual environment for study sessions
 */
function AmbientEnvironment({ audioEnvironment = 'lofi', isPaused = false }) {
  // Get gradient configuration based on audio environment
  const getGradientConfig = (env) => {
    switch (env) {
      case 'lofi':
        return {
          colors: ['#8B4513', '#FF9500', '#1a1a2e'],
          className: 'ambient-lofi'
        };
      case 'nature':
        return {
          colors: ['#2d5016', '#34C759', '#1a1a2e'],
          className: 'ambient-nature'
        };
      case 'ambient':
        return {
          colors: ['#4b0082', '#8B35FF', '#0a0a14'],
          className: 'ambient-ambient'
        };
      case 'instr':
        return {
          colors: ['#0a3a52', '#5AC8FA', '#1a1a2e'],
          className: 'ambient-instr'
        };
      case 'freq':
        return {
          colors: ['#2d1b4e', '#AF52DE', '#0a0a14'],
          className: 'ambient-freq'
        };
      default:
        return {
          colors: ['#1a1a2e', '#8B35FF', '#0a0a14'],
          className: 'ambient-default'
        };
    }
  };

  const config = getGradientConfig(audioEnvironment);

  return (
    <motion.div
      className={`ambient-environment ${config.className} ${isPaused ? 'is-paused' : ''}`}
      variants={isPaused ? { animate: {} } : ambientGradient}
      initial={isPaused ? {} : 'animate'}
      animate={isPaused ? {} : 'animate'}
      style={{
        background: `radial-gradient(ellipse at 30% 70%, ${config.colors[0]}, ${config.colors[1]}, ${config.colors[2]})`,
        backgroundSize: '200% 200%'
      }}
      aria-hidden="true"
    />
  );
}

export default AmbientEnvironment;
