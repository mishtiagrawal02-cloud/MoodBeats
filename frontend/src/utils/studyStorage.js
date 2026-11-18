import { AUDIO, STORAGE_KEYS, STUDY_SCENE_IDS } from './constants.js';

export const ACTIVE_SESSION_KEY = 'moodbeats:activeSession';
export const STUDY_PREFERENCES_KEY = 'moodbeats:preSession';

export function parseVolume(value, fallback = 0.6) {
  const volume = value == null || value === '' ? NaN : Number(value);
  return Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : fallback;
}

export function readStudyPreferences(storage = localStorage) {
  let stored;
  try {
    stored = JSON.parse(storage.getItem(STUDY_PREFERENCES_KEY));
  } catch {
    // Preferences can be restored from defaults if unavailable.
  }
  const mins = Number(stored?.mins);
  return {
    ...stored,
    task: typeof stored?.task === 'string' && stored.task.trim() ? stored.task : 'Reading',
    audio: AUDIO.some(({ id }) => id === stored?.audio) ? stored.audio : 'lofi',
    mins: Number.isInteger(mins) && mins >= 1 && mins <= 180 ? mins : 25,
    volume: parseVolume(stored?.volume),
    background: STUDY_SCENE_IDS.includes(stored?.background) ? stored.background : 'night'
  };
}

export function readSessions(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEYS.SESSIONS) || storage.getItem(STORAGE_KEYS.LEGACY_SESSIONS);
  if (!raw) return [];
  const stored = JSON.parse(raw);
  if (!Array.isArray(stored)) throw new Error('Invalid session history');
  return stored;
}

export function appendSession(session, storage = localStorage) {
  const history = readSessions(storage);
  const existing = history.find((item) => item?.id === session.id);
  if (existing) return existing;
  storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([session, ...history]));
  return session;
}

export function readActiveSession(storage = localStorage) {
  try {
    const stored = JSON.parse(storage.getItem(ACTIVE_SESSION_KEY));
    if (!stored) return null;

    const status = stored.stage === 'AFTER_CHECKIN' && !String(stored.status).startsWith('COMPLETED_')
      ? 'COMPLETED_EARLY' : stored.status;
    if (!['ACTIVE', 'PAUSED', 'COMPLETED_TIMER', 'COMPLETED_EARLY'].includes(status)) return null;

    const totalSeconds = Number(stored.totalSeconds) || Number(stored.targetMins) * 60;
    const startedAt = Number(stored.startedAt) || Number(stored.id);
    if (!Number.isFinite(startedAt) || startedAt <= 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;
    const pausedAt = status === 'PAUSED' ? Number(stored.pausedAt) || startedAt : null;
    return {
      ...stored, startedAt, totalSeconds, status, pausedAt,
      id: stored.id ?? startedAt,
      targetMins: Number(stored.targetMins) || Math.round(totalSeconds / 60),
      totalPausedMs: Math.max(0, Number(stored.totalPausedMs) || 0),
      stage: status.startsWith('COMPLETED_') ? 'AFTER_CHECKIN' : 'ACTIVE',
      task: stored.task || 'Study session',
      audio: AUDIO.some(({ id }) => id === stored.audio) ? stored.audio : 'none',
      volume: parseVolume(stored.volume),
      background: STUDY_SCENE_IDS.includes(stored.background) ? stored.background : 'night'
    };
  } catch {
    return null;
  }
}

export function calculateTimerData(session, now = Date.now()) {
  if (!session) return { remainingSeconds: 0, elapsedSeconds: 0, progress: 0 };
  const end = session.status === 'PAUSED' ? session.pausedAt : now;
  const timeSpent = Math.floor((end - session.startedAt - (session.totalPausedMs || 0)) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(session.totalSeconds, timeSpent));
  return {
    remainingSeconds: session.totalSeconds - elapsedSeconds,
    elapsedSeconds,
    progress: elapsedSeconds / session.totalSeconds
  };
}
