/**
 * Web Audio API Synthetic Soundscape Engine for MoodBeats
 * Generates all audio procedurally without requiring any external audio files.
 */

let audioCtx = null;
let masterGain = null;
let activeSources = [];
let activeIntervals = [];

// Musical chord progressions for synthetic ambient & lofi
const CHORDS = [
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [110.0, 164.81, 196.0, 261.63],  // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [98.0, 146.83, 196.0, 246.94]   // G6
];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : (typeof globalThis !== 'undefined' ? (globalThis.AudioContext || globalThis.webkitAudioContext) : null);
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Procedural Noise Buffer Generator
 * @param {boolean} brown - if true, generates low-frequency brown noise; else white noise
 */
function createNoiseBuffer(ctx, brown = false) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    } else {
      data[i] = white;
    }
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;
  noiseSource.start();
  activeSources.push(noiseSource);
  return noiseSource;
}

function createFilter(ctx, type, freq) {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, ctx.currentTime);
  return filter;
}

function createGain(ctx, initialGain = 1.0) {
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(initialGain, ctx.currentTime);
  return gainNode;
}

function playSynthesizedNote(ctx, freq, startTime, duration, type, volume, destination) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.15);
}

export const audioEngine = {
  start(type, volume = 0.6) {
    this.stop();
    if (type === 'none' || !type) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch((e) => console.warn('Audio resume error:', e));
    }

    masterGain = createGain(ctx, Math.max(0, Math.min(1, volume)));
    masterGain.connect(ctx.destination);

    try {
      if (type === 'nature') {
        // Highpass white noise for gentle rain
        const rainNoise = createNoiseBuffer(ctx, false);
        const rainHp = createFilter(ctx, 'highpass', 900);
        const rainLp = createFilter(ctx, 'lowpass', 6500);
        const rainGain = createGain(ctx, 0.2);

        rainNoise.connect(rainHp);
        rainHp.connect(rainLp);
        rainLp.connect(rainGain);
        rainGain.connect(masterGain);

        // Brown noise + LFO modulation for wind sweeps
        const windNoise = createNoiseBuffer(ctx, true);
        const windLp = createFilter(ctx, 'lowpass', 350);
        const windGain = createGain(ctx, 0.4);

        const lfo = ctx.createOscillator();
        const lfoGain = createGain(ctx, 0.25);
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(windGain.gain);
        lfo.start();
        activeSources.push(lfo);

        windNoise.connect(windLp);
        windLp.connect(windGain);
        windGain.connect(masterGain);
      } else if (type === 'freq') {
        // 10 Hz Alpha wave binaural beat: 200 Hz Left, 210 Hz Right
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();

        leftOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(200, ctx.currentTime);

        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(210, ctx.currentTime);

        // Check StereoPanner support
        if (ctx.createStereoPanner) {
          const leftPan = ctx.createStereoPanner();
          leftPan.pan.setValueAtTime(-1, ctx.currentTime);

          const rightPan = ctx.createStereoPanner();
          rightPan.pan.setValueAtTime(1, ctx.currentTime);

          const leftGain = createGain(ctx, 0.16);
          const rightGain = createGain(ctx, 0.16);

          leftOsc.connect(leftGain);
          leftGain.connect(leftPan);
          leftPan.connect(masterGain);

          rightOsc.connect(rightGain);
          rightGain.connect(rightPan);
          rightPan.connect(masterGain);
        } else {
          const toneGain = createGain(ctx, 0.15);
          leftOsc.connect(toneGain);
          rightOsc.connect(toneGain);
          toneGain.connect(masterGain);
        }

        leftOsc.start();
        rightOsc.start();
        activeSources.push(leftOsc, rightOsc);
      } else if (type === 'ambient') {
        // Atmospheric pad chords + deep rumble
        const ambientFilter = createFilter(ctx, 'lowpass', 650);
        ambientFilter.connect(masterGain);

        const droneNoise = createNoiseBuffer(ctx, true);
        const droneFilter = createFilter(ctx, 'lowpass', 300);
        const droneGain = createGain(ctx, 0.12);
        droneNoise.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(masterGain);

        let chordIdx = 0;
        const playAmbientChord = () => {
          if (!audioCtx || audioCtx.state !== 'running') return;
          const now = ctx.currentTime + 0.05;
          const chord = CHORDS[chordIdx % CHORDS.length];
          chordIdx++;
          chord.forEach((freq) => {
            playSynthesizedNote(ctx, freq, now, 6.8, 'sine', 0.035, ambientFilter);
          });
        };

        playAmbientChord();
        activeIntervals.push(setInterval(playAmbientChord, 6000));
      } else {
        // Lo-fi & Instrumental
        const isLofi = type === 'lofi';
        const filterCutoff = isLofi ? 950 : 2200;
        const chordFilter = createFilter(ctx, 'lowpass', filterCutoff);
        chordFilter.connect(masterGain);

        if (isLofi) {
          // Vinyl hiss / crackle
          const crackleNoise = createNoiseBuffer(ctx, true);
          const crackleFilter = createFilter(ctx, 'highpass', 2400);
          const crackleGain = createGain(ctx, 0.04);
          crackleNoise.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(masterGain);
        }

        let chordStep = 0;
        const playStep = () => {
          if (!audioCtx || audioCtx.state !== 'running') return;
          const now = ctx.currentTime + 0.05;
          const chord = CHORDS[chordStep % CHORDS.length];
          chordStep++;

          // Warm pad
          chord.forEach((freq) => {
            playSynthesizedNote(ctx, freq, now, 4.4, isLofi ? 'triangle' : 'sine', 0.065, chordFilter);
          });

          // Soft melodic arpeggios for instrumental
          if (!isLofi) {
            for (let j = 0; j < 8; j++) {
              const noteFreq = chord[j % chord.length] * 2;
              playSynthesizedNote(ctx, noteFreq, now + j * 0.45, 1.2, 'sine', 0.04, chordFilter);
            }
          }
        };

        playStep();
        activeIntervals.push(setInterval(playStep, 4000));
      }
    } catch (err) {
      console.warn('Audio engine startup warning:', err);
    }
  },

  setVolume(volume) {
    if (masterGain && audioCtx) {
      const safeVol = Math.max(0, Math.min(1, volume));
      masterGain.gain.setValueAtTime(safeVol, audioCtx.currentTime);
    }
  },

  pause() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch((e) => console.warn('Audio suspend error:', e));
    }
  },

  resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch((e) => console.warn('Audio resume error:', e));
    }
  },

  stop() {
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore already stopped sources
      }
    });
    activeSources = [];

    if (masterGain) {
      try {
        masterGain.disconnect();
      } catch {
        // ignore
      }
      masterGain = null;
    }
  }
};
