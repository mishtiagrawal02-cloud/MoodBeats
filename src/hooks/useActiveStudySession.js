import { useState, useEffect, useRef, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { notifyDataChange } from './useUserData';
import { audioEngine } from '../utils/audioEngine';

export const ACTIVE_SESSION_KEY = 'moodbeats:activeSession';

export function useActiveStudySession() {
  // Pre-session staging state
  const [preCheckIn, setPreCheckIn] = useState(() => {
    try {
      const stored = localStorage.getItem('moodbeats:preSession');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          mood: typeof parsed.mood === 'number' ? parsed.mood : 3,
          stress: typeof parsed.stress === 'number' ? parsed.stress : 5,
          focus: typeof parsed.focus === 'number' ? parsed.focus : 5,
          task: parsed.task || 'Reading',
          customTask: parsed.customTask || ''
        };
      }
    } catch {
      // ignore
    }
    return {
      mood: 3,
      stress: 5,
      focus: 5,
      task: 'Reading',
      customTask: ''
    };
  });

  const [envConfig, setEnvConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('moodbeats:preSession');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          durationMins: parsed.mins || 25,
          customDuration: '',
          audio: parsed.audio || 'lofi',
          volume: 0.6
        };
      }
    } catch {
      // ignore
    }
    return {
      durationMins: 25,
      customDuration: '',
      audio: 'lofi',
      volume: 0.6
    };
  });

  // Active Session State (persisted in localStorage)
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });

  // Workflow Stage: 'CHECK_IN' | 'ENVIRONMENT' | 'ACTIVE' | 'AFTER_CHECKIN' | 'COMPLETED'
  const [stage, setStage] = useState(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stage === 'AFTER_CHECKIN' || parsed.status === 'COMPLETED_TIMER' || parsed.status === 'COMPLETED_EARLY') {
          return 'AFTER_CHECKIN';
        }
        if (parsed.status === 'ACTIVE' || parsed.status === 'PAUSED') {
          return 'ACTIVE';
        }
      }
    } catch {
      // ignore
    }
    return 'CHECK_IN';
  });

  // Timer Tick Data (seconds remaining and progress 0 to 1)
  const [timerData, setTimerData] = useState(() => ({
    remainingSeconds: 0,
    elapsedSeconds: 0,
    progress: 0
  }));

  // Ref to hold activeSession for stable tick recalculation without re-triggering audio
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  // Completed session receipt
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Helper to persist active session state
  const saveActiveSession = useCallback((sess) => {
    try {
      if (sess) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sess));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to save active session:', e);
    }
  }, []);

  // Update time based on real timestamps
  const recalculateTime = useCallback(() => {
    const session = activeSessionRef.current;
    if (!session) return;

    const { startedAt, totalSeconds, status, pausedAt, totalPausedMs } = session;
    const now = Date.now();

    let effectiveElapsedMs = 0;
    if (status === 'PAUSED' && pausedAt) {
      effectiveElapsedMs = pausedAt - startedAt - (totalPausedMs || 0);
    } else {
      effectiveElapsedMs = now - startedAt - (totalPausedMs || 0);
    }

    const elapsedSeconds = Math.max(0, Math.floor(effectiveElapsedMs / 1000));
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    const progress = totalSeconds > 0 ? Math.min(1, elapsedSeconds / totalSeconds) : 0;

    setTimerData({
      remainingSeconds,
      elapsedSeconds,
      progress
    });

    // Auto-complete timer check
    if (remainingSeconds <= 0 && status === 'ACTIVE') {
      audioEngine.stop();
      const updated = {
        ...session,
        status: 'COMPLETED_TIMER',
        stage: 'AFTER_CHECKIN',
        completedAt: now,
        elapsedSeconds: totalSeconds
      };
      setActiveSession(updated);
      saveActiveSession(updated);
      setStage('AFTER_CHECKIN');
    }
  }, [saveActiveSession]);

  // High-frequency interval for smooth UI and drift-free background recovery
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'ACTIVE') {
      recalculateTime();
      return;
    }

    recalculateTime();
    const interval = setInterval(recalculateTime, 500);

    // Audio sync on mount if active
    if (activeSession.audio && activeSession.audio !== 'none') {
      audioEngine.start(activeSession.audio, activeSession.volume ?? 0.6);
    }

    return () => {
      clearInterval(interval);
      audioEngine.stop();
    };
  }, [activeSession?.status, activeSession?.id, recalculateTime]);

  // Start study session
  const startSession = useCallback(() => {
    let duration = envConfig.durationMins;
    if (envConfig.customDuration) {
      const parsed = parseInt(envConfig.customDuration, 10);
      duration = Number.isFinite(parsed) ? Math.max(1, Math.min(180, parsed)) : 25;
    }

    const taskName = preCheckIn.task === 'Other' && preCheckIn.customTask.trim()
      ? preCheckIn.customTask.trim()
      : preCheckIn.task;

    const now = Date.now();
    const sessionObj = {
      id: now,
      startedAt: now,
      targetMins: duration,
      totalSeconds: duration * 60,
      status: 'ACTIVE', // 'ACTIVE' | 'PAUSED' | 'COMPLETED_TIMER'
      stage: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: 0,
      task: taskName,
      audio: envConfig.audio,
      volume: envConfig.volume,
      pre: {
        mood: preCheckIn.mood,
        stress: preCheckIn.stress,
        focus: preCheckIn.focus
      }
    };

    setActiveSession(sessionObj);
    saveActiveSession(sessionObj);
    setStage('ACTIVE');

    // Start synthetic audio
    if (sessionObj.audio !== 'none') {
      audioEngine.start(sessionObj.audio, sessionObj.volume);
    }
  }, [envConfig, preCheckIn, saveActiveSession]);

  // Pause session
  const pauseSession = useCallback(() => {
    if (!activeSession || activeSession.status !== 'ACTIVE') return;

    audioEngine.pause();
    const now = Date.now();
    const updated = {
      ...activeSession,
      status: 'PAUSED',
      pausedAt: now
    };

    setActiveSession(updated);
    saveActiveSession(updated);
  }, [activeSession, saveActiveSession]);

  // Resume session
  const resumeSession = useCallback(() => {
    if (!activeSession || activeSession.status !== 'PAUSED') return;

    const now = Date.now();
    const additionalPausedMs = activeSession.pausedAt ? now - activeSession.pausedAt : 0;
    const updated = {
      ...activeSession,
      status: 'ACTIVE',
      pausedAt: null,
      totalPausedMs: activeSession.totalPausedMs + additionalPausedMs
    };

    setActiveSession(updated);
    saveActiveSession(updated);

    if (updated.audio !== 'none') {
      audioEngine.resume();
    }
  }, [activeSession, saveActiveSession]);

  // Adjust volume
  const setVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    audioEngine.setVolume(clamped);
    if (activeSession) {
      const updated = { ...activeSession, volume: clamped };
      setActiveSession(updated);
      saveActiveSession(updated);
    }
    setEnvConfig((prev) => ({ ...prev, volume: clamped }));
  }, [activeSession, saveActiveSession]);

  // End session early with choice to check in
  const endSessionForCheckIn = useCallback(() => {
    if (!activeSession) return;
    audioEngine.stop();

    const now = Date.now();
    const { startedAt, totalPausedMs, status, pausedAt, totalSeconds } = activeSession;
    let effectiveElapsedMs = 0;
    if (status === 'PAUSED' && pausedAt) {
      effectiveElapsedMs = pausedAt - startedAt - totalPausedMs;
    } else {
      effectiveElapsedMs = now - startedAt - totalPausedMs;
    }
    const elapsedSeconds = Math.max(0, Math.min(totalSeconds, Math.floor(effectiveElapsedMs / 1000)));

    const updated = {
      ...activeSession,
      status: 'COMPLETED_EARLY',
      stage: 'AFTER_CHECKIN',
      completedAt: now,
      elapsedSeconds
    };

    setActiveSession(updated);
    saveActiveSession(updated);
    setStage('AFTER_CHECKIN');
  }, [activeSession, saveActiveSession]);

  // Abandon session completely without saving or counting towards stats
  const abandonSession = useCallback(() => {
    audioEngine.stop();
    setActiveSession(null);
    saveActiveSession(null);
    setStage('CHECK_IN');
  }, [saveActiveSession]);

  // Save completed session after user finishes after-study check-in
  const finishAfterCheckIn = useCallback((afterData) => {
    if (!activeSession) return;

    // Calculate actual elapsed minutes safely:
    // 1. Preserve zero elapsed seconds as zero (never substitute totalSeconds / planned duration).
    // 2. Non-zero partial minutes rounded up to full minute (Math.ceil).
    // 3. Never record more time than the session's planned duration.
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
    const elapsedMinutes = cappedSeconds > 0 ? Math.ceil(cappedSeconds / 60) : 0;

    const finalSession = {
      id: activeSession.id || Date.now(),
      ts: activeSession.id || Date.now(),
      task: activeSession.task,
      audio: activeSession.audio,
      mins: elapsedMinutes,
      targetMins: activeSession.targetMins,
      completionType: activeSession.status === 'COMPLETED_EARLY' ? 'EARLY' : 'TIMER',
      taskCompletion: afterData.taskCompletion,
      notes: afterData.notes?.trim() || '',
      pre: { ...activeSession.pre },
      post: {
        mood: afterData.mood,
        stress: afterData.stress,
        focus: afterData.focus
      }
    };

    // Save to moodbeats:sessions
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const existing = raw ? JSON.parse(raw) : [];
      const updatedList = [finalSession, ...existing];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedList));
      notifyDataChange();
    } catch (e) {
      console.error('Failed to append completed session:', e);
    }

    // Clean active session
    setActiveSession(null);
    saveActiveSession(null);

    // Save receipt and move to COMPLETED
    setCompletedReceipt(finalSession);
    setStage('COMPLETED');
  }, [activeSession, saveActiveSession]);

  // Reset to create another session
  const resetToNewSession = useCallback(() => {
    setActiveSession(null);
    saveActiveSession(null);
    setCompletedReceipt(null);
    setStage('CHECK_IN');
  }, [saveActiveSession]);

  return {
    stage,
    setStage,
    preCheckIn,
    setPreCheckIn,
    envConfig,
    setEnvConfig,
    activeSession,
    timerData,
    completedReceipt,
    startSession,
    pauseSession,
    resumeSession,
    setVolume,
    endSessionForCheckIn,
    abandonSession,
    finishAfterCheckIn,
    resetToNewSession
  };
}
