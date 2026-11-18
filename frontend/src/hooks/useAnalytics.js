import { useState, useMemo } from 'react';
import {
  DATE_RANGES,
  filterSessionsByRange,
  calculateOverviewStats,
  calculateMoodTrends,
  calculateFocusStressAnalysis,
  calculateStudyConsistency,
  calculateAudioAnalysis,
  calculateTaskDistribution,
  generatePersonalInsights,
  hasRecordedAnalyticsData
} from '../utils/analyticsCalculations.js';

export function useAnalytics(sessions) {
  const [dateRange, setDateRange] = useState(DATE_RANGES.WEEK);

  const { currentSessions, previousSessions, days } = useMemo(() => {
    return filterSessionsByRange(sessions, dateRange);
  }, [sessions, dateRange]);

  const overview = useMemo(() => {
    return calculateOverviewStats(currentSessions, previousSessions);
  }, [currentSessions, previousSessions]);

  const moodTrends = useMemo(() => {
    return calculateMoodTrends(currentSessions, dateRange);
  }, [currentSessions, dateRange]);

  const focusStress = useMemo(() => {
    return calculateFocusStressAnalysis(currentSessions);
  }, [currentSessions]);

  const consistency = useMemo(() => {
    return calculateStudyConsistency(currentSessions, dateRange);
  }, [currentSessions, dateRange]);

  const audio = useMemo(() => {
    return calculateAudioAnalysis(currentSessions);
  }, [currentSessions]);

  const tasks = useMemo(() => {
    return calculateTaskDistribution(currentSessions);
  }, [currentSessions]);

  const insights = useMemo(() => {
    return generatePersonalInsights(currentSessions, dateRange);
  }, [currentSessions, dateRange]);

  const hasAnyData = useMemo(() => {
    return hasRecordedAnalyticsData(sessions);
  }, [sessions]);

  const hasRangeData = useMemo(() => {
    return overview.completedSessions > 0;
  }, [overview.completedSessions]);

  return {
    dateRange,
    setDateRange,
    days,
    currentSessions,
    overview,
    moodTrends,
    focusStress,
    consistency,
    audio,
    tasks,
    insights,
    hasAnyData,
    hasRangeData
  };
}

