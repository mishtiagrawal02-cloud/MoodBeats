import { create } from 'zustand';

/**
 * Study Session Store
 * Manages active study session state and lifecycle
 */
const useStudyStore = create((set, get) => ({
  // Session state
  activeSession: null, // Current session object or null
  sessionStage: 'none', // 'none' | 'before-checkin' | 'study-room' | 'after-checkin' | 'complete'
  
  // Timer state
  elapsedSeconds: 0,
  isRunning: false,
  targetDuration: null, // in minutes
  
  // Audio state
  currentEnvironment: null, // Current environment object
  audioVolume: 0.5,
  isAudioPlaying: false,
  
  // Session data
  beforeCheckInData: null,
  afterCheckInData: null,
  
  // Actions
  startBeforeCheckIn: () => {
    set({
      sessionStage: 'before-checkin',
      activeSession: {
        id: Date.now().toString(),
        startTime: null,
        endTime: null,
      },
    });
  },
  
  submitBeforeCheckIn: (data) => {
    const { activeSession } = get();
    set({
      beforeCheckInData: data,
      sessionStage: 'study-room',
      targetDuration: data.targetDuration,
      currentEnvironment: data.environment,
      activeSession: {
        ...activeSession,
        startTime: new Date().toISOString(),
        mood: data.mood,
        stress: data.stress,
        focus: data.focus,
        taskType: data.taskType,
        taskDescription: data.taskDescription,
        environment: data.environment,
      },
    });
  },
  
  startTimer: () => {
    set({ isRunning: true });
  },
  
  pauseTimer: () => {
    set({ isRunning: false });
  },
  
  incrementTimer: () => {
    const { elapsedSeconds, targetDuration, isRunning } = get();
    if (!isRunning) return;
    
    const newElapsed = elapsedSeconds + 1;
    const targetSeconds = targetDuration * 60;
    
    // Auto-pause when target reached
    if (newElapsed >= targetSeconds) {
      set({ 
        elapsedSeconds: newElapsed,
        isRunning: false,
      });
    } else {
      set({ elapsedSeconds: newElapsed });
    }
  },
  
  playAudio: () => {
    set({ isAudioPlaying: true });
  },
  
  pauseAudio: () => {
    set({ isAudioPlaying: false });
  },
  
  setAudioVolume: (volume) => {
    set({ audioVolume: volume });
  },
  
  changeEnvironment: (environment) => {
    const { activeSession } = get();
    set({ 
      currentEnvironment: environment,
      activeSession: {
        ...activeSession,
        environment,
      },
    });
  },
  
  endStudySession: () => {
    const { activeSession, isAudioPlaying } = get();
    
    // Pause audio if playing
    if (isAudioPlaying) {
      set({ isAudioPlaying: false });
    }
    
    set({
      activeSession: {
        ...activeSession,
        endTime: new Date().toISOString(),
      },
      isRunning: false,
      sessionStage: 'after-checkin',
    });
  },
  
  submitAfterCheckIn: (data) => {
    const { activeSession, elapsedSeconds, beforeCheckInData } = get();
    
    const completedSession = {
      ...activeSession,
      ...data,
      duration: Math.floor(elapsedSeconds / 60), // Convert to minutes
      elapsedSeconds,
      moodBefore: beforeCheckInData.mood,
      stressBefore: beforeCheckInData.stress,
      focusBefore: beforeCheckInData.focus,
      moodAfter: data.mood,
      stressAfter: data.stress,
      focusAfter: data.focus,
    };
    
    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('moodbeats:sessions') || '[]');
    existingSessions.push(completedSession);
    localStorage.setItem('moodbeats:sessions', JSON.stringify(existingSessions));
    
    set({
      afterCheckInData: data,
      sessionStage: 'complete',
      activeSession: completedSession,
    });
  },
  
  resetSession: () => {
    set({
      activeSession: null,
      sessionStage: 'none',
      elapsedSeconds: 0,
      isRunning: false,
      targetDuration: null,
      currentEnvironment: null,
      isAudioPlaying: false,
      beforeCheckInData: null,
      afterCheckInData: null,
    });
  },
}));

export default useStudyStore;
