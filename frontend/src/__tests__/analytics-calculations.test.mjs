import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DATE_RANGES,
  filterSessionsByRange,
  getProductiveSessions,
  formatMinutesHuman,
  calculateOverviewStats,
  calculateMoodTrends,
  calculateFocusStressAnalysis,
  calculateStudyConsistency,
  calculateAudioAnalysis,
  calculateTaskDistribution,
  generatePersonalInsights
} from '../utils/analyticsCalculations.js';

describe('Analytics Calculations Suite', () => {
  const now = 1700000000000; // Fixed timestamp for deterministic testing
  const oneDay = 864e5;

  const mockSessions = [
    {
      id: 1,
      ts: now - oneDay * 1, // 1 day ago
      mins: 25,
      task: 'Reading',
      audio: 'lofi',
      pre: { mood: 3, stress: 7, focus: 5 },
      post: { mood: 4, stress: 4, focus: 8 }
    },
    {
      id: 2,
      ts: now - oneDay * 2, // 2 days ago
      mins: 45,
      task: 'Coding',
      audio: 'lofi',
      pre: { mood: 2, stress: 8, focus: 4 },
      post: { mood: 4, stress: 3, focus: 9 }
    },
    {
      id: 3,
      ts: now - oneDay * 3, // 3 days ago
      mins: 15,
      task: 'Coding',
      audio: 'nature',
      pre: { mood: 3, stress: 5, focus: 6 },
      post: { mood: 4, stress: 4, focus: 7 }
    },
    {
      id: 4,
      ts: now - oneDay * 12, // 12 days ago (in prior 30d, out of 7d)
      mins: 60,
      task: 'Writing',
      audio: 'instr',
      pre: { mood: 4, stress: 6, focus: 6 },
      post: { mood: 5, stress: 2, focus: 8 }
    },
    {
      id: 5,
      ts: now - oneDay * 1,
      mins: 0, // Immediately ended session: MUST BE EXCLUDED from productive stats
      task: 'Reading',
      audio: 'ambient',
      pre: { mood: 1, stress: 9, focus: 2 },
      post: { mood: 1, stress: 9, focus: 2 }
    }
  ];

  it('1. Date-range filtering correctly segments current and previous periods', () => {
    // 7 days range
    const weekResult = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    assert.equal(weekResult.currentSessions.length, 4, 'Should include 4 sessions in past 7 days (including the 0m session before filter)');
    assert.equal(weekResult.previousSessions.length, 1, 'Should include 1 session from days 8-14 in previous comparison period');

    // 30 days range
    const monthResult = filterSessionsByRange(mockSessions, DATE_RANGES.MONTH, now);
    assert.equal(monthResult.currentSessions.length, 5, 'All mock sessions fall within 30 days');

    // All time
    const allResult = filterSessionsByRange(mockSessions, DATE_RANGES.ALL, now);
    assert.equal(allResult.currentSessions.length, 5);
    assert.equal(allResult.previousSessions.length, 0);
  });

  it('2. Zero-minute session exclusion: getProductiveSessions ignores 0m and malformed sessions', () => {
    const productive = getProductiveSessions(mockSessions);
    assert.equal(productive.length, 4, 'Must exclude the 0-minute session');
    assert.ok(productive.every((s) => s.mins > 0), 'Every productive session must have mins > 0');

    // Malformed entries
    const malformed = [null, undefined, {}, { mins: 'invalid' }, { mins: -5, ts: now }];
    assert.equal(getProductiveSessions(malformed).length, 0);
  });

  it('3. Total study time and formatting are accurate', () => {
    const { currentSessions, previousSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions, previousSessions);

    // Sum of productive in week: 25 + 45 + 15 = 85 mins
    assert.equal(stats.totalMins, 85);
    assert.equal(stats.totalTimeFormatted, '1h 25m');
    assert.equal(formatMinutesHuman(45), '45m');
    assert.equal(formatMinutesHuman(120), '2h');
    assert.equal(formatMinutesHuman(0), '0m');
  });

  it('4. Completed session counts only count legitimate sessions', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions);
    assert.equal(stats.completedSessions, 3, '3 productive sessions in 7d range');
  });

  it('5. Average Focus calculation handles valid ratings correctly', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions);
    // Post focus values: 8, 9, 7 -> sum = 24 / 3 = 8.0
    assert.equal(stats.avgFocus, 8.0);
  });

  it('6. Average Stress Reduction calculates (pre - post) accurately', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions);
    // Stress diffs: (7-4)=3, (8-3)=5, (5-4)=1 -> sum = 9 / 3 = 3.0 pts reduction
    assert.equal(stats.avgStressReduction, 3.0);
  });

  it('7. Focus Improvement calculates (post - pre) accurately', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions);
    // Focus gains: (8-5)=3, (9-4)=5, (7-6)=1 -> sum = 9 / 3 = 3.0 pts gain
    assert.equal(stats.avgFocusImprovement, 3.0);
  });

  it('8. Comparison indicators reflect actual differences without inventing percentages', () => {
    const { currentSessions, previousSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const stats = calculateOverviewStats(currentSessions, previousSessions);
    // Current total: 85m (3 sessions). Previous total (session 4): 60m (1 session)
    assert.equal(stats.diffTimeMinutes, 25, '85m - 60m = +25m');
    assert.equal(stats.diffSessions, 2, '3 sessions - 1 session = +2 sessions');
    assert.equal(stats.hasPriorPeriod, true);
  });

  it('9. Mood trends calculate chronological averages and mood shift', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const moodStats = calculateMoodTrends(currentSessions, DATE_RANGES.WEEK);

    assert.ok(moodStats.chartData.length > 0);
    assert.ok(moodStats.avgPreMood !== null);
    assert.ok(moodStats.avgPostMood !== null);
    assert.ok(moodStats.moodShift > 0, 'Post mood was higher than pre mood in test data');
  });

  it('10. Focus & Stress analysis delivers paired metrics and grounded insights', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const analysis = calculateFocusStressAnalysis(currentSessions);

    assert.equal(analysis.pairedCount, 3);
    assert.equal(analysis.avgPreFocus, 5.0); // (5+4+6)/3 = 5.0
    assert.equal(analysis.avgPostFocus, 8.0); // (8+9+7)/3 = 8.0
    assert.equal(analysis.focusDelta, 3.0);
    assert.match(analysis.focusInsight, /\+3 points/);
    assert.match(analysis.stressInsight, /decreased by an average of 3 points/i);
  });

  it('11. Study consistency identifies best day, period totals, and streaks', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const consistency = calculateStudyConsistency(currentSessions, DATE_RANGES.WEEK);

    assert.ok(consistency.dayBuckets.length === 7);
    assert.ok(consistency.bestDay !== null);
    assert.ok(consistency.bestDayMinutes > 0);
    assert.equal(consistency.totalPeriodMins, 85);
  });

  it('12. Audio environment analysis aggregates by soundscape with sample sizes', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const audio = calculateAudioAnalysis(currentSessions);

    assert.equal(audio.mostUsed?.id, 'lofi', 'Lo-fi had 2 sessions, nature had 1');
    assert.equal(audio.mostUsed?.sessionCount, 2);
    assert.equal(audio.mostUsed?.totalMinutes, 70); // 25 + 45
    assert.equal(audio.bestFocusEnv?.id, 'lofi', 'Qualified with N=2 and highest focus gain');
  });

  it('13. Task distribution calculates task proportions accurately', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const tasks = calculateTaskDistribution(currentSessions);

    assert.equal(tasks.mostFrequentTask?.name, 'Coding', 'Coding had 60 mins (45 + 15)');
    assert.equal(tasks.mostFrequentTask?.totalMinutes, 60);
    assert.equal(tasks.totalMinutes, 85);
    // Percentage: 60/85 ≈ 71%
    assert.equal(tasks.mostFrequentTask?.percentage, 71);
  });

  it('14. Missing and invalid data handling behaves gracefully without NaN or errors', () => {
    const emptyStats = calculateOverviewStats([]);
    assert.equal(emptyStats.totalMins, 0);
    assert.equal(emptyStats.completedSessions, 0);
    assert.equal(emptyStats.avgFocus, null);
    assert.equal(emptyStats.avgStressReduction, null);
    assert.equal(emptyStats.avgFocusImprovement, null);
    assert.equal(emptyStats.hasPriorPeriod, false);

    const emptyMood = calculateMoodTrends([]);
    assert.equal(emptyMood.chartData.length, 0);
    assert.equal(emptyMood.avgPreMood, null);

    const emptyAudio = calculateAudioAnalysis([]);
    assert.equal(audioAnalysisIsEmpty(emptyAudio), true);

    function audioAnalysisIsEmpty(res) {
      return res.environmentList.length === 0 && res.mostUsed === null;
    }
  });

  it('15. Personal insights are deterministically traceable to user data', () => {
    const { currentSessions } = filterSessionsByRange(mockSessions, DATE_RANGES.WEEK, now);
    const insights = generatePersonalInsights(currentSessions, DATE_RANGES.WEEK);

    assert.ok(insights.length >= 3);
    assert.ok(insights.some((i) => i.id === 'best-day'));
    assert.ok(insights.some((i) => i.id === 'top-audio'));
    assert.ok(insights.some((i) => i.id === 'focus-gain'));
  });
});

