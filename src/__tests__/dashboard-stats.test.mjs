import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure computation logic matching updated useDashboardStats
function calculateDashboardStats(sessions, goal = 150) {
  const list = Array.isArray(sessions) ? sessions : [];

  // Filter for legitimate sessions with actual study time (>0 mins).
  const validSessions = list.filter((s) => (Number(s?.mins) || 0) > 0);

  // 1. Total Study Hours & Minutes
  const totalMins = validSessions.reduce((acc, s) => acc + (Number(s?.mins) || 0), 0);
  const totalHours = (totalMins / 60).toFixed(1);

  // 2. Completed Sessions (sessions with actual study time > 0)
  const completedSessions = validSessions.length;

  // 3. Current Study Streak
  let streak = 0;
  const studySessionsWithTime = validSessions.filter(
    (s) => s?.ts && !isNaN(new Date(s.ts).getTime())
  );
  if (studySessionsWithTime.length > 0) {
    const daySet = new Set(studySessionsWithTime.map((s) => new Date(s.ts).toDateString()));
    const d = new Date();
    // If user hasn't studied yet today, check yesterday to keep active streak
    if (!daySet.has(d.toDateString())) {
      d.setDate(d.getDate() - 1);
    }
    while (daySet.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
  }

  // 4. Weekly Goal Progress (Past 7 rolling days)
  const weekAgo = Date.now() - 7 * 864e5;
  const weekSessions = validSessions.filter((s) => (s?.ts || 0) >= weekAgo);
  const weekMins = weekSessions.reduce((acc, s) => acc + (Number(s?.mins) || 0), 0);
  const goalMinutes = Math.max(1, Number(goal) || 150);
  const goalPercent = Math.min(100, Math.round((weekMins / goalMinutes) * 100));

  // 5. Recent study sessions
  const sortedSessions = [...validSessions].sort((a, b) => (b?.ts || 0) - (a?.ts || 0));
  const recentSessions = sortedSessions.slice(0, 4);

  // 6. Insights
  let avgFocusDeltaAll = 0;
  let avgStressReductionAll = 0;
  if (validSessions.length > 0) {
    const focusSum = validSessions.reduce(
      (acc, s) => acc + ((s.post?.focus ?? 5) - (s.pre?.focus ?? 5)),
      0
    );
    const stressSum = validSessions.reduce(
      (acc, s) => acc + ((s.pre?.stress ?? 5) - (s.post?.stress ?? 5)),
      0
    );
    avgFocusDeltaAll = Math.round((focusSum / validSessions.length) * 10) / 10;
    avgStressReductionAll = Math.round((stressSum / validSessions.length) * 10) / 10;
  }

  return {
    totalHours,
    totalMins,
    completedSessions,
    streak,
    weekMins,
    goalPercent,
    recentSessions,
    avgFocusDelta: avgFocusDeltaAll,
    avgStressReduction: avgStressReductionAll
  };
}

describe('Dashboard Statistics Calculations', () => {
  it('correctly aggregates study minutes and hours', () => {
    const sessions = [
      { id: 1, mins: 25, ts: Date.now() },
      { id: 2, mins: 45, ts: Date.now() },
      { id: 3, mins: 15, ts: Date.now() }
    ];
    const stats = calculateDashboardStats(sessions, 150);
    assert.equal(stats.totalMins, 85);
    assert.equal(stats.totalHours, '1.4');
  });

  it('excludes 0-minute sessions from completedSessions count and study streak', () => {
    const today = Date.now();
    const sessions = [
      { id: 1, mins: 0, ts: today, completionType: 'EARLY', pre: { focus: 2 }, post: { focus: 10 } }, // 0-minute immediate end
      { id: 2, mins: 25, ts: today, completionType: 'TIMER', pre: { focus: 5 }, post: { focus: 7 } }
    ];
    const stats = calculateDashboardStats(sessions, 150);
    assert.equal(stats.completedSessions, 1, 'Only sessions with >0 mins count as completed');
    assert.equal(stats.totalMins, 25);
    assert.equal(stats.streak, 1);
    assert.equal(stats.recentSessions.length, 1, '0-minute session must not appear in recent sessions list');
    assert.equal(stats.avgFocusDelta, 2, 'Focus delta must not be distorted by 0-minute session (+2 vs diluted average)');
  });

  it('counts both naturally completed and early completed sessions when mins > 0', () => {
    const today = Date.now();
    const sessions = [
      { id: 1, mins: 25, ts: today, completionType: 'TIMER' },
      { id: 2, mins: 12, ts: today, completionType: 'EARLY' }
    ];
    const stats = calculateDashboardStats(sessions, 150);
    assert.equal(stats.completedSessions, 2);
    assert.equal(stats.totalMins, 37);
  });

  it('calculates weekly goal progress correctly and clamps at 100%', () => {
    const today = Date.now();
    const sessions = [
      { id: 1, mins: 100, ts: today },
      { id: 2, mins: 100, ts: today }
    ];
    const stats = calculateDashboardStats(sessions, 150);
    assert.equal(stats.weekMins, 200);
    assert.equal(stats.goalPercent, 100, 'Goal percentage must clamp at 100');
  });

  it('excludes sessions older than 7 rolling days from weekly goal calculation', () => {
    const now = Date.now();
    const tenDaysAgo = now - 10 * 864e5;
    const sessions = [
      { id: 1, mins: 60, ts: now },
      { id: 2, mins: 60, ts: tenDaysAgo } // old session
    ];
    const stats = calculateDashboardStats(sessions, 150);
    assert.equal(stats.weekMins, 60, 'Old sessions must not count toward past-7-day weekly total');
    assert.equal(stats.totalMins, 120, 'All sessions count toward lifetime total');
  });

  it('handles empty session history gracefully', () => {
    const stats = calculateDashboardStats([], 150);
    assert.equal(stats.totalMins, 0);
    assert.equal(stats.totalHours, '0.0');
    assert.equal(stats.completedSessions, 0);
    assert.equal(stats.streak, 0);
    assert.equal(stats.weekMins, 0);
    assert.equal(stats.goalPercent, 0);
  });

  it('defensively handles null, undefined, and malformed session records without crashing', () => {
    const malformed = [
      null,
      undefined,
      {},
      { mins: 'not-a-number', ts: 'invalid-date' },
      { mins: null, ts: null },
      { mins: 30, ts: Date.now() }
    ];
    const stats = calculateDashboardStats(malformed, 150);
    assert.equal(stats.totalMins, 30);
    assert.equal(stats.completedSessions, 1);
  });
});
