import { useMemo } from 'react';
import { MOODS, AUDIO } from '../utils/constants';

export function useDashboardStats(sessions, goal = 150) {
  return useMemo(() => {
    const list = Array.isArray(sessions) ? sessions : [];

    // 1. Total Study Hours & Minutes
    const totalMins = list.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);
    const totalHours = (totalMins / 60).toFixed(1);

    // 2. Completed Sessions
    const completedSessions = list.length;

    // 3. Current Study Streak
    let streak = 0;
    if (list.length > 0) {
      const daySet = new Set(list.map((s) => new Date(s.ts).toDateString()));
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
    const weekSessions = list.filter((s) => s.ts >= weekAgo);
    const weekMins = weekSessions.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);
    const goalMinutes = Math.max(1, Number(goal) || 150);
    const goalPercent = Math.min(100, Math.round((weekMins / goalMinutes) * 100));

    // 5. Seven-day focus trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dayDateString = dayDate.toDateString();
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayMonth = dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      const daySessions = list.filter((s) => new Date(s.ts).toDateString() === dayDateString);
      const dayMinutes = daySessions.reduce((acc, s) => acc + (Number(s.mins) || 0), 0);
      
      let avgFocusDelta = 0;
      if (daySessions.length > 0) {
        const sumFocus = daySessions.reduce(
          (acc, s) => acc + ((s.post?.focus ?? 5) - (s.pre?.focus ?? 5)),
          0
        );
        avgFocusDelta = Math.round((sumFocus / daySessions.length) * 10) / 10;
      }

      last7Days.push({
        day: dayName,
        date: dayMonth,
        focusDelta: avgFocusDelta,
        minutes: dayMinutes,
        sessionCount: daySessions.length
      });
    }

    // 6. Recent study sessions (top 4, newest first)
    const sortedSessions = [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const recentSessions = sortedSessions.slice(0, 4);

    // 7. Personal Insights
    // Latest recorded mood
    let latestMood = null;
    if (sortedSessions.length > 0) {
      const latest = sortedSessions[0];
      const moodVal = latest.post?.mood || latest.pre?.mood || 3;
      const emoji = MOODS[Math.max(0, Math.min(MOODS.length - 1, moodVal - 1))] || '😐';
      latestMood = {
        value: moodVal,
        emoji,
        timestamp: latest.ts
      };
    }

    // Averages across recent/all sessions
    let avgFocusDeltaAll = 0;
    let avgStressReductionAll = 0;
    let avgMoodDeltaAll = 0;

    if (list.length > 0) {
      const focusSum = list.reduce(
        (acc, s) => acc + ((s.post?.focus ?? 5) - (s.pre?.focus ?? 5)),
        0
      );
      const stressSum = list.reduce(
        (acc, s) => acc + ((s.pre?.stress ?? 5) - (s.post?.stress ?? 5)),
        0
      );
      const moodSum = list.reduce(
        (acc, s) => acc + ((s.post?.mood ?? 3) - (s.pre?.mood ?? 3)),
        0
      );

      avgFocusDeltaAll = Math.round((focusSum / list.length) * 10) / 10;
      avgStressReductionAll = Math.round((stressSum / list.length) * 10) / 10;
      avgMoodDeltaAll = Math.round((moodSum / list.length) * 10) / 10;
    }

    // Most effective audio environment
    let topAudio = null;
    const audioStats = {};
    list.forEach((s) => {
      if (!s.audio) return;
      if (!audioStats[s.audio]) {
        audioStats[s.audio] = { totalFocusDelta: 0, count: 0 };
      }
      const delta = (s.post?.focus ?? 5) - (s.pre?.focus ?? 5);
      audioStats[s.audio].totalFocusDelta += delta;
      audioStats[s.audio].count += 1;
    });

    let bestAvg = -999;
    Object.entries(audioStats).forEach(([audioId, data]) => {
      const avg = data.totalFocusDelta / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        const audioInfo = AUDIO.find((a) => a.id === audioId);
        topAudio = {
          id: audioId,
          name: audioInfo?.n || audioId,
          icon: audioInfo?.icon || '🎵',
          avgDelta: Math.round(avg * 10) / 10,
          sessionCount: data.count
        };
      }
    });

    return {
      totalHours,
      totalMins,
      completedSessions,
      streak,
      weekMins,
      goalMinutes,
      goalPercent,
      last7Days,
      recentSessions,
      latestMood,
      avgFocusDelta: avgFocusDeltaAll,
      avgStressReduction: avgStressReductionAll,
      avgMoodDelta: avgMoodDeltaAll,
      topAudio
    };
  }, [sessions, goal]);
}

