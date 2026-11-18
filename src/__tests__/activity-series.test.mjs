import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateActivitySeries, calculateAudioAnalysis, filterSessionsByRange } from '../utils/analyticsCalculations.js';

test('activity groups real study minutes and leaves unrecorded ratings blank', () => {
  const sessions = [
    { ts: new Date(2026, 10, 9, 10).getTime(), mins: 10, post: { focus: 8 } },
    { ts: new Date(2026, 10, 11, 11).getTime(), mins: 20, post: { stress: 4 } },
    { ts: new Date(2026, 10, 11, 12).getTime(), mins: 5, post: { focus: 6, stress: 2 } },
    { ts: new Date(2026, 10, 14, 11).getTime(), mins: 0, post: { focus: 10, stress: 10 } }
  ];

  const daily = calculateActivitySeries(sessions, 'day');
  assert.deepEqual(daily.map(({ minutes, focus, stress }) => ({ minutes, focus, stress })), [
    { minutes: 10, focus: 8, stress: null },
    { minutes: 25, focus: 6, stress: 3 }
  ]);
  for (const interval of ['week', 'month']) {
    const [bucket] = calculateActivitySeries(sessions, interval);
    assert.deepEqual([bucket.minutes, bucket.sessions, bucket.focus, bucket.stress], [35, 3, 7, 3]);
  }
});

test('analytics accepts an ISO timestamp from existing session history', () => {
  const now = new Date(2026, 10, 18, 12).getTime();
  const session = { ts: new Date(2026, 10, 18, 8).toISOString(), mins: 25 };
  assert.deepEqual(filterSessionsByRange([session], '7d', now).currentSessions, [session]);
});

test('most frequently used soundscape is ranked by sessions rather than duration', () => {
  const now = Date.now();
  const result = calculateAudioAnalysis([
    { ts: now, mins: 100, audio: 'lofi' },
    { ts: now, mins: 5, audio: 'nature' },
    { ts: now, mins: 5, audio: 'nature' }
  ]);
  assert.equal(result.mostUsed.id, 'nature');
  assert.equal(result.mostUsed.sessionCount, 2);
});
