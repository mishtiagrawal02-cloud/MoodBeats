import { useMemo } from 'react';
import { MOODS, AUDIO } from '../utils/constants';
import { getProductiveSessions } from '../utils/analyticsCalculations';

function ratingDeltas(sessions, key, max = 10) {
  const valid = (value) => Number.isInteger(value) && value >= 1 && value <= max;
  return sessions.filter(({ pre, post }) => valid(pre?.[key]) && valid(post?.[key]))
    .map(({ pre, post }) => post[key] - pre[key]);
}

function mean(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) * 10 / values.length) / 10 : null;
}

export function useDashboardStats(sessions, goal = 150) {
  const dateKey = new Date().toDateString();
  return useMemo(() => {
    const validSessions = getProductiveSessions(sessions);

    // 1. Total Study Hours & Minutes
    const totalMins = validSessions.reduce((acc, s) => acc + (Number(s?.mins) || 0), 0);
    const totalHours = (totalMins / 60).toFixed(1);

    // 2. Completed Sessions (sessions with actual study time)
    const completedSessions = validSessions.length;

    // 3. Current Study Streak (requires actual study time > 0)
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
    const now = Date.now();
    const weekAgo = now - 7 * 864e5;
    const weekSessions = validSessions.filter(({ ts }) => {
      const timestamp = new Date(ts).getTime();
      return timestamp >= weekAgo && timestamp <= now;
    });
    const weekMins = weekSessions.reduce((acc, s) => acc + (Number(s?.mins) || 0), 0);
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

      const daySessions = validSessions.filter(
        (s) => s?.ts && !isNaN(new Date(s.ts).getTime()) && new Date(s.ts).toDateString() === dayDateString
      );
      const dayMinutes = daySessions.reduce((acc, s) => acc + (Number(s?.mins) || 0), 0);
      
      const avgFocusDelta = mean(ratingDeltas(daySessions, 'focus'));

      last7Days.push({
        day: dayName,
        date: dayMonth,
        focusDelta: avgFocusDelta,
        minutes: dayMinutes,
        sessionCount: daySessions.length
      });
    }

    // 6. Recent study sessions (top 4 legitimate study sessions, newest first)
    const sortedSessions = [...validSessions].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    const recentSessions = sortedSessions.slice(0, 4);

    // 7. Personal Insights
    // Latest recorded mood from genuine study sessions
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

    // Averages across legitimate study sessions
    const avgFocusDeltaAll = mean(ratingDeltas(validSessions, 'focus'));
    const avgStressChange = mean(ratingDeltas(validSessions, 'stress'));
    const avgStressReductionAll = avgStressChange === null ? null : -avgStressChange;
    const avgMoodDeltaAll = mean(ratingDeltas(validSessions, 'mood', 5));

    let topAudio = null;
    const audioStats = Object.create(null);
    validSessions.forEach((session) => {
      const focus = ratingDeltas([session], 'focus');
      if (!session.audio || focus.length === 0) return;
      const group = audioStats[session.audio] ??= { totalFocusDelta: 0, count: 0 };
      group.totalFocusDelta += focus[0];
      group.count += 1;
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
  }, [sessions, goal, dateKey]);
}

