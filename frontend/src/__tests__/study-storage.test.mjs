import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVE_SESSION_KEY,
  STUDY_PREFERENCES_KEY,
  appendSession,
  calculateTimerData,
  readActiveSession,
  readSessions,
  readStudyPreferences
} from '../utils/studyStorage.js';
import { STORAGE_KEYS } from '../utils/constants.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value)
  };
}

test('appending a session preserves legacy history and retries do not duplicate a receipt', () => {
  const storage = memoryStorage();
  const legacy = { id: 10, mins: 20 };
  const session = { id: 11, mins: 15, notes: 'Original check-in' };
  storage.setItem(STORAGE_KEYS.LEGACY_SESSIONS, JSON.stringify([legacy]));

  assert.deepEqual(appendSession(session, storage), session);
  assert.deepEqual(appendSession({ ...session, notes: 'Repeated save' }, storage), session);
  assert.deepEqual(readSessions(storage), [session, legacy]);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEYS.LEGACY_SESSIONS)), [legacy]);
});

test('a corrupt saved history cannot silently be replaced by a new receipt', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEYS.SESSIONS, '{"previous":"invalid"}');
  assert.throws(() => appendSession({ id: 12 }, storage), /Invalid session history/);
  assert.equal(storage.getItem(STORAGE_KEYS.SESSIONS), '{"previous":"invalid"}');
});

test('a paused session restores remaining time from its saved timestamp and past pauses', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 1_000, startedAt: 1_000, totalSeconds: 60,
    status: 'PAUSED', pausedAt: 26_000, totalPausedMs: 5_000,
    audio: 'nature', volume: 0
  }));
  const active = readActiveSession(storage);
  assert.equal(active.volume, 0);
  assert.equal(active.stage, 'ACTIVE');
  assert.deepEqual(calculateTimerData(active, 125_000), {
    remainingSeconds: 40, elapsedSeconds: 20, progress: 1 / 3
  });
});

test('an expired running timer clamps every displayed value to its planned duration', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 1_000, targetMins: 1, status: 'ACTIVE'
  }));
  assert.deepEqual(calculateTimerData(readActiveSession(storage), 120_000), {
    remainingSeconds: 0, elapsedSeconds: 60, progress: 1
  });
});

test('invalid session and preference values fall back while a preference of zero volume is preserved', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ status: 'ACTIVE', totalSeconds: -10 }));
  storage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify({ mins: 'bad', audio: 'invalid', volume: 0 }));
  assert.equal(readActiveSession(storage), null);
  assert.deepEqual(readStudyPreferences(storage), {
    task: 'Reading', mins: 25, audio: 'lofi', volume: 0, background: 'night'
  });
});

test('an unknown background scene falls back to night while a known scene is preserved', () => {
  const storage = memoryStorage();
  storage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify({ background: 'aurora' }));
  assert.equal(readStudyPreferences(storage).background, 'night');
  storage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify({ background: 'sakura' }));
  assert.equal(readStudyPreferences(storage).background, 'sakura');
});

test('an active session restores its saved background scene', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 5_000, startedAt: 5_000, totalSeconds: 300,
    status: 'ACTIVE', audio: 'lofi', background: 'sakura'
  }));
  const active = readActiveSession(storage);
  assert.equal(active.background, 'sakura');

  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 6_000, startedAt: 6_000, totalSeconds: 300, status: 'ACTIVE'
  }));
  assert.equal(readActiveSession(storage).background, 'night');
});

test('live scene switching updates only the background across night, sakura and sunny', () => {
  const storage = memoryStorage();
  // Active session snapshot as persisted by useActiveStudySession.startSession
  const base = {
    id: 9_000, startedAt: 9_000, targetMins: 25, totalSeconds: 1_500,
    status: 'ACTIVE', stage: 'ACTIVE', pausedAt: null, totalPausedMs: 0,
    task: 'Reading', audio: 'lofi', volume: 0.6, background: 'night',
    pre: { mood: 4, stress: 5, focus: 5 }
  };
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(base));

  // Same spread the hook's setBackground performs; nothing else may change.
  const switchScene = (background) => {
    const current = JSON.parse(storage.getItem(ACTIVE_SESSION_KEY));
    storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ ...current, background }));
  };

  switchScene('sakura');
  let active = readActiveSession(storage);
  assert.equal(active.background, 'sakura');
  switchScene('sunny');
  active = readActiveSession(storage);
  assert.equal(active.background, 'sunny');
  switchScene('night');
  active = readActiveSession(storage);
  assert.equal(active.background, 'night');

  // Every session-critical field survived the round trip untouched.
  assert.equal(active.status, 'ACTIVE');
  assert.equal(active.startedAt, base.startedAt);
  assert.equal(active.targetMins, base.targetMins);
  assert.equal(active.totalSeconds, base.totalSeconds);
  assert.equal(active.task, base.task);
  assert.equal(active.audio, base.audio);
  assert.equal(active.volume, base.volume);
  assert.deepEqual(active.pre, base.pre);
  assert.equal(active.pausedAt, null);
  assert.equal(active.totalPausedMs, 0);
});

test('a scene change during an active session is persisted and restored on refresh', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 11_000, startedAt: 11_000, totalSeconds: 1_500, status: 'ACTIVE',
    audio: 'nature', background: 'night'
  }));
  const stored = JSON.parse(storage.getItem(ACTIVE_SESSION_KEY));
  // Live switch (same spread as setBackground), then an app refresh re-reads storage.
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ ...stored, background: 'sunny' }));
  assert.equal(readActiveSession(storage).background, 'sunny');
});

test('a paused session keeps its pause state and latest scene across a refresh', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 12_000, startedAt: 12_000, totalSeconds: 1_500,
    status: 'PAUSED', pausedAt: 20_000, totalPausedMs: 4_000,
    background: 'sakura'
  }));
  // Switch scene while paused (same spread as setBackground)
  const stored = JSON.parse(storage.getItem(ACTIVE_SESSION_KEY));
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({ ...stored, background: 'night' }));

  const active = readActiveSession(storage);
  assert.equal(active.background, 'night');
  assert.equal(active.status, 'PAUSED');
  assert.equal(active.pausedAt, 20_000);
  assert.equal(active.totalPausedMs, 4_000);
});

test('an invalid scene id on an active session falls back to night', () => {
  const storage = memoryStorage();
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
    id: 13_000, startedAt: 13_000, totalSeconds: 300,
    status: 'ACTIVE', background: 'aurora'
  }));
  assert.equal(readActiveSession(storage).background, 'night');
});
