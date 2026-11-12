/**
 * Audio Engine
 * Manages synthetic audio generation using Web Audio API
 * All audio is procedurally generated using oscillators (no external files)
 */

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.masterGain = null;
    this.isInitialized = false;
    this.currentEnvironment = null;
  }
  
  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.isInitialized) return;
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.5;
    
    this.isInitialized = true;
  }
  
  /**
   * Start playing an environment's audio
   */
  play(environment) {
    if (!this.isInitialized) {
      this.init();
    }
    
    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Stop current audio if any
    this.stop();
    
    this.currentEnvironment = environment;
    
    // Generate oscillators based on environment type
    const frequencies = this.getFrequenciesForEnvironment(environment.id);
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = this.getWaveformForEnvironment(environment.id);
      oscillator.frequency.value = freq;
      
      // Vary gain for each oscillator to create depth
      gainNode.gain.value = 0.1 + (index * 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start();
      
      this.oscillators.push(oscillator);
      this.gainNodes.push(gainNode);
    });
  }
  
  /**
   * Stop all audio
   */
  stop() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator already stopped
      }
    });
    
    this.oscillators = [];
    this.gainNodes = [];
    this.currentEnvironment = null;
  }
  
  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Get frequencies for specific environment
   */
  getFrequenciesForEnvironment(environmentId) {
    const frequencyMap = {
      nature: [200, 210, 150, 165], // Binaural alpha waves (10Hz diff)
      cafe: [180, 190, 220, 235], // Binaural beta waves (10-15Hz diff)
      rain: [160, 170, 140, 155], // Binaural theta waves (10-15Hz diff)
      library: [190, 200, 170, 185], // Balanced binaural
      lofi: [150, 160, 180, 195], // Relaxed binaural
      silence: [100, 100], // Minimal tone
    };
    
    return frequencyMap[environmentId] || [200, 210];
  }
  
  /**
   * Get waveform type for environment
   */
  getWaveformForEnvironment(environmentId) {
    const waveformMap = {
      nature: 'sine',
      cafe: 'triangle',
      rain: 'sine',
      library: 'square',
      lofi: 'sawtooth',
      silence: 'sine',
    };
    
    return waveformMap[environmentId] || 'sine';
  }
  
  /**
   * Check if audio is playing
   */
  isPlaying() {
    return this.oscillators.length > 0 && this.audioContext?.state === 'running';
  }
  
  /**
   * Get current environment
   */
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }
}

// Singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
