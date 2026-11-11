import { useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS, AUDIO, TASKS } from '../utils/constants';

export const DATA_CHANGE_EVENT = 'moodbeats:data-changed';

/**
 * Triggers a custom event so other components in the same tab update immediately.
 */
export function notifyDataChange() {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

export function useUserData() {
  // Read sessions without mutating or overwriting
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (raw) return JSON.parse(raw);
      // Fallback check to legacy without mutating
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_SESSIONS);
      if (legacy) return JSON.parse(legacy);
    } catch (e) {
      console.error('Failed to parse sessions from localStorage:', e);
    }
    return [];
  });

  // Read weekly goal
  const [goal, setGoalState] = useState(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.GOAL);
      if (val) return Number(val) || 150;
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_GOAL);
      if (legacy) return Number(legacy) || 150;
    } catch (e) {
      console.error('Failed to parse goal from localStorage:', e);
    }
    return 150;
  });

  // Read user name
  const [userName, setUserNameState] = useState(() => {
    try {
      const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      if (name && name.trim()) return name.trim();
    } catch (e) {
      console.error('Failed to parse userName from localStorage:', e);
    }
    return 'Awantika';
  });

  // Quick study preset state (used to stage next study session)
  const [quickStudyConfig, setQuickStudyConfigState] = useState(() => {
    try {
      const stored = localStorage.getItem('moodbeats:preSession');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { task: 'Reading', audio: 'lofi', mins: 25 };
  });

  // Check if current sessions contain any demo data
  const hasDemoData = useMemo(() => {
    return sessions.some((s) => s.isDemo === true);
  }, [sessions]);

  // Sync state from localStorage
  const refresh = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS) || localStorage.getItem(STORAGE_KEYS.LEGACY_SESSIONS);
      setSessions(raw ? JSON.parse(raw) : []);

      const g = localStorage.getItem(STORAGE_KEYS.GOAL) || localStorage.getItem(STORAGE_KEYS.LEGACY_GOAL);
      setGoalState(g ? Number(g) || 150 : 150);

      const u = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      setUserNameState(u && u.trim() ? u.trim() : 'Awantika');

      const q = localStorage.getItem('moodbeats:preSession');
      if (q) setQuickStudyConfigState(JSON.parse(q));
    } catch (err) {
      console.error('Error refreshing useUserData:', err);
    }
  }, []);

  // Listen to both cross-tab storage events and same-tab custom events
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('storage', handler);
    window.addEventListener(DATA_CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(DATA_CHANGE_EVENT, handler);
    };
  }, [refresh]);

  // Update quick study configuration
  const updateQuickStudyConfig = useCallback((partial) => {
    setQuickStudyConfigState((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem('moodbeats:preSession', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to store preSession config:', e);
      }
      return next;
    });
  }, []);

  // Load clearly-labeled DEMO DATA (explicit user request only, never automatic)
  const loadDemoData = useCallback(() => {
    const bias = {
      lofi: [1.6, 1, 0.6],
      instr: [1.2, 0.8, 0.5],
      nature: [0.8, 1.6, 0.8],
      freq: [0.3, 0.2, 0],
      ambient: [1.0, 0.7, 0.4],
      none: [0.5, 0, 0]
    };
    const r = () => Math.random() - 0.5;
    const now = Date.now();
    const demoSessions = [];

    for (let i = 0; i < 14; i++) {
      const a = AUDIO[i % 6].id;
      const b = bias[a];
      const t = TASKS[Math.floor(Math.random() * TASKS.length)];
      const pf = 3 + Math.floor(Math.random() * 4);
      const ps = 4 + Math.floor(Math.random() * 4);
      const pm = 2 + Math.floor(Math.random() * 2);
      const cp = (v) => Math.max(1, Math.min(10, Math.round(v)));

      demoSessions.push({
        id: now - (14 - i) * 86400000 + i,
        ts: now - (14 - i) * 86400000 * 0.95,
        task: t,
        audio: a,
        mins: [15, 25, 45, 60][i % 4],
        isDemo: true, // Clearly marked as demo data
        pre: { mood: pm, stress: ps, focus: pf },
        post: {
          mood: Math.max(1, Math.min(5, Math.round(pm + b[2] + r() * 1.5))),
          stress: cp(ps - b[1] + r() * 2),
          focus: cp(pf + b[0] + r() * 2)
        }
      });
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const current = raw ? JSON.parse(raw) : [];
      // Filter out any prior demo data before adding new demo batch
      const realOnly = current.filter((s) => !s.isDemo);
      const combined = [...realOnly, ...demoSessions];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(combined));
      setSessions(combined);
      notifyDataChange();
    } catch (e) {
      console.error('Failed to load demo data:', e);
    }
  }, []);

  // Remove ONLY demo data, preserving all real user sessions
  const removeDemoData = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      const current = raw ? JSON.parse(raw) : [];
      const realOnly = current.filter((s) => !s.isDemo);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(realOnly));
      setSessions(realOnly);
      notifyDataChange();
    } catch (e) {
      console.error('Failed to remove demo data:', e);
    }
  }, []);

  return {
    sessions,
    goal,
    userName,
    quickStudyConfig,
    updateQuickStudyConfig,
    hasDemoData,
    loadDemoData,
    removeDemoData,
    refresh
  };
}
