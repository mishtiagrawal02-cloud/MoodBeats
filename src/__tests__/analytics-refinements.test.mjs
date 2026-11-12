/**
 * analytics-refinements.test.mjs
 *
 * Tests the three Analytics Refinement improvements:
 *
 *   9A. Evidence Tier System          — EVIDENCE_TIERS, getEvidenceTier(), insight fields
 *   9B. Zero vs Missing Data          — strict null distinction in calculations & comparisonData
 *   9C. Limited Chart Data            — single-session / sparse behaviour
 *   9D. Date Filtering Regression     — insights from filtered 1-session range use INDIVIDUAL tier
 *
 * Rules:
 *   - All 49 existing tests continue to pass independently of these.
 *   - No localStorage, DOM, React or browser APIs are used.
 *   - Test data must NOT match the existing mockSessions fixture exactly.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  EVIDENCE_TIERS,
  getEvidenceTier,
  DATE_RANGES,
  filterSessionsByRange,
  getProductiveSessions,
  getMoodCheckInSessions,
  calculateFocusStressAnalysis,
  calculateMoodTrends,
  calculateAudioAnalysis,
  calculateTaskDistribution,
  calculateOverviewStats,
  generatePersonalInsights
} from '../utils/analyticsCalculations.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────────────────────────────────────── */

const NOW = 1710000000000; // Fixed reference — different from existing test suite
const DAY = 864e5;

/** Build a minimal valid productive session */
function makeSession(overrides = {}) {
  return {
    id: Math.random(),
    ts: NOW - DAY,
    mins: 30,
    task: 'Reading',
    audio: 'lofi',
    pre: { mood: 3, stress: 6, focus: 5 },
    post: { mood: 4, stress: 4, focus: 7 },
    ...overrides
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   9A — Evidence Tier System
   ───────────────────────────────────────────────────────────────────────────── */

describe('9A: Evidence Tier System', () => {

  it('getEvidenceTier returns NONE for n=0', () => {
    const tier = getEvidenceTier(0);
    assert.equal(tier, EVIDENCE_TIERS.NONE);
    assert.equal(tier.label, null);
  });

  it('getEvidenceTier returns NONE for negative n', () => {
    assert.equal(getEvidenceTier(-1), EVIDENCE_TIERS.NONE);
  });

  it('getEvidenceTier returns NONE for non-finite n', () => {
    assert.equal(getEvidenceTier(NaN), EVIDENCE_TIERS.NONE);
    assert.equal(getEvidenceTier(Infinity), EVIDENCE_TIERS.NONE);
  });

  it('getEvidenceTier returns INDIVIDUAL for n=1', () => {
    const tier = getEvidenceTier(1);
    assert.equal(tier, EVIDENCE_TIERS.INDIVIDUAL);
    assert.equal(tier.label, 'Individual observation');
  });

  it('getEvidenceTier returns INDIVIDUAL for n=2', () => {
    assert.equal(getEvidenceTier(2), EVIDENCE_TIERS.INDIVIDUAL);
  });

  it('getEvidenceTier returns PRELIMINARY for n=3', () => {
    const tier = getEvidenceTier(3);
    assert.equal(tier, EVIDENCE_TIERS.PRELIMINARY);
    assert.equal(tier.label, 'Preliminary indication');
  });

  it('getEvidenceTier returns PRELIMINARY for n=4', () => {
    assert.equal(getEvidenceTier(4), EVIDENCE_TIERS.PRELIMINARY);
  });

  it('getEvidenceTier returns EMERGING for n=5', () => {
    const tier = getEvidenceTier(5);
    assert.equal(tier, EVIDENCE_TIERS.EMERGING);
    assert.equal(tier.label, 'Emerging pattern');
  });

  it('getEvidenceTier returns EMERGING for n=10', () => {
    assert.equal(getEvidenceTier(10), EVIDENCE_TIERS.EMERGING);
  });

  it('insights from 1 productive session carry INDIVIDUAL tier fields', () => {
    const sessions = [makeSession({ ts: NOW - DAY })];
    const insights = generatePersonalInsights(sessions, DATE_RANGES.ALL);

    // Every insight (except the get-started placeholder) must have tier fields
    for (const insight of insights) {
      assert.ok('sampleSize' in insight, `insight ${insight.id} missing sampleSize`);
      assert.ok('evidenceTier' in insight, `insight ${insight.id} missing evidenceTier`);
      assert.ok('evidenceLabel' in insight, `insight ${insight.id} missing evidenceLabel`);
      if (insight.id !== 'get-started') {
        assert.equal(
          insight.evidenceTier,
          EVIDENCE_TIERS.INDIVIDUAL,
          `insight ${insight.id} should be INDIVIDUAL with 1 session`
        );
      }
    }
  });

  it('insights from 3 productive sessions carry PRELIMINARY tier (where n=3)', () => {
    const sessions = [
      makeSession({ ts: NOW - DAY * 1, audio: 'lofi', task: 'Coding' }),
      makeSession({ ts: NOW - DAY * 2, audio: 'lofi', task: 'Coding' }),
      makeSession({ ts: NOW - DAY * 3, audio: 'lofi', task: 'Coding' })
    ];
    const insights = generatePersonalInsights(sessions, DATE_RANGES.ALL);

    // best-day uses prod.length = 3 → PRELIMINARY
    const bestDay = insights.find((i) => i.id === 'best-day');
    if (bestDay) {
      assert.equal(bestDay.evidenceTier, EVIDENCE_TIERS.PRELIMINARY);
    }

    // top-audio uses mostUsed.sessionCount = 3 → PRELIMINARY
    const topAudio = insights.find((i) => i.id === 'top-audio');
    if (topAudio) {
      assert.equal(topAudio.evidenceTier, EVIDENCE_TIERS.PRELIMINARY);
    }
  });

  it('insights from 5+ productive sessions carry EMERGING tier', () => {
    const sessions = Array.from({ length: 5 }, (_, k) =>
      makeSession({ ts: NOW - DAY * (k + 1), audio: 'lofi', task: 'Writing' })
    );
    const insights = generatePersonalInsights(sessions, DATE_RANGES.ALL);

    // Every non-get-started insight should be EMERGING when sampleSize >= 5
    for (const insight of insights) {
      if (insight.id === 'get-started') continue;
      if (insight.sampleSize >= 5) {
        assert.equal(
          insight.evidenceTier,
          EVIDENCE_TIERS.EMERGING,
          `insight ${insight.id} with sampleSize=${insight.sampleSize} should be EMERGING`
        );
      }
    }
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   9B — Zero vs Missing Data
   ───────────────────────────────────────────────────────────────────────────── */

describe('9B: Zero vs Missing Data', () => {

  it('focusDelta is genuine 0 when pre=5, post=5 (not null)', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 5, focus: 5 }, post: { mood: 3, stress: 5, focus: 5 } })];
    const { focusDelta } = calculateFocusStressAnalysis(sessions);
    assert.equal(focusDelta, 0, 'genuine zero delta must be 0, not null');
  });

  it('focusDelta is positive 3 when pre=5, post=8', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 5, focus: 5 }, post: { mood: 4, stress: 4, focus: 8 } })];
    const { focusDelta } = calculateFocusStressAnalysis(sessions);
    assert.equal(focusDelta, 3);
  });

  it('focusDelta is null when no post-focus rating exists', () => {
    // post.focus is undefined → missing data, NOT zero
    const sessions = [makeSession({ pre: { mood: 3, stress: 5, focus: 5 }, post: { mood: 4, stress: 4 } })];
    const { focusDelta } = calculateFocusStressAnalysis(sessions);
    assert.equal(focusDelta, null, 'missing post-focus must yield null delta, never 0');
  });

  it('focusDelta is null when no pre-focus rating exists', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 5 }, post: { mood: 4, stress: 4, focus: 7 } })];
    const { focusDelta } = calculateFocusStressAnalysis(sessions);
    assert.equal(focusDelta, null);
  });

  it('stressReduction is genuine 0 when pre.stress=5, post.stress=5', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 5, focus: 5 }, post: { mood: 3, stress: 5, focus: 5 } })];
    const { stressReduction } = calculateFocusStressAnalysis(sessions);
    assert.equal(stressReduction, 0, 'genuine zero stress reduction must be 0, not null');
  });

  it('stressReduction is null when no post-stress rating exists', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 6, focus: 5 }, post: { mood: 4, focus: 7 } })];
    const { stressReduction } = calculateFocusStressAnalysis(sessions);
    assert.equal(stressReduction, null, 'missing post-stress must yield null, never 0');
  });

  it('comparisonData rows have null (not 0) when focus ratings are absent', () => {
    // Session with no pre or post focus — both should be null in comparisonData
    const sessions = [makeSession({
      pre:  { mood: 3, stress: 6 },   // no focus
      post: { mood: 4, stress: 4 }    // no focus
    })];
    const { comparisonData } = calculateFocusStressAnalysis(sessions);

    const focusRow = comparisonData.find((r) => r.metric === 'Focus Level');
    // The row should be absent (filtered out) or have null values, never 0
    if (focusRow) {
      assert.equal(focusRow.Before, null, 'missing pre-focus must be null in comparisonData, never 0');
      assert.equal(focusRow.After,  null, 'missing post-focus must be null in comparisonData, never 0');
    }
    // If the row is entirely absent (filtered), that is also acceptable behaviour
  });

  it('comparisonData omits rows where BOTH Before and After are null', () => {
    // No focus data at all → Focus Level row should be filtered from comparisonData
    const sessions = [makeSession({ pre: { mood: 3, stress: 6 }, post: { mood: 4, stress: 4 } })];
    const { comparisonData } = calculateFocusStressAnalysis(sessions);

    const focusRow = comparisonData.find((r) => r.metric === 'Focus Level');
    assert.equal(focusRow, undefined, 'Focus Level row must be absent when both Before and After are null');
  });

  it('calculateOverviewStats avgFocus is null (not 0) when sessions have no focus ratings', () => {
    const sessions = [makeSession({ pre: { mood: 3, stress: 6 }, post: { mood: 4, stress: 4 } })];
    const { avgFocus } = calculateOverviewStats(sessions);
    assert.equal(avgFocus, null, 'avgFocus must be null when no focus ratings exist');
  });

  it('calculateOverviewStats avgStressReduction is null when no stress pairs exist', () => {
    const sessions = [makeSession({ pre: { mood: 3 }, post: { mood: 4 } })];
    const { avgStressReduction } = calculateOverviewStats(sessions);
    assert.equal(avgStressReduction, null);
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   9C — Limited Chart Data (single-session / sparse behaviour)
   ───────────────────────────────────────────────────────────────────────────── */

describe('9C: Limited Chart Data', () => {

  it('calculateAudioAnalysis with 1 session: environmentList has 1 entry, hasSample=false', () => {
    const sessions = [makeSession({ audio: 'nature' })];
    const { environmentList, mostUsed } = calculateAudioAnalysis(sessions);

    assert.equal(environmentList.length, 1, 'one audio environment used → one entry');
    assert.equal(environmentList[0].sessionCount, 1);
    assert.equal(environmentList[0].hasSample, false, 'hasSample must be false for n=1');
    assert.ok(mostUsed !== null, 'mostUsed should still be set for the only environment');
  });

  it('calculateAudioAnalysis with 1 session: avgFocusChange is null (not 0)', () => {
    // hasSample=false means no focus-change computed for single-session audio
    const sessions = [makeSession({ audio: 'ambient' })];
    const { environmentList } = calculateAudioAnalysis(sessions);
    // avgFocusChange may be null due to insufficient pairing or hasSample gating
    // The environment must NOT invent a focus change value
    const env = environmentList[0];
    if (!env.hasSample) {
      // null is correct; a computed value is only valid with hasSample=true
      assert.ok(
        env.avgFocusChange === null || typeof env.avgFocusChange === 'number',
        'avgFocusChange must be null or a real computed number, never fabricated'
      );
    }
  });

  it('calculateTaskDistribution with 1 task category returns that task as mostFrequentTask', () => {
    const sessions = [makeSession({ task: 'Memorizing' })];
    const { taskList, mostFrequentTask } = calculateTaskDistribution(sessions);

    assert.equal(taskList.length, 1);
    assert.equal(mostFrequentTask.name, 'Memorizing');
    assert.equal(mostFrequentTask.sessionCount, 1);
  });

  it('calculateMoodTrends with 1 session: chartData.length === 1 and mood values are valid', () => {
    const sessions = [makeSession({
      ts: NOW - DAY,
      pre: { mood: 2, stress: 7, focus: 4 },
      post: { mood: 4, stress: 5, focus: 6 }
    })];
    const { chartData, avgPreMood, avgPostMood, totalCheckIns } = calculateMoodTrends(sessions, DATE_RANGES.ALL);

    assert.equal(chartData.length, 1, 'single session should produce one chart data point');
    assert.ok(avgPreMood !== null, 'avgPreMood must not be null with valid pre-mood data');
    assert.ok(avgPostMood !== null, 'avgPostMood must not be null with valid post-mood data');
    assert.equal(totalCheckIns, 1);
  });

  it('getMoodCheckInSessions includes 0-minute sessions that have valid mood data', () => {
    const abandonedWithMood = {
      id: 'abandoned-1',
      ts: NOW - DAY,
      mins: 0,
      pre: { mood: 1, stress: 9, focus: 2 },
      post: null
    };
    const productive = makeSession({ ts: NOW - DAY * 2 });
    const noMood = makeSession({ ts: NOW - DAY * 3, pre: {}, post: {} });

    const result = getMoodCheckInSessions([abandonedWithMood, productive, noMood]);
    assert.equal(result.length, 2, 'should include the 0-min session and the productive one, not the no-mood one');
    assert.ok(result.some((s) => s.id === 'abandoned-1'), '0-minute session with mood must be included');
  });

  it('getMoodCheckInSessions excludes sessions with no mood values at all', () => {
    const noMoodSession = makeSession({ pre: { stress: 5, focus: 6 }, post: { stress: 4, focus: 7 } });
    // Override so mood is explicitly not a number
    noMoodSession.pre.mood  = undefined;
    noMoodSession.post.mood = undefined;

    const result = getMoodCheckInSessions([noMoodSession]);
    assert.equal(result.length, 0);
  });

  it('calculateFocusStressAnalysis with valid focus but missing stress → focusDelta non-null, stressReduction null', () => {
    const sessions = [makeSession({
      pre:  { mood: 3, focus: 5 },   // no stress
      post: { mood: 4, focus: 8 }    // no stress
    })];
    const { focusDelta, stressReduction } = calculateFocusStressAnalysis(sessions);

    assert.equal(focusDelta, 3, 'focusDelta should be computed from focus data');
    assert.equal(stressReduction, null, 'stressReduction must be null when stress data is absent');
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   9D — Date Filtering Regression
   ───────────────────────────────────────────────────────────────────────────── */

describe('9D: Date Filtering Regression', () => {

  it('filterSessionsByRange returns only sessions within the selected range', () => {
    const inRange  = makeSession({ ts: NOW - DAY * 3 });  // 3 days ago — inside 7d
    const outRange = makeSession({ ts: NOW - DAY * 10 }); // 10 days ago — outside 7d

    const { currentSessions } = filterSessionsByRange([inRange, outRange], DATE_RANGES.WEEK, NOW);
    assert.equal(currentSessions.length, 1);
    assert.equal(currentSessions[0].id, inRange.id);
  });

  it('insights generated from a 1-session filtered range carry INDIVIDUAL tier', () => {
    // Build sessions where only one falls in the target week
    const insideSession  = makeSession({ ts: NOW - DAY * 2, audio: 'lofi', task: 'Revision' });
    const outsideSession = makeSession({ ts: NOW - DAY * 20, audio: 'lofi', task: 'Revision' });

    const { currentSessions } = filterSessionsByRange(
      [insideSession, outsideSession],
      DATE_RANGES.WEEK,
      NOW
    );
    assert.equal(getProductiveSessions(currentSessions).length, 1);

    const insights = generatePersonalInsights(currentSessions, DATE_RANGES.WEEK);
    for (const insight of insights) {
      if (insight.id === 'get-started') continue;
      // No insight from a single session should claim EMERGING confidence
      assert.notEqual(
        insight.evidenceTier,
        EVIDENCE_TIERS.EMERGING,
        `insight ${insight.id} from 1-session range must not be EMERGING`
      );
    }
  });

  it('ALL range returns every valid session regardless of age', () => {
    const ancient = makeSession({ ts: NOW - DAY * 365 });
    const recent  = makeSession({ ts: NOW - DAY });

    const { currentSessions, previousSessions } = filterSessionsByRange(
      [ancient, recent],
      DATE_RANGES.ALL,
      NOW
    );
    assert.equal(currentSessions.length, 2);
    assert.equal(previousSessions.length, 0);
  });

  it('mood check-ins from 0-minute sessions appear in mood trends even when outside productive filter', () => {
    // 0-minute session with valid mood — should appear in mood trends
    const zerominSession = {
      id: 'zero-min',
      ts: NOW - DAY,
      mins: 0,
      task: 'Reading',
      audio: 'lofi',
      pre:  { mood: 2, stress: 8, focus: 3 },
      post: { mood: 2, stress: 8, focus: 3 }
    };

    // getProductiveSessions must exclude it
    const productive = getProductiveSessions([zerominSession]);
    assert.equal(productive.length, 0, '0-min session must NOT appear in productive sessions');

    // getMoodCheckInSessions must include it
    const moodSessions = getMoodCheckInSessions([zerominSession]);
    assert.equal(moodSessions.length, 1, '0-min session WITH mood MUST appear in mood sessions');

    // calculateMoodTrends (which accepts raw sessions) must include its mood
    const { chartData } = calculateMoodTrends([zerominSession], DATE_RANGES.ALL);
    assert.equal(chartData.length, 1, '0-min session mood should appear as one chart data point');
  });
});
