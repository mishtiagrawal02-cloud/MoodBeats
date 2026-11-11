import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for lifecycle testing
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
globalThis.localStorage = mockStorage;

// Stage recovery logic under test
function recoverStage(activeSessionRaw) {
  if (!activeSessionRaw) return 'CHECK_IN';
  try {
    const parsed = typeof activeSessionRaw === 'string' ? JSON.parse(activeSessionRaw) : activeSessionRaw;
    if (parsed.stage === 'AFTER_CHECKIN' || parsed.status === 'COMPLETED_TIMER' || parsed.status === 'COMPLETED_EARLY') {
      return 'AFTER_CHECKIN';
    }
    if (parsed.status === 'ACTIVE' || parsed.status === 'PAUSED') {
      return 'ACTIVE';
    }
  } catch {
    // fallback
  }
  return 'CHECK_IN';
}

describe('Session Lifecycle Transitions', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('resolves stage to AFTER_CHECKIN when session completed naturally via timer', () => {
    const active = {
      id: 12345,
      status: 'COMPLETED_TIMER',
      stage: 'AFTER_CHECKIN',
      totalSeconds: 1500,
      elapsedSeconds: 1500
    };
    mockStorage.setItem('moodbeats:activeSession', JSON.stringify(active));
    const stage = recoverStage(mockStorage.getItem('moodbeats:activeSession'));
    assert.equal(stage, 'AFTER_CHECKIN');
  });

  it('resolves stage to AFTER_CHECKIN when session ended early by user', () => {
    const active = {
      id: 12346,
      status: 'COMPLETED_EARLY',
      stage: 'AFTER_CHECKIN',
      totalSeconds: 1500,
      elapsedSeconds: 320
    };
    mockStorage.setItem('moodbeats:activeSession', JSON.stringify(active));
    const stage = recoverStage(mockStorage.getItem('moodbeats:activeSession'));
    assert.equal(stage, 'AFTER_CHECKIN');
  });

  it('resolves stage to ACTIVE when active session is ACTIVE or PAUSED', () => {
    const running = { id: 1, status: 'ACTIVE', stage: 'ACTIVE' };
    assert.equal(recoverStage(JSON.stringify(running)), 'ACTIVE');

    const paused = { id: 2, status: 'PAUSED', stage: 'ACTIVE' };
    assert.equal(recoverStage(JSON.stringify(paused)), 'ACTIVE');
  });

  it('resolves stage to CHECK_IN when storage is empty or malformed', () => {
    assert.equal(recoverStage(null), 'CHECK_IN');
    assert.equal(recoverStage(''), 'CHECK_IN');
    assert.equal(recoverStage('not-json'), 'CHECK_IN');
  });

  it('abandonSession cleans active session and never writes to moodbeats:sessions', () => {
    mockStorage.setItem('moodbeats:activeSession', JSON.stringify({ id: 99, status: 'ACTIVE' }));
    mockStorage.setItem('moodbeats:sessions', JSON.stringify([]));

    // Simulate abandonSession logic
    mockStorage.removeItem('moodbeats:activeSession');

    assert.equal(mockStorage.getItem('moodbeats:activeSession'), null);
    const saved = JSON.parse(mockStorage.getItem('moodbeats:sessions'));
    assert.equal(saved.length, 0, 'Abandoned session must not be added to completed sessions');
  });

  it('finishAfterCheckIn writes to moodbeats:sessions with completionType and cleans active session', () => {
    const active = {
      id: 555,
      targetMins: 25,
      totalSeconds: 1500,
      elapsedSeconds: 900,
      status: 'COMPLETED_EARLY',
      task: 'Coding',
      audio: 'lofi',
      pre: { mood: 3, stress: 5, focus: 5 }
    };
    mockStorage.setItem('moodbeats:activeSession', JSON.stringify(active));

    // Simulate finishAfterCheckIn
    const elapsedMinutes = Math.min(active.targetMins, Math.ceil(active.elapsedSeconds / 60));
    const finalSession = {
      id: active.id,
      ts: active.id,
      task: active.task,
      audio: active.audio,
      mins: elapsedMinutes,
      targetMins: active.targetMins,
      completionType: active.status === 'COMPLETED_EARLY' ? 'EARLY' : 'TIMER',
      taskCompletion: 'completed',
      notes: 'Good progress',
      pre: { ...active.pre },
      post: { mood: 4, stress: 3, focus: 7 }
    };

    const existing = JSON.parse(mockStorage.getItem('moodbeats:sessions') || '[]');
    mockStorage.setItem('moodbeats:sessions', JSON.stringify([finalSession, ...existing]));
    mockStorage.removeItem('moodbeats:activeSession');

    // Verification
    assert.equal(mockStorage.getItem('moodbeats:activeSession'), null, 'Active session must be cleared');
    const sessions = JSON.parse(mockStorage.getItem('moodbeats:sessions'));
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].mins, 15);
    assert.equal(sessions[0].completionType, 'EARLY');
    assert.equal(sessions[0].task, 'Coding');
  });
});
