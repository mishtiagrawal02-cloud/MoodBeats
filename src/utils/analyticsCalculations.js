/**
 * MoodBeats Analytics Calculations Utility
 * 
 * Pure, deterministic functions for computing personal study analytics.
 * Strictly adheres to data integrity rules:
 * - 0-minute sessions are excluded from productivity metrics.
 * - Abandoned sessions are excluded.
 * - Missing values are handled without treating them as 0.
 * - Does not invent percentage improvements or unsupported causal claims.
 */

import { AUDIO } from './constants.js';

export const DATE_RANGES = {
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  ALL: 'all'
};

/**
 * Evidence Tier System
 *
 * Each insight declares its own relevant sample size (not total sessions).
 * Evidence tier is attached to the insight so the UI can render it appropriately.
 *
 * NONE       : n <= 0 — no insight generated
 * INDIVIDUAL : n 1–2  — single or pair observation; no generalisation
 * PRELIMINARY: n 3–4  — early indication; treat with caution
 * EMERGING   : n >= 5 — pattern emerging from repeated data
 */
export const EVIDENCE_TIERS = {
  NONE:        { label: null },
  INDIVIDUAL:  { label: 'Individual observation' },
  PRELIMINARY: { label: 'Preliminary indication' },
  EMERGING:    { label: 'Emerging pattern' }
};

/**
 * Returns the appropriate evidence tier for a given sample count.
 * @param {number} n - Number of relevant data points for this specific insight
 * @returns {object} One of the EVIDENCE_TIERS values
 */
export function getEvidenceTier(n) {
  if (!Number.isFinite(n) || n <= 0) return EVIDENCE_TIERS.NONE;
  if (n <= 2) return EVIDENCE_TIERS.INDIVIDUAL;
  if (n <= 4) return EVIDENCE_TIERS.PRELIMINARY;
  return EVIDENCE_TIERS.EMERGING;
}

export const MOOD_SCALE = [
  { value: 1, label: 'Very Low', emoji: '😞' },
  { value: 2, label: 'Low', emoji: '😕' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 5, label: 'Excellent', emoji: '😄' }
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FULL_DAY_NAMES = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};

function fullDayName(shortName) {
  return FULL_DAY_NAMES[shortName] || shortName;
}

/** Focus and stress sliders are 1–10. Zero is not a valid rating on that scale. */
function isScaleRating(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 10;
}

/** Mood check-ins use the 1–5 scale. Out-of-range numbers are not observations. */
function isMoodRating(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5;
}

function roundedMean(values) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

/** A saved soundscape id, including explicit Silence ("none"). Blank values are missing. */
function isRecordedAudioId(audio) {
  return typeof audio === 'string' && audio.trim() !== '';
}

function recordedTaskName(task) {
  if (typeof task !== 'string') return null;
  const trimmed = task.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === 'problem solving') return 'Problem Solving';
  return trimmed;
}

/**
 * Integer percentages that sum to 100. Largest fractional remainders
 * receive the leftover points so rounded slices do not total 99 or 101.
 */
function percentagesOfTotal(amounts) {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total <= 0) return amounts.map(() => 0);

  const raw = amounts.map((amount) => (amount / total) * 100);
  const base = raw.map((amount) => Math.floor(amount));
  let leftover = 100 - base.reduce((sum, amount) => sum + amount, 0);
  const ranked = raw
    .map((amount, index) => ({ index, fraction: amount - Math.floor(amount) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let i = 0; i < ranked.length && leftover > 0; i += 1) {
    base[ranked[i].index] += 1;
    leftover -= 1;
  }

  return base;
}

/**
 * Validates whether a timestamp is a valid date
 */
export function isValidDate(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  return !isNaN(d.getTime());
}

/**
 * Filter sessions by date range and returns current + previous comparison period
 */
export function filterSessionsByRange(sessions, range = DATE_RANGES.WEEK, referenceTime = Date.now()) {
  const list = Array.isArray(sessions) ? sessions : [];
  const validList = list.filter((s) => s && isValidDate(s.ts));

  let days = 7;
  if (range === DATE_RANGES.MONTH) days = 30;
  if (range === DATE_RANGES.QUARTER) days = 90;
  if (range === DATE_RANGES.ALL) {
    return {
      currentSessions: validList,
      previousSessions: [],
      days: null,
      range
    };
  }

  const rangeMs = days * 864e5;
  const startCurrent = referenceTime - rangeMs;
  const startPrevious = referenceTime - rangeMs * 2;

  const currentSessions = validList.filter((s) => s.ts >= startCurrent && s.ts <= referenceTime);
  const previousSessions = validList.filter((s) => s.ts >= startPrevious && s.ts < startCurrent);

  return {
    currentSessions,
    previousSessions,
    days,
    range
  };
}

/**
 * Filters sessions with actual, genuine study time (mins > 0).
 * Excludes abandoned sessions and zero-minute terminations.
 */
export function getProductiveSessions(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  return list.filter((s) => {
    const mins = Number(s?.mins);
    return Number.isFinite(mins) && mins > 0 && isValidDate(s?.ts);
  });
}

/**
 * Formats minutes into human-readable hours and minutes string
 * e.g. 135 -> "2h 15m", 45 -> "45m", 0 -> "0m"
 */
export function formatMinutesHuman(totalMinutes) {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (mins === 0) return '0m';
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

/**
 * Overview statistics calculation
 */
export function calculateOverviewStats(currentSessions, previousSessions = []) {
  const currentProd = getProductiveSessions(currentSessions);
  const prevProd = getProductiveSessions(previousSessions);

  // 1. Total Study Time
  const totalMins = currentProd.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);
  const prevTotalMins = prevProd.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);

  // 2. Completed Sessions Count
  const completedSessions = currentProd.length;
  const prevCompletedSessions = prevProd.length;

  // 3. Average Focus Level (1-10)
  // Prefer a valid post-study rating. An invalid or missing post rating
  // falls back to pre-study. It is never coerced to 0.
  const focusRatings = currentProd
    .map((s) => (isScaleRating(s?.post?.focus) ? s.post.focus : s?.pre?.focus))
    .filter((f) => isScaleRating(f));
  const avgFocus = focusRatings.length > 0
    ? Math.round((focusRatings.reduce((a, b) => a + b, 0) / focusRatings.length) * 10) / 10
    : null;

  // 4. Average Stress Reduction (pre.stress - post.stress)
  // Only valid when BOTH pre and post stress are present
  const stressDiffs = currentProd
    .filter((s) => isScaleRating(s?.pre?.stress) && isScaleRating(s?.post?.stress))
    .map((s) => s.pre.stress - s.post.stress); // positive = stress reduced
  const avgStressReduction = stressDiffs.length > 0
    ? Math.round((stressDiffs.reduce((a, b) => a + b, 0) / stressDiffs.length) * 10) / 10
    : null;

  // 5. Average Focus Improvement (post.focus - pre.focus)
  // Only valid when BOTH pre and post focus are present
  const focusDiffs = currentProd
    .filter((s) => isScaleRating(s?.pre?.focus) && isScaleRating(s?.post?.focus))
    .map((s) => s.post.focus - s.pre.focus); // positive = focus improved
  const avgFocusImprovement = focusDiffs.length > 0
    ? Math.round((focusDiffs.reduce((a, b) => a + b, 0) / focusDiffs.length) * 10) / 10
    : null;

  // Comparison Indicators (actual differences, never invented percentages)
  let diffTimeMinutes = null;
  let diffSessions = null;
  if (previousSessions && previousSessions.length > 0) {
    diffTimeMinutes = totalMins - prevTotalMins;
    diffSessions = completedSessions - prevCompletedSessions;
  }

  return {
    totalMins,
    totalTimeFormatted: formatMinutesHuman(totalMins),
    completedSessions,
    avgFocus,
    avgStressReduction,
    avgFocusImprovement,
    diffTimeMinutes,
    diffSessions,
    hasPriorPeriod: Boolean(previousSessions && previousSessions.length > 0)
  };
}

/**
 * Returns sessions that have at least one valid mood check-in (pre or post),
 * regardless of study duration. This deliberately includes 0-minute sessions
 * because mood data recorded during an abandoned session is still valid
 * qualitative information — it just shouldn't contribute to productivity metrics.
 *
 * Use this when you need a mood dataset, NOT getProductiveSessions.
 */
export function getMoodCheckInSessions(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  return list.filter(
    (s) => s && isValidDate(s.ts) &&
      (isMoodRating(s?.pre?.mood) || isMoodRating(s?.post?.mood))
  );
}

/**
 * True when Analytics has something real to show: productive study time,
 * or a valid mood check-in (including a check-in on a 0-minute session).
 */
export function hasRecordedAnalyticsData(sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  return getProductiveSessions(list).length > 0 || getMoodCheckInSessions(list).length > 0;
}

/**
 * Mood Trends Calculation over time.
 *
 * NOTE: Intentionally accepts ALL sessions with valid mood data, not just
 * productive sessions. A user who starts a check-in but abandons the session
 * still generated a genuine mood observation that belongs in mood analytics.
 * Filtering to productive sessions only would silently lose that history.
 */
export function calculateMoodTrends(sessions, range = DATE_RANGES.WEEK) {
  const valid = (Array.isArray(sessions) ? sessions : []).filter(
    (s) => s && isValidDate(s.ts) && (isMoodRating(s?.pre?.mood) || isMoodRating(s?.post?.mood))
  );

  if (valid.length === 0) {
    return {
      chartData: [],
      avgPreMood: null,
      avgPostMood: null,
      moodShift: null,
      totalCheckIns: 0
    };
  }

  // Sort chronologically
  const sorted = [...valid].sort((a, b) => a.ts - b.ts);

  // Grouping strategy:
  // For '7d' & '30d': group by local day date
  // For '90d' & 'all': group by week or month
  const groupByDay = range === DATE_RANGES.WEEK || range === DATE_RANGES.MONTH;
  const groups = new Map();

  sorted.forEach((s) => {
    const d = new Date(s.ts);
    let key;
    let label;

    if (groupByDay) {
      key = d.toDateString();
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // Group by week (start of week)
      const startOfWeek = new Date(d);
      const dayIndex = (d.getDay() + 6) % 7; // Monday = 0
      startOfWeek.setDate(d.getDate() - dayIndex);
      key = startOfWeek.toDateString();
      label = `Wk of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        dateLabel: label,
        timestamp: s.ts,
        preMoods: [],
        postMoods: [],
        sessionCount: 0
      });
    }

    const group = groups.get(key);
    group.sessionCount += 1;
    if (isMoodRating(s?.pre?.mood)) {
      group.preMoods.push(s.pre.mood);
    }
    if (isMoodRating(s?.post?.mood)) {
      group.postMoods.push(s.post.mood);
    }
  });

  const chartData = Array.from(groups.values()).map((g) => {
    const preAvg = g.preMoods.length > 0
      ? Math.round((g.preMoods.reduce((a, b) => a + b, 0) / g.preMoods.length) * 10) / 10
      : null;
    const postAvg = g.postMoods.length > 0
      ? Math.round((g.postMoods.reduce((a, b) => a + b, 0) / g.postMoods.length) * 10) / 10
      : null;

    return {
      date: g.dateLabel,
      timestamp: g.timestamp,
      preMood: preAvg,
      postMood: postAvg,
      sessions: g.sessionCount
    };
  });

  // Overall averages across valid entries
  const allPre = valid.map((s) => s?.pre?.mood).filter((m) => isMoodRating(m));
  const allPost = valid.map((s) => s?.post?.mood).filter((m) => isMoodRating(m));

  const avgPreMood = allPre.length > 0
    ? Math.round((allPre.reduce((a, b) => a + b, 0) / allPre.length) * 10) / 10
    : null;
  const avgPostMood = allPost.length > 0
    ? Math.round((allPost.reduce((a, b) => a + b, 0) / allPost.length) * 10) / 10
    : null;

  const moodShift = avgPreMood !== null && avgPostMood !== null
    ? Math.round((avgPostMood - avgPreMood) * 10) / 10
    : null;

  return {
    chartData,
    avgPreMood,
    avgPostMood,
    moodShift,
    totalCheckIns: valid.length
  };
}

/**
 * Focus & Stress Before vs After Analysis
 */
export function calculateFocusStressAnalysis(sessions) {
  const prod = getProductiveSessions(sessions);

  // Focus pairs and stress pairs are independent. A missing stress rating
  // must not drop a valid focus pair, and the reverse is also true.
  // Averages use only sessions that have both sides of THAT metric, so an
  // unpaired pre-study rating cannot invent a before/after difference.
  const focusPairs = prod.filter(
    (s) => isScaleRating(s?.pre?.focus) && isScaleRating(s?.post?.focus)
  );
  const stressPairs = prod.filter(
    (s) => isScaleRating(s?.pre?.stress) && isScaleRating(s?.post?.stress)
  );

  const avgPreFocus = roundedMean(focusPairs.map((s) => s.pre.focus));
  const avgPostFocus = roundedMean(focusPairs.map((s) => s.post.focus));
  const avgPreStress = roundedMean(stressPairs.map((s) => s.pre.stress));
  const avgPostStress = roundedMean(stressPairs.map((s) => s.post.stress));

  const focusDelta = avgPreFocus !== null && avgPostFocus !== null
    ? Math.round((avgPostFocus - avgPreFocus) * 10) / 10
    : null;
  const stressReduction = avgPreStress !== null && avgPostStress !== null
    ? Math.round((avgPreStress - avgPostStress) * 10) / 10
    : null;

  const pairedCount = focusPairs.length;
  const stressPairedCount = stressPairs.length;

  let focusInsight = 'Log sessions to observe how studying impacts your focus.';
  let stressInsight = 'Log sessions to monitor shifts in your study stress.';

  if (pairedCount >= 2 && focusDelta !== null) {
    if (focusDelta > 0) {
      focusInsight = `Your average focus increased by +${focusDelta} points across ${pairedCount} completed sessions.`;
    } else if (focusDelta < 0) {
      focusInsight = `Your average focus decreased by ${Math.abs(focusDelta)} points across ${pairedCount} completed sessions.`;
    } else {
      focusInsight = `Your focus remained steady before and after study sessions across ${pairedCount} sessions.`;
    }
  } else if (pairedCount === 1 && focusDelta !== null) {
    if (focusDelta > 0) {
      focusInsight = `In your recorded session, focus was +${focusDelta} points higher after studying.`;
    } else if (focusDelta < 0) {
      focusInsight = `In your recorded session, focus was ${Math.abs(focusDelta)} points lower after studying.`;
    } else {
      focusInsight = `In your recorded session, focus was unchanged after studying.`;
    }
  }

  if (stressPairedCount >= 2 && stressReduction !== null) {
    if (stressReduction > 0) {
      stressInsight = `Stress levels decreased by an average of ${stressReduction} points after studying.`;
    } else if (stressReduction < 0) {
      stressInsight = `Stress increased by an average of ${Math.abs(stressReduction)} points during sessions.`;
    } else {
      stressInsight = `Your stress levels remained stable before and after study blocks.`;
    }
  } else if (stressPairedCount === 1 && stressReduction !== null) {
    if (stressReduction > 0) {
      stressInsight = `In your recorded session, stress was ${stressReduction} points lower after studying.`;
    } else if (stressReduction < 0) {
      stressInsight = `In your recorded session, stress was ${Math.abs(stressReduction)} points higher after studying.`;
    } else {
      stressInsight = `In your recorded session, stress was unchanged after studying.`;
    }
  }

  // Chart data formatted for Recharts comparison.
  // IMPORTANT: null values are preserved as null — never coerced to 0.
  // FocusStressChart filters out entries where both Before and After are null
  // before passing to Recharts so that missing data is never rendered as a
  // zero-height bar.
  const rawComparisonData = [
    {
      metric: 'Focus Level',
      Before: avgPreFocus,   // null when no pre-focus ratings exist
      After: avgPostFocus,   // null when no post-focus ratings exist
      delta: focusDelta
    },
    {
      metric: 'Stress Level',
      Before: avgPreStress,  // null when no pre-stress ratings exist
      After: avgPostStress,  // null when no post-stress ratings exist
      delta: stressReduction !== null ? -stressReduction : null // visually lower is better
    }
  ];

  // Only include rows where at least one value is non-null so the chart never
  // renders a fully-absent metric as a pair of zero-height bars.
  const comparisonData = rawComparisonData.filter(
    (row) => row.Before !== null || row.After !== null
  );

  return {
    avgPreFocus,
    avgPostFocus,
    avgPreStress,
    avgPostStress,
    focusDelta,
    stressReduction,
    pairedCount,
    stressPairedCount,
    focusInsight,
    stressInsight,
    comparisonData
  };
}

/**
 * Study Consistency and Weekly Activity Pattern
 */
export function calculateStudyConsistency(sessions, _range = DATE_RANGES.WEEK) {
  const prod = getProductiveSessions(sessions);

  // Group by day of week: Mon (0) to Sun (6)
  const dayBuckets = [
    { day: 'Mon', index: 0, minutes: 0, sessions: 0 },
    { day: 'Tue', index: 1, minutes: 0, sessions: 0 },
    { day: 'Wed', index: 2, minutes: 0, sessions: 0 },
    { day: 'Thu', index: 3, minutes: 0, sessions: 0 },
    { day: 'Fri', index: 4, minutes: 0, sessions: 0 },
    { day: 'Sat', index: 5, minutes: 0, sessions: 0 },
    { day: 'Sun', index: 6, minutes: 0, sessions: 0 }
  ];

  prod.forEach((s) => {
    const d = new Date(s.ts);
    // JS getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
    const jsDay = d.getDay();
    const monIndex = (jsDay + 6) % 7;
    dayBuckets[monIndex].minutes += Number(s.mins) || 0;
    dayBuckets[monIndex].sessions += 1;
  });

  // Identify most productive day
  let bestDay = null;
  let maxMins = 0;
  dayBuckets.forEach((b) => {
    if (b.minutes > maxMins) {
      maxMins = b.minutes;
      bestDay = b.day;
    }
  });

  // Streak length is a count of consecutive calendar days.
  // streakSessionCount is the number of productive sessions on those days.
  // Several sessions can fall on one streak day, so the two counts are not interchangeable.
  let streak = 0;
  let streakSessionCount = 0;
  if (prod.length > 0) {
    const sessionsByDay = new Map();
    prod.forEach((s) => {
      const key = new Date(s.ts).toDateString();
      sessionsByDay.set(key, (sessionsByDay.get(key) || 0) + 1);
    });
    const d = new Date();
    // If the user has not studied yet today, the active streak still includes yesterday.
    if (!sessionsByDay.has(d.toDateString())) {
      d.setDate(d.getDate() - 1);
    }
    while (sessionsByDay.has(d.toDateString())) {
      streak += 1;
      streakSessionCount += sessionsByDay.get(d.toDateString());
      d.setDate(d.getDate() - 1);
    }
  }

  const totalPeriodMins = prod.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);

  return {
    dayBuckets,
    bestDay: maxMins > 0 ? bestDay : null,
    bestDayMinutes: maxMins,
    totalPeriodMins,
    totalPeriodFormatted: formatMinutesHuman(totalPeriodMins),
    totalCompletedSessions: prod.length,
    streak,
    streakSessionCount
  };
}

/**
 * Audio Environment Analysis
 */
export function calculateAudioAnalysis(sessions) {
  const prod = getProductiveSessions(sessions);

  const envMap = {};
  AUDIO.forEach((a) => {
    envMap[a.id] = {
      id: a.id,
      name: a.n,
      icon: a.icon,
      color: a.c,
      sessionCount: 0,
      totalMinutes: 0,
      focusDeltas: [],
      stressDeltas: []
    };
  });

  prod.forEach((s) => {
    if (!isRecordedAudioId(s.audio)) return;
    const audioId = s.audio.trim();
    if (!envMap[audioId]) {
      envMap[audioId] = {
        id: audioId,
        name: audioId,
        icon: '🎵',
        color: '#8B35FF',
        sessionCount: 0,
        totalMinutes: 0,
        focusDeltas: [],
        stressDeltas: []
      };
    }

    const env = envMap[audioId];
    env.sessionCount += 1;
    env.totalMinutes += Number(s.mins) || 0;

    if (isScaleRating(s?.pre?.focus) && isScaleRating(s?.post?.focus)) {
      env.focusDeltas.push(s.post.focus - s.pre.focus);
    }
    if (isScaleRating(s?.pre?.stress) && isScaleRating(s?.post?.stress)) {
      env.stressDeltas.push(s.pre.stress - s.post.stress); // positive = stress reduced
    }
  });

  const environmentList = Object.values(envMap)
    .filter((e) => e.sessionCount > 0)
    .map((e) => {
      const avgFocusChange = e.focusDeltas.length > 0
        ? Math.round((e.focusDeltas.reduce((a, b) => a + b, 0) / e.focusDeltas.length) * 10) / 10
        : null;
      const avgStressReduction = e.stressDeltas.length > 0
        ? Math.round((e.stressDeltas.reduce((a, b) => a + b, 0) / e.stressDeltas.length) * 10) / 10
        : null;

      return {
        id: e.id,
        name: e.name,
        icon: e.icon,
        color: e.color,
        sessionCount: e.sessionCount,
        totalMinutes: e.totalMinutes,
        formattedMinutes: formatMinutesHuman(e.totalMinutes),
        avgFocusChange,
        avgStressReduction,
        hasSample: e.sessionCount >= 2
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Identify most frequently used
  const mostUsed = environmentList.length > 0 ? environmentList[0] : null;

  // Identify environment associated with best focus (only consider N >= 2)
  const qualifiedForFocus = environmentList.filter((e) => e.sessionCount >= 2 && e.avgFocusChange !== null);
  const bestFocusEnv = qualifiedForFocus.length > 0
    ? [...qualifiedForFocus].sort((a, b) => b.avgFocusChange - a.avgFocusChange)[0]
    : null;

  return {
    environmentList,
    mostUsed,
    bestFocusEnv,
    totalAudioSessions: environmentList.reduce((sum, env) => sum + env.sessionCount, 0)
  };
}

/**
 * Task Distribution Analysis
 */
export function calculateTaskDistribution(sessions) {
  const prod = getProductiveSessions(sessions);

  const taskMap = {};

  prod.forEach((s) => {
    const taskName = recordedTaskName(s.task);
    if (!taskName) return;

    if (!taskMap[taskName]) {
      taskMap[taskName] = {
        name: taskName,
        sessionCount: 0,
        totalMinutes: 0,
        focusDeltas: []
      };
    }

    const t = taskMap[taskName];
    t.sessionCount += 1;
    t.totalMinutes += Number(s.mins) || 0;

    if (isScaleRating(s?.pre?.focus) && isScaleRating(s?.post?.focus)) {
      t.focusDeltas.push(s.post.focus - s.pre.focus);
    }
  });

  const taskValues = Object.values(taskMap);
  const totalTimeAll = taskValues.reduce((acc, t) => acc + t.totalMinutes, 0);
  const percentages = percentagesOfTotal(taskValues.map((t) => t.totalMinutes));

  const taskList = taskValues
    .map((t, index) => {
      const avgFocusChange = t.focusDeltas.length > 0
        ? Math.round((t.focusDeltas.reduce((a, b) => a + b, 0) / t.focusDeltas.length) * 10) / 10
        : null;
      const percentage = percentages[index];

      return {
        name: t.name,
        sessionCount: t.sessionCount,
        totalMinutes: t.totalMinutes,
        formattedMinutes: formatMinutesHuman(t.totalMinutes),
        percentage,
        avgFocusChange,
        hasSample: t.sessionCount >= 2
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const mostFrequentTask = taskList.length > 0 ? taskList[0] : null;

  return {
    taskList,
    mostFrequentTask,
    totalTasksCount: taskList.length,
    totalMinutes: totalTimeAll
  };
}

/**
 * Deterministic Personal Insights Generator
 *
 * Generates grounded, evidence-calibrated observations from actual study data.
 *
 * Each insight:
 * - Declares its own relevant sample size (not total sessions).
 * - Receives an evidence tier from getEvidenceTier() based on that sample size.
 * - Uses language appropriate to the tier so single-session observations are
 *   never phrased as established patterns.
 *
 * Fields added to each insight object:
 *   sampleSize    {number}       — number of relevant data points for THIS insight
 *   evidenceTier  {object}       — one of EVIDENCE_TIERS values
 *   evidenceLabel {string|null}  — human-readable tier label, or null for NONE
 */
export function generatePersonalInsights(sessions, range = DATE_RANGES.WEEK) {
  const prod = getProductiveSessions(sessions);
  const insights = [];

  if (prod.length === 0) {
    return [
      {
        id: 'get-started',
        icon: 'fas fa-sparkles',
        title: 'Unlock Your First Insight',
        desc: 'Complete your first study block to start measuring your baseline focus and stress patterns.',
        type: 'neutral',
        sampleSize: 0,
        evidenceTier: EVIDENCE_TIERS.NONE,
        evidenceLabel: null
      }
    ];
  }

  // ── 1. Peak Productivity Day ────────────────────────────────────────────────
  // Sample = all productive sessions (more sessions → clearer best-day pattern)
  const consistency = calculateStudyConsistency(prod, range);
  if (consistency.bestDay && consistency.bestDayMinutes > 0) {
    const n = prod.length;
    const tier = getEvidenceTier(n);
    const dayName = fullDayName(consistency.bestDay);
    const studied = formatMinutesHuman(consistency.bestDayMinutes);
    let desc;
    if (n === 1) {
      desc = `Your recorded session took place on ${dayName}.`;
    } else if (n <= 2) {
      desc = `${dayName} has the highest recorded study time so far (${studied}).`;
    } else if (n <= 4) {
      desc = `Early indication: ${dayName} has the highest recorded study activity (${studied}).`;
    } else {
      desc = `${dayName} is your most active study day in this period (${studied} studied).`;
    }
    insights.push({
      id: 'best-day',
      icon: 'fas fa-calendar-star',
      title: 'Peak Productivity Day',
      desc,
      type: 'positive',
      sampleSize: n,
      evidenceTier: tier,
      evidenceLabel: tier.label
    });
  }

  // ── 2. Preferred Audio Environment ─────────────────────────────────────────
  // Sample = sessions using the most-used soundscape (not all sessions)
  const audioStats = calculateAudioAnalysis(prod);
  if (audioStats.mostUsed) {
    const n = audioStats.mostUsed.sessionCount;
    const tier = getEvidenceTier(n);
    const env = audioStats.mostUsed;
    const focusNote = env.avgFocusChange !== null
      ? ` associated with a ${env.avgFocusChange >= 0 ? `+${env.avgFocusChange}` : env.avgFocusChange} focus shift`
      : '';
    let desc;
    if (n === 1) {
      desc = `${env.icon} ${env.name} was used in your recorded session (${env.formattedMinutes}).`;
    } else if (n <= 2) {
      desc = `${env.icon} ${env.name} has been your most used soundscape in ${n} sessions (${env.formattedMinutes}).`;
    } else if (n <= 4) {
      desc = `Preliminary trend: ${env.icon} ${env.name} is currently your most-used soundscape (${n} sessions, ${env.formattedMinutes})${focusNote}.`;
    } else {
      desc = `${env.icon} ${env.name} is your most frequently used soundscape (${n} sessions, ${env.formattedMinutes})${focusNote}.`;
    }
    insights.push({
      id: 'top-audio',
      icon: 'fas fa-headphones-simple',
      title: 'Preferred Audio Environment',
      desc,
      type: 'accent',
      sampleSize: n,
      evidenceTier: tier,
      evidenceLabel: tier.label
    });
  }

  // ── 3. Focus Improvement ────────────────────────────────────────────────────
  // Sample = pairedCount (sessions with BOTH pre- and post-focus ratings)
  const focusStress = calculateFocusStressAnalysis(prod);
  if (focusStress.focusDelta !== null && focusStress.pairedCount >= 1) {
    const n = focusStress.pairedCount;
    const tier = getEvidenceTier(n);
    if (focusStress.focusDelta > 0) {
      let desc;
      if (n === 1) {
        desc = `In your recorded session, focus was +${focusStress.focusDelta} points higher after studying.`;
      } else if (n <= 2) {
        desc = `Across ${n} sessions, focus was on average +${focusStress.focusDelta} points higher after studying.`;
      } else if (n <= 4) {
        desc = `Preliminary indication: focus has increased by an average of +${focusStress.focusDelta} points across ${n} sessions.`;
      } else {
        desc = `Your self-rated focus increases by an average of +${focusStress.focusDelta} points across ${n} completed sessions.`;
      }
      insights.push({
        id: 'focus-gain',
        icon: 'fas fa-brain',
        title: 'Measurable Focus Gain',
        desc,
        type: 'positive',
        sampleSize: n,
        evidenceTier: tier,
        evidenceLabel: tier.label
      });
    } else if (focusStress.focusDelta === 0 && n >= 2) {
      insights.push({
        id: 'focus-steady',
        icon: 'fas fa-brain',
        title: 'Consistent Focus Baseline',
        desc: `Your focus levels remained steady and resilient throughout your study intervals (${n} sessions).`,
        type: 'neutral',
        sampleSize: n,
        evidenceTier: tier,
        evidenceLabel: tier.label
      });
    }
  }

  // ── 4. Stress Relief ────────────────────────────────────────────────────────
  // Sample = stressPairedCount (sessions with BOTH pre- and post-stress ratings),
  // independent of focus pairing. A user may record stress consistently but
  // focus inconsistently — the two datasets are separate.
  if (focusStress.stressReduction !== null && focusStress.stressPairedCount >= 1 && focusStress.stressReduction > 0) {
    const n = focusStress.stressPairedCount;
    const tier = getEvidenceTier(n);
    let desc;
    if (n === 1) {
      desc = `In your recorded session, stress was ${focusStress.stressReduction} points lower after studying.`;
    } else if (n <= 2) {
      desc = `Across ${n} sessions, stress was on average ${focusStress.stressReduction} points lower after studying.`;
    } else if (n <= 4) {
      desc = `Preliminary indication: study blocks are associated with an average stress drop of ${focusStress.stressReduction} points.`;
    } else {
      desc = `Study blocks are consistently associated with an average stress reduction of ${focusStress.stressReduction} points.`;
    }
    insights.push({
      id: 'stress-relief',
      icon: 'fas fa-heart-pulse',
      title: 'Active Stress Relief',
      desc,
      type: 'positive',
      sampleSize: n,
      evidenceTier: tier,
      evidenceLabel: tier.label
    });
  }

  // ── 5. Primary Study Task ───────────────────────────────────────────────────
  // Sample = sessions using the most-frequent task (not all sessions)
  const tasks = calculateTaskDistribution(prod);
  if (tasks.mostFrequentTask) {
    const n = tasks.mostFrequentTask.sessionCount;
    const tier = getEvidenceTier(n);
    let desc;
    if (n === 1) {
      desc = `${tasks.mostFrequentTask.name} was your recorded study task (${tasks.mostFrequentTask.formattedMinutes}).`;
    } else if (n <= 2) {
      desc = `${tasks.mostFrequentTask.name} has been your most logged task so far (${n} sessions, ${tasks.mostFrequentTask.formattedMinutes}).`;
    } else if (n <= 4) {
      desc = `${tasks.mostFrequentTask.name} is emerging as your primary focus area (${tasks.mostFrequentTask.percentage}% of recorded study time).`;
    } else {
      desc = `${tasks.mostFrequentTask.name} is your primary study focus, accounting for ${tasks.mostFrequentTask.percentage}% of study time (${tasks.mostFrequentTask.formattedMinutes}).`;
    }
    insights.push({
      id: 'primary-task',
      icon: 'fas fa-book-bookmark',
      title: 'Primary Study Focus',
      desc,
      type: 'neutral',
      sampleSize: n,
      evidenceTier: tier,
      evidenceLabel: tier.label
    });
  }

  // ── 6. Study streak ─────────────────────────────────────────────────────────
  // Evidence uses the sessions recorded on the streak days.
  // The day count is reported separately and is not the sample size.
  if (consistency.streak > 1 && consistency.streakSessionCount > 0) {
    const dayCount = consistency.streak;
    const observations = consistency.streakSessionCount;
    const tier = getEvidenceTier(observations);
    const sessionWord = observations === 1 ? 'session' : 'sessions';
    insights.push({
      id: 'streak',
      icon: 'fas fa-fire',
      title: 'Study Streak',
      desc: `You have a ${dayCount}-day study streak, based on ${observations} recorded ${sessionWord}.`,
      type: 'positive',
      sampleSize: observations,
      evidenceTier: tier,
      evidenceLabel: tier.label
    });
  }

  return insights;
}
