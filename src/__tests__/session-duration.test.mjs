import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pure calculation logic matching finishAfterCheckIn implementation:
 * - 0 elapsed seconds must be preserved as 0 minutes (never planned duration).
 * - Non-zero seconds round up (Math.ceil).
 * - Capped at targetMins / totalSeconds.
 */
function calculateRecordedMinutes(activeSession) {
  let rawElapsedSeconds = 0;
  if (typeof activeSession.elapsedSeconds === 'number') {
    rawElapsedSeconds = Math.max(0, activeSession.elapsedSeconds);
  } else if (activeSession.status === 'COMPLETED_TIMER') {
    rawElapsedSeconds = activeSession.totalSeconds || 0;
  } else {
    rawElapsedSeconds = 0;
  }

  const plannedSeconds = activeSession.totalSeconds || ((activeSession.targetMins || 25) * 60);
  const cappedSeconds = Math.min(rawElapsedSeconds, plannedSeconds);
  return cappedSeconds > 0 ? Math.ceil(cappedSeconds / 60) : 0;
}

/**
 * Timestamp elapsed arithmetic matching recalculateTime and endSessionForCheckIn
 */
function calculateElapsedSeconds(session, currentTime) {
  const { startedAt, totalPausedMs = 0, status, pausedAt, totalSeconds } = session;
  let effectiveElapsedMs = 0;
  if (status === 'PAUSED' && pausedAt) {
    effectiveElapsedMs = pausedAt - startedAt - totalPausedMs;
  } else {
    effectiveElapsedMs = currentTime - startedAt - totalPausedMs;
  }
  return Math.max(0, Math.min(totalSeconds, Math.floor(effectiveElapsedMs / 1000)));
}

describe('Session Duration & Data Integrity', () => {
  it('preserves zero elapsed seconds as 0 minutes without substituting planned duration', () => {
    const session = {
      targetMins: 25,
      totalSeconds: 1500,
      elapsedSeconds: 0,
      status: 'COMPLETED_EARLY'
    };
    const mins = calculateRecordedMinutes(session);
    assert.equal(mins, 0, 'Zero elapsed time must yield 0 recorded minutes');
  });

  it('rounds partial minutes up to the next full minute (Math.ceil) for non-zero elapsed time', () => {
    // 15 seconds
    assert.equal(calculateRecordedMinutes({ targetMins: 25, totalSeconds: 1500, elapsedSeconds: 15 }), 1);
    // 59 seconds
    assert.equal(calculateRecordedMinutes({ targetMins: 25, totalSeconds: 1500, elapsedSeconds: 59 }), 1);
    // 60 seconds
    assert.equal(calculateRecordedMinutes({ targetMins: 25, totalSeconds: 1500, elapsedSeconds: 60 }), 1);
    // 61 seconds -> 2 minutes
    assert.equal(calculateRecordedMinutes({ targetMins: 25, totalSeconds: 1500, elapsedSeconds: 61 }), 2);
    // 125 seconds -> 3 minutes
    assert.equal(calculateRecordedMinutes({ targetMins: 25, totalSeconds: 1500, elapsedSeconds: 125 }), 3);
  });

  it('caps recorded minutes at the planned target duration', () => {
    const session = {
      targetMins: 25,
      totalSeconds: 1500,
      elapsedSeconds: 3000, // somehow higher than total
      status: 'COMPLETED_EARLY'
    };
    const mins = calculateRecordedMinutes(session);
    assert.equal(mins, 25, 'Recorded time must not exceed target duration');
  });

  it('records full target minutes when session completed naturally via timer', () => {
    const session = {
      targetMins: 45,
      totalSeconds: 2700,
      elapsedSeconds: 2700,
      status: 'COMPLETED_TIMER'
    };
    const mins = calculateRecordedMinutes(session);
    assert.equal(mins, 45, 'Completed timer must record full 45 minutes');
  });

  it('calculates elapsed time accurately with pause and resume intervals', () => {
    const startedAt = 1000000;
    // Ran for 30s, paused for 60s, ran for another 40s
    // Current time is startedAt + 30s + 60s + 40s = startedAt + 130000ms
    // totalPausedMs = 60000ms
    const session = {
      startedAt,
      totalSeconds: 1500,
      status: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 60000
    };
    const now = startedAt + 130000;
    const elapsed = calculateElapsedSeconds(session, now);
    assert.equal(elapsed, 70, 'Effective elapsed seconds must deduct totalPausedMs (130s - 60s = 70s)');
  });

  it('calculates elapsed time correctly while currently in PAUSED state', () => {
    const startedAt = 1000000;
    const pausedAt = startedAt + 50000; // paused at 50s
    const session = {
      startedAt,
      totalSeconds: 1500,
      status: 'PAUSED',
      pausedAt,
      totalPausedMs: 0
    };
    // Even if current time is 10 minutes later, elapsed time should freeze at pausedAt
    const now = startedAt + 600000;
    const elapsed = calculateElapsedSeconds(session, now);
    assert.equal(elapsed, 50, 'Elapsed time while paused must be anchored to pausedAt timestamp');
  });
});
