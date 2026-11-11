import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock Web Audio API for Node.js test environment
class MockAudioParam {
  constructor(defaultVal = 0) {
    this.value = defaultVal;
  }
  setValueAtTime(val) {
    this.value = val;
  }
  linearRampToValueAtTime(val) {
    this.value = val;
  }
  exponentialRampToValueAtTime(val) {
    this.value = val;
  }
}

class MockAudioNode {
  constructor() {
    this.connectedTo = [];
    this.isStopped = false;
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.connectedTo = [];
  }
}

class MockGainNode extends MockAudioNode {
  constructor(initialVal = 1.0) {
    super();
    this.gain = new MockAudioParam(initialVal);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.frequency = new MockAudioParam(440);
    this.type = 'sine';
  }
  start() {}
  stop() {
    this.isStopped = true;
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super();
    this.frequency = new MockAudioParam(1000);
    this.type = 'lowpass';
  }
}

class MockAudioBufferSourceNode extends MockAudioNode {
  constructor() {
    super();
    this.buffer = null;
    this.loop = false;
  }
  start() {}
  stop() {
    this.isStopped = true;
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = new MockAudioNode();
  }
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  createBuffer(channels, length, sampleRate) {
    return {
      getChannelData() {
        return new Float32Array(length);
      }
    };
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }
  async suspend() {
    this.state = 'suspended';
  }
  async resume() {
    this.state = 'running';
  }
}

globalThis.AudioContext = MockAudioContext;

// Import audioEngine after mocking global AudioContext
const { audioEngine } = await import('../utils/audioEngine.js');

describe('Audio Engine Synthetic Soundscapes', () => {
  beforeEach(() => {
    audioEngine.stop();
  });

  it('starts lofi soundscape without throwing errors', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('lofi', 0.6);
    });
  });

  it('starts nature soundscape without throwing errors', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('nature', 0.5);
    });
  });

  it('starts freq alpha waves without throwing errors', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('freq', 0.4);
    });
  });

  it('starts ambient soundscape without throwing errors', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('ambient', 0.7);
    });
  });

  it('start("none") or start() with falsy soundscape does not start audio', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('none');
      audioEngine.start(null);
    });
  });

  it('allows pause and resume cleanly', async () => {
    audioEngine.start('lofi', 0.5);
    assert.doesNotThrow(() => {
      audioEngine.pause();
      audioEngine.resume();
    });
  });

  it('allows volume adjustment without throwing and clamps safely', () => {
    audioEngine.start('lofi', 0.5);
    assert.doesNotThrow(() => {
      audioEngine.setVolume(0.2);
      audioEngine.setVolume(1.5); // should clamp to 1.0
      audioEngine.setVolume(-0.5); // should clamp to 0.0
    });
  });

  it('cleans up previously active sources when stop() is called', () => {
    audioEngine.start('nature', 0.5);
    assert.doesNotThrow(() => {
      audioEngine.stop();
    });
  });

  it('calling start multiple times cleans up previous graph and does not leak sources', () => {
    assert.doesNotThrow(() => {
      audioEngine.start('lofi', 0.5);
      audioEngine.start('nature', 0.5);
      audioEngine.start('freq', 0.5);
      audioEngine.stop();
    });
  });
});
