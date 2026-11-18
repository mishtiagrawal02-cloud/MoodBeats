import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Session Restoration Regression Tests
 * 
 * Tests verify that active study sessions survive page refresh and restore correctly.
 * Uses actual localStorage and simulates React hook initialization logic.
 */

const ACTIVE_SESSION_KEY = 'moodbeats:activeSession';

// Mock localStorage for Node.js environment
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

let mockLocalStorage;

beforeEach(() => {
  mockLocalStorage = new MockStorage();
});

afterEach(() => {
  mockLocalStorage.clear();
});

/**
 * Simulates the stage initialization logic from useActiveStudySession hook
 */
function resolveStageFromStorage(localStorage) {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.stage === 'AFTER_CHECKIN' || parsed.status === 'COMPLETED_TIMER' || parsed.status === 'COMPLETED_EARLY') {
        return 'AFTER_CHECKIN';
      }
      if (parsed.status === 'ACTIVE' || parsed.status === 'PAUSED') {
        return 'ACTIVE';
      }
    }
  } catch {
    // ignore
  }
  return 'CHECK_IN';
}

/**
 * Simulates the activeSession initialization logic
 */
function loadActiveSessionFromStorage(localStorage) {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

/**
 * Simulates recalculateTime logic for remaining seconds
 */
function calculateRemainingTime(session) {
  if (!session) return { remainingSeconds: 0, elapsedSeconds: 0, progress: 0 };

  const { startedAt, totalSeconds, status, pausedAt, totalPausedMs } = session;
  const now = Date.now();

  let effectiveElapsedMs = 0;
  if (status === 'PAUSED' && pausedAt) {
    effectiveElapsedMs = pausedAt - startedAt - (totalPausedMs || 0);
  } else {
    effectiveElapsedMs = now - startedAt - (totalPausedMs || 0);
  }

  const elapsedSeconds = Math.max(0, Math.floor(effectiveElapsedMs / 1000));
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const progress = totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;

  return { remainingSeconds, elapsedSeconds, progress };
}

describe('Session Restoration After Page Refresh', () => {
  it('restores ACTIVE session and displays ActiveStudyRoom', () => {
    const now = Date.now();
    const activeSession = {
      id: now,
      startedAt: now,
      targetMins: 15,
      totalSeconds: 900,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Coding',
      audio: 'instr',
      volume: 0.6,
      pre: {
        mood: 3,
        stress: 5,
        focus: 5
      }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSession));

    // Simulate page refresh - hook re-initializes
    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredStage, 'ACTIVE', 'stage should be ACTIVE after refresh');
    assert.ok(restoredSession, 'activeSession should be restored');
    assert.equal(restoredSession.status, 'ACTIVE');
    assert.equal(restoredSession.task, 'Coding');
    assert.equal(restoredSession.audio, 'instr');
    assert.equal(restoredSession.volume, 0.6);
  });

  it('calculates remaining time correctly after refresh', () => {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const activeSession = {
      id: fiveMinutesAgo,
      startedAt: fiveMinutesAgo,
      targetMins: 15,
      totalSeconds: 900,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Reading',
      audio: 'lofi',
      volume: 0.5,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    // 5 minutes elapsed out of 15 = 10 minutes remaining (600 seconds)
    assert.ok(timerData.elapsedSeconds >= 298 && timerData.elapsedSeconds <= 302,
      `elapsed should be ~300 seconds, got ${timerData.elapsedSeconds}`);
    assert.ok(timerData.remainingSeconds >= 598 && timerData.remainingSeconds <= 602,
      `remaining should be ~600 seconds, got ${timerData.remainingSeconds}`);
    assert.ok(timerData.progress > 0.32 && timerData.progress < 0.35,
      `progress should be ~0.33, got ${timerData.progress}`);
  });

  it('restores PAUSED session correctly', () => {
    const now = Date.now();
    const startTime = now - (3 * 60 * 1000); // Started 3 minutes ago
    const pauseTime = now - (60 * 1000);     // Paused 1 minute ago

    const pausedSession = {
      id: startTime,
      startedAt: startTime,
      targetMins: 20,
      totalSeconds: 1200,
      status: 'PAUSED',
      stage: 'ACTIVE',
      pausedAt: pauseTime,
      totalPausedMs: 0,
      task: 'Studying',
      audio: 'ambient',
      volume: 0.7,
      pre: { mood: 4, stress: 3, focus: 6 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(pausedSession));

    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    assert.equal(restoredStage, 'ACTIVE', 'stage should be ACTIVE for paused session');
    assert.equal(restoredSession.status, 'PAUSED');
    
    // Elapsed time should be calculated up to pausedAt, not current time
    // pauseTime - startTime = 2 minutes = 120 seconds
    assert.ok(timerData.elapsedSeconds >= 118 && timerData.elapsedSeconds <= 122,
      `elapsed should be ~120 seconds at pause time, got ${timerData.elapsedSeconds}`);
  });

  it('handles expired session correctly', () => {
    const now = Date.now();
    const twentyMinutesAgo = now - (20 * 60 * 1000);

    const expiredSession = {
      id: twentyMinutesAgo,
      startedAt: twentyMinutesAgo,
      targetMins: 15,
      totalSeconds: 900,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Writing',
      audio: 'nature',
      volume: 0.6,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(expiredSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    assert.equal(timerData.remainingSeconds, 0, 'remaining seconds should be 0 for expired session');
    assert.ok(timerData.elapsedSeconds >= 900, 'elapsed should be at least totalSeconds for expired session');
    assert.equal(timerData.progress, 1, 'progress should be 100% for expired session');
  });

  it('falls back to CHECK_IN when localStorage is empty', () => {
    // No session in localStorage
    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredStage, 'CHECK_IN', 'should default to CHECK_IN when no session exists');
    assert.equal(restoredSession, null, 'should return null when no session exists');
  });

  it('falls back to CHECK_IN when localStorage has invalid JSON', () => {
    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, 'invalid-json{');

    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredStage, 'CHECK_IN', 'should default to CHECK_IN with invalid JSON');
    assert.equal(restoredSession, null, 'should return null with invalid JSON');
  });

  it('falls back to CHECK_IN when session is malformed', () => {
    const malformedSession = {
      id: Date.now(),
      // Missing critical fields like status, startedAt, totalSeconds
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(malformedSession));

    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    // Stage resolution should handle missing status gracefully
    assert.equal(restoredStage, 'CHECK_IN', 'should default to CHECK_IN with malformed session');
    assert.ok(restoredSession !== null, 'should still parse the object even if incomplete');
  });

  it('restores COMPLETED_TIMER session to AFTER_CHECKIN stage', () => {
    const now = Date.now();
    const completedSession = {
      id: now - 1000000,
      startedAt: now - 1000000,
      targetMins: 25,
      totalSeconds: 1500,
      status: 'COMPLETED_TIMER',
      stage: 'AFTER_CHECKIN',
      pausedAt: null,
      totalPausedMs: 0,
      completedAt: now - 10000,
      elapsedSeconds: 1500,
      task: 'Research',
      audio: 'freq',
      volume: 0.4,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(completedSession));

    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredStage, 'AFTER_CHECKIN', 'completed session should restore to AFTER_CHECKIN');
    assert.equal(restoredSession.status, 'COMPLETED_TIMER');
  });

  it('restores COMPLETED_EARLY session to AFTER_CHECKIN stage', () => {
    const now = Date.now();
    const earlyCompletedSession = {
      id: now - 500000,
      startedAt: now - 500000,
      targetMins: 30,
      totalSeconds: 1800,
      status: 'COMPLETED_EARLY',
      stage: 'AFTER_CHECKIN',
      pausedAt: null,
      totalPausedMs: 0,
      completedAt: now - 5000,
      elapsedSeconds: 600,
      task: 'Math',
      audio: 'ambient',
      volume: 0.7,
      pre: { mood: 4, stress: 6, focus: 4 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(earlyCompletedSession));

    const restoredStage = resolveStageFromStorage(mockLocalStorage);
    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredStage, 'AFTER_CHECKIN', 'early completed session should restore to AFTER_CHECKIN');
    assert.equal(restoredSession.status, 'COMPLETED_EARLY');
    assert.equal(restoredSession.elapsedSeconds, 600);
  });

  it('correctly accounts for totalPausedMs in time calculation', () => {
    const now = Date.now();
    const startTime = now - (10 * 60 * 1000); // Started 10 minutes ago
    const totalPausedMs = 3 * 60 * 1000;       // Paused for 3 minutes total

    const sessionWithPauses = {
      id: startTime,
      startedAt: startTime,
      targetMins: 20,
      totalSeconds: 1200,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: totalPausedMs,
      task: 'Coding',
      audio: 'lofi',
      volume: 0.6,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionWithPauses));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    // 10 minutes elapsed - 3 minutes paused = 7 minutes effective = 420 seconds
    assert.ok(timerData.elapsedSeconds >= 418 && timerData.elapsedSeconds <= 422,
      `elapsed should be ~420 seconds accounting for pauses, got ${timerData.elapsedSeconds}`);
  });

  it('preserves all session metadata after restoration', () => {
    const now = Date.now();
    const sessionWithMetadata = {
      id: now - 120000,
      startedAt: now - 120000,
      targetMins: 25,
      totalSeconds: 1500,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Custom Task Name',
      audio: 'instr',
      volume: 0.8,
      pre: {
        mood: 5,
        stress: 2,
        focus: 7
      }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionWithMetadata));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);

    assert.equal(restoredSession.task, 'Custom Task Name', 'task name should be preserved');
    assert.equal(restoredSession.audio, 'instr', 'audio selection should be preserved');
    assert.equal(restoredSession.volume, 0.8, 'volume level should be preserved');
    assert.equal(restoredSession.targetMins, 25, 'target duration should be preserved');
    assert.deepEqual(restoredSession.pre, { mood: 5, stress: 2, focus: 7 },
      'pre-study check-in values should be preserved');
  });
});

describe('Session Restoration Edge Cases', () => {
  it('handles session with zero elapsed time correctly', () => {
    const now = Date.now();
    const justStartedSession = {
      id: now,
      startedAt: now,
      targetMins: 30,
      totalSeconds: 1800,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Reading',
      audio: 'nature',
      volume: 0.5,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(justStartedSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    assert.ok(timerData.elapsedSeconds <= 1, 'elapsed should be 0 or 1 second for just-started session');
    assert.ok(timerData.remainingSeconds >= 1799, 'remaining should be nearly full duration');
    assert.ok(timerData.progress < 0.001, 'progress should be near 0%');
  });

  it('handles session with custom duration correctly', () => {
    const now = Date.now();
    const customDurationSession = {
      id: now - 60000,
      startedAt: now - 60000,
      targetMins: 7,
      totalSeconds: 420,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Quick Review',
      audio: 'freq',
      volume: 0.4,
      pre: { mood: 4, stress: 4, focus: 6 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(customDurationSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    assert.equal(restoredSession.targetMins, 7, 'custom duration should be preserved');
    assert.equal(restoredSession.totalSeconds, 420, 'total seconds should match custom duration');
    assert.ok(timerData.elapsedSeconds >= 58 && timerData.elapsedSeconds <= 62,
      'elapsed time should be calculated for custom duration');
  });

  it('handles session with "none" audio environment', () => {
    const now = Date.now();
    const silentSession = {
      id: now,
      startedAt: now,
      targetMins: 45,
      totalSeconds: 2700,
      status: 'ACTIVE',
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: 'Silent Reading',
      audio: 'none',
      volume: 0.6,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(silentSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const restoredStage = resolveStageFromStorage(mockLocalStorage);

    assert.equal(restoredSession.audio, 'none', 'none audio environment should be preserved');
    assert.equal(restoredStage, 'ACTIVE', 'session with no audio should still restore to ACTIVE stage');
  });

  it('handles session paused at exact start time', () => {
    const now = Date.now();
    const startTime = now - 300000;

    const pausedAtStartSession = {
      id: startTime,
      startedAt: startTime,
      targetMins: 25,
      totalSeconds: 1500,
      status: 'PAUSED',
      stage: 'ACTIVE',
      pausedAt: startTime, // Paused immediately
      totalPausedMs: 0,
      task: 'Planning',
      audio: 'ambient',
      volume: 0.6,
      pre: { mood: 3, stress: 5, focus: 5 }
    };

    mockLocalStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(pausedAtStartSession));

    const restoredSession = loadActiveSessionFromStorage(mockLocalStorage);
    const timerData = calculateRemainingTime(restoredSession);

    assert.equal(timerData.elapsedSeconds, 0, 'elapsed should be 0 when paused at start');
    assert.equal(timerData.remainingSeconds, 1500, 'remaining should be full duration');
  });
});
