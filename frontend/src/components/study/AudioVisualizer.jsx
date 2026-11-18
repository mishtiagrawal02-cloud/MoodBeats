import { useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioEngine';

const BAR_COUNT = 26;

function AudioVisualizer({ isStill }) {
  const visualizer = useRef(null);

  useEffect(() => {
    const bars = [...visualizer.current.children];
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let analyser;
    let samples;
    let lastFrame = 0;
    const levels = new Float32Array(bars.length);

    function stop() {
      cancelAnimationFrame(frame);
      levels.fill(0);
      bars.forEach((bar) => bar.style.removeProperty('--room-level'));
    }

    function update(now) {
      frame = requestAnimationFrame(update);
      if (now - lastFrame < 33) return;
      lastFrame = now;

      const currentAnalyser = audioEngine.getAnalyser();
      if (!currentAnalyser) return;
      if (analyser !== currentAnalyser) {
        analyser = currentAnalyser;
        samples = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(samples);

      // Space bins logarithmically so quiet high frequencies don't crowd out the bass.
      const lastBin = Math.max(1, Math.floor(samples.length / 2) - 1);
      bars.forEach((bar, index) => {
        const bin = Math.round(lastBin ** (index / (bars.length - 1)));
        const amplitude = Math.min(1, samples[bin] / 192);
        levels[index] = levels[index] * 0.65 + amplitude * 0.35;
        bar.style.setProperty('--room-level', (0.09 + levels[index] * 0.91).toFixed(3));
      });
    }

    function syncMotion() {
      stop();
      if (!isStill && !motionPreference.matches && !document.hidden) {
        frame = requestAnimationFrame(update);
      }
    }

    syncMotion();
    motionPreference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    return () => {
      stop();
      motionPreference.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncMotion);
    };
  }, [isStill]);

  return (
    <div ref={visualizer} className="room-visualizer" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => <span key={index} />)}
    </div>
  );
}

export default AudioVisualizer;
