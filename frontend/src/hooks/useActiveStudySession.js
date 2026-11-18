import { useState, useEffect, useRef, useCallback } from 'react';
import { AUDIO, STUDY_SCENE_IDS } from '../utils/constants';
import { ACTIVE_SESSION_KEY, STUDY_PREFERENCES_KEY, appendSession, calculateTimerData, readActiveSession, readStudyPreferences } from '../utils/studyStorage';
import { notifyDataChange } from './useUserData';
import { audioEngine } from '../utils/audioEngine';

export { ACTIVE_SESSION_KEY };

export function useActiveStudySession() {
  const [preferences] = useState(() => readStudyPreferences());
  const [preCheckIn, setPreCheckIn] = useState(() => ({
    mood: typeof preferences.mood === 'number' ? preferences.mood : 3,
    stress: typeof preferences.stress === 'number' ? preferences.stress : 5,
    focus: typeof preferences.focus === 'number' ? preferences.focus : 5,
    task: preferences.task,
    customTask: typeof preferences.customTask === 'string' ? preferences.customTask : ''
  }));
  const [envConfig, setEnvConfig] = useState(() => ({
    durationMins: preferences.mins,
    customDuration: '',
    audio: preferences.audio,
    volume: preferences.volume,
    background: preferences.background
  }));

  const [activeSession, setActiveSession] = useState(() => readActiveSession());
  const [stage, setStage] = useState(() => activeSession?.stage ?? 'CHECK_IN');
  const [timerData, setTimerData] = useState(() => calculateTimerData(activeSession));

  // Ref to hold activeSession for stable tick recalculation without re-triggering audio
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  // Completed session receipt
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [audioError, setAudioError] = useState('');

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

    const { totalSeconds, status } = session;
    const now = Date.now();
    const timer = calculateTimerData(session, now);
    const { remainingSeconds } = timer;
    setTimerData(timer);

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

  const playing = useRef(null);

  const syncAudio = useCallback((session) => {
    if (session.audio === 'none') {
      setAudioError('');
      audioEngine.stop();
      playing.current = null;
      return;
    }
    if (playing.current?.id === session.id && playing.current.audio === session.audio) {
      audioEngine.resume();
      return;
    }
    playing.current = null;
    if (audioEngine.start(session.audio, session.volume)) {
      playing.current = { id: session.id, audio: session.audio };
      setAudioError('');
    } else {
      setAudioError('This soundscape is unavailable. The focus timer can continue.');
    }
  }, []);

  useEffect(() => {
    const session = activeSessionRef.current;
    if (!session) return;
    recalculateTime();
    if (session.status !== 'ACTIVE') return;
    if (calculateTimerData(session).remainingSeconds > 0) syncAudio(session);
    const interval = setInterval(recalculateTime, 500);
    return () => clearInterval(interval);
  }, [activeSession?.status, activeSession?.id, activeSession?.audio, recalculateTime, syncAudio]);

  useEffect(() => () => {
    playing.current = null;
    audioEngine.stop();
  }, []);

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
      background: envConfig.background,
      pre: {
        mood: preCheckIn.mood,
        stress: preCheckIn.stress,
        focus: preCheckIn.focus
      }
    };

    setActiveSession(sessionObj);
    saveActiveSession(sessionObj);
    setStage('ACTIVE');

    setTimerData(calculateTimerData(sessionObj, now));
    syncAudio(sessionObj);
  }, [envConfig, preCheckIn, saveActiveSession, syncAudio]);

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

    syncAudio(updated);
  }, [activeSession, saveActiveSession, syncAudio]);

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

  const setAudio = useCallback((audio) => {
    if (!activeSession || !AUDIO.some(({ id }) => id === audio) || audio === activeSession.audio) return;
    const updated = { ...activeSession, audio };
    setActiveSession(updated);
    saveActiveSession(updated);
    if (updated.status === 'ACTIVE') syncAudio(updated);
  }, [activeSession, saveActiveSession, syncAudio]);

  // Switch the background scene — from the setup selector or while a session
  // is live. Only the scene changes: timer, pause state, task, audio and
  // check-ins are preserved. The choice is persisted to the study
  // preferences immediately (and to the active session, when one exists).
  const setBackground = useCallback((background) => {
    if (!STUDY_SCENE_IDS.includes(background) || envConfig.background === background) return;
    if (activeSession && activeSession.background !== background) {
      const updated = { ...activeSession, background };
      setActiveSession(updated);
      saveActiveSession(updated);
    }
    setEnvConfig((prev) => ({ ...prev, background }));
    try {
      localStorage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify({ ...readStudyPreferences(), background }));
    } catch (error) {
      console.error('Failed to store study preferences:', error);
    }
  }, [activeSession, envConfig.background, saveActiveSession]);

  // End session early with choice to check in
  const endSessionForCheckIn = useCallback(() => {
    if (!activeSession) return;
    audioEngine.stop();

    const now = Date.now();
    const { elapsedSeconds } = calculateTimerData(activeSession, now);

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
    setSaveError('');

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

    let finalSession = {
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
      finalSession = appendSession(finalSession);
      notifyDataChange();
    } catch (e) {
      console.error('Failed to append completed session:', e);
      setSaveError('Your session could not be saved. Your check-in is still open so you can try again.');
      return;
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
    saveError,
    audioError,
    startSession,
    pauseSession,
    resumeSession,
    setVolume,
    setAudio,
    setBackground,
    endSessionForCheckIn,
    abandonSession,
    finishAfterCheckIn,
    resetToNewSession
  };
}
