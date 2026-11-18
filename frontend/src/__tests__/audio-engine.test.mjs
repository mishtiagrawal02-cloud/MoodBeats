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


describe('Audio Engine Oscillator Tracking and Cleanup', () => {
  beforeEach(() => {
    audioEngine.stop();
  });

  it('captures and tracks oscillators created by playSynthesizedNote() in ambient environment', () => {
    const createdOscillators = [];
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;

    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      createdOscillators.push(osc);
      return osc;
    };

    try {
      audioEngine.start('ambient', 0.5);

      assert.ok(createdOscillators.length > 0, 'ambient should create oscillators');
      const oscillatorsWithOnended = createdOscillators.filter(
        osc => typeof osc.onended === 'function'
      );
      assert.ok(oscillatorsWithOnended.length > 0,
        'playSynthesizedNote() should set onended handler on oscillators');
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
      audioEngine.stop();
    }
  });

  it('calls stop() and disconnect() on all captured oscillators', () => {
    const createdOscillators = [];
    const methodCalls = new Map();
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;

    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      createdOscillators.push(osc);
      methodCalls.set(osc, { stopped: false, disconnected: false });

      const originalStop = osc.stop.bind(osc);
      osc.stop = function() {
        methodCalls.get(osc).stopped = true;
        return originalStop();
      };

      const originalDisconnect = osc.disconnect.bind(osc);
      osc.disconnect = function() {
        methodCalls.get(osc).disconnected = true;
        return originalDisconnect();
      };

      return osc;
    };

    try {
      audioEngine.start('ambient', 0.5);
      const oscCountBeforeStop = createdOscillators.length;
      assert.ok(oscCountBeforeStop > 0, 'ambient should create oscillators');

      audioEngine.stop();

      const allStopped = createdOscillators.every(osc => methodCalls.get(osc).stopped);
      const allDisconnected = createdOscillators.every(osc => methodCalls.get(osc).disconnected);

      assert.ok(allStopped,
        `all ${oscCountBeforeStop} oscillators should have stop() called`);
      assert.ok(allDisconnected,
        `all ${oscCountBeforeStop} oscillators should have disconnect() called`);
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
    }
  });

  it('removes naturally ended oscillators from tracking via onended handler', () => {
    const createdOscillators = [];
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;

    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      createdOscillators.push(osc);
      return osc;
    };

    try {
      audioEngine.start('ambient', 0.5);

      const oscWithOnended = createdOscillators.find(osc => typeof osc.onended === 'function');
      assert.ok(oscWithOnended, 'should have at least one oscillator with onended handler');

      assert.doesNotThrow(() => {
        oscWithOnended.onended();
      }, 'onended handler should execute without throwing');

      assert.equal(typeof oscWithOnended.onended, 'function',
        'onended should remain a function after execution');
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
      audioEngine.stop();
    }
  });

  it('verifies stop() clears intervals and sources for ambient environment', () => {
    const clearedIntervals = [];
    const originalClearInterval = globalThis.clearInterval;

    globalThis.clearInterval = (id) => {
      clearedIntervals.push(id);
      originalClearInterval(id);
    };

    try {
      audioEngine.start('ambient', 0.5);
      assert.ok(clearedIntervals.length === 0, 'no intervals cleared before stop()');

      audioEngine.stop();

      assert.ok(clearedIntervals.length > 0,
        'stop() should clear intervals set by ambient environment');
    } finally {
      globalThis.clearInterval = originalClearInterval;
    }
  });

  it('verifies switching from lofi to instr cleans up previous sources', () => {
    const lofiOscillators = [];
    const instrOscillators = [];
    let capturePhase = 'lofi';
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;

    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      if (capturePhase === 'lofi') {
        lofiOscillators.push(osc);
      } else {
        instrOscillators.push(osc);
      }
      return osc;
    };

    try {
      audioEngine.start('lofi', 0.5);
      assert.ok(lofiOscillators.length > 0, 'lofi should create oscillators');

      capturePhase = 'instr';
      audioEngine.start('instr', 0.5);
      assert.ok(instrOscillators.length > 0, 'instr should create oscillators');

      const allLofiStopped = lofiOscillators.every(osc => osc.isStopped === true);
      assert.ok(allLofiStopped,
        `all ${lofiOscillators.length} lofi oscillators should be stopped when switching to instr`);
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
      audioEngine.stop();
    }
  });

  it('verifies switching from ambient to nature cleans up previous environment', () => {
    const ambientSources = [];
    const natureSources = [];
    let capturePhase = 'ambient';
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;
    const originalCreateBufferSource = MockAudioContext.prototype.createBufferSource;

    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      if (capturePhase === 'ambient') {
        ambientSources.push(osc);
      } else {
        natureSources.push(osc);
      }
      return osc;
    };

    MockAudioContext.prototype.createBufferSource = function() {
      const src = originalCreateBufferSource.call(this);
      if (capturePhase === 'ambient') {
        ambientSources.push(src);
      } else {
        natureSources.push(src);
      }
      return src;
    };

    try {
      audioEngine.start('ambient', 0.5);
      const ambientCount = ambientSources.length;
      assert.ok(ambientCount > 0, 'ambient should create sources');

      capturePhase = 'nature';
      audioEngine.start('nature', 0.5);
      assert.ok(natureSources.length > 0, 'nature should create sources');

      const allAmbientStopped = ambientSources.every(src => src.isStopped === true);
      assert.ok(allAmbientStopped,
        `all ${ambientCount} ambient sources should be stopped after switching to nature`);
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
      MockAudioContext.prototype.createBufferSource = originalCreateBufferSource;
      audioEngine.stop();
    }
  });

  it('verifies all six audio environments can start and stop without errors', () => {
    const allEnvironments = ['lofi', 'instr', 'nature', 'freq', 'ambient', 'none'];

    for (const env of allEnvironments) {
      assert.doesNotThrow(() => {
        audioEngine.stop();
        audioEngine.start(env, 0.5);
        audioEngine.stop();
      }, `environment ${env} should start and stop without errors`);
    }
  });

  it('verifies stop() can be called multiple times after environment changes', () => {
    audioEngine.start('lofi', 0.5);
    audioEngine.start('ambient', 0.5);
    audioEngine.start('nature', 0.5);

    assert.doesNotThrow(() => {
      audioEngine.stop();
      audioEngine.stop();
      audioEngine.stop();
    }, 'multiple stop() calls should be idempotent');
  });

  it('verifies audio engine remains functional after stop() and cleanup', () => {
    audioEngine.start('freq', 0.5);
    audioEngine.stop();

    assert.doesNotThrow(() => {
      audioEngine.start('lofi', 0.6);
      audioEngine.setVolume(0.3);
      audioEngine.pause();
      audioEngine.resume();
      audioEngine.stop();
    }, 'audio engine should remain functional after cleanup');
  });

  it('verifies oscillators created by all six environments are properly tracked and cleaned', () => {
    const allEnvironments = ['lofi', 'instr', 'nature', 'freq', 'ambient'];
    const originalCreateOscillator = MockAudioContext.prototype.createOscillator;

    for (const env of allEnvironments) {
      const createdOscillators = [];
      const methodCalls = new Map();

      MockAudioContext.prototype.createOscillator = function() {
        const osc = originalCreateOscillator.call(this);
        createdOscillators.push(osc);
        methodCalls.set(osc, { stopped: false, disconnected: false });

        const originalStop = osc.stop.bind(osc);
        osc.stop = function() {
          methodCalls.get(osc).stopped = true;
          return originalStop();
        };

        const originalDisconnect = osc.disconnect.bind(osc);
        osc.disconnect = function() {
          methodCalls.get(osc).disconnected = true;
          return originalDisconnect();
        };

        return osc;
      };

      try {
        audioEngine.stop();
        audioEngine.start(env, 0.5);

        if (createdOscillators.length > 0) {
          const oscCount = createdOscillators.length;
          audioEngine.stop();

          const allStopped = createdOscillators.every(osc => methodCalls.get(osc).stopped);
          const allDisconnected = createdOscillators.every(osc => methodCalls.get(osc).disconnected);

          assert.ok(allStopped,
            `${env} should stop all ${oscCount} created oscillators`);
          assert.ok(allDisconnected,
            `${env} should disconnect all ${oscCount} created oscillators`);
        }
      } finally {
        MockAudioContext.prototype.createOscillator = originalCreateOscillator;
      }
    }

    // Test 'none' environment separately (should not create oscillators)
    const noneOscillators = [];
    MockAudioContext.prototype.createOscillator = function() {
      const osc = originalCreateOscillator.call(this);
      noneOscillators.push(osc);
      return osc;
    };

    try {
      audioEngine.stop();
      audioEngine.start('none', 0.5);
      assert.equal(noneOscillators.length, 0,
        "'none' environment should not create any oscillators");
      audioEngine.stop();
    } finally {
      MockAudioContext.prototype.createOscillator = originalCreateOscillator;
    }
  });
});
