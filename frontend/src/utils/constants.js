// ============================================
// MOODBEATS CONSTANTS
// ============================================

/**
 * Audio categories - All synthetically generated via Web Audio API
 * NOTE: These are NOT actual audio files or recordings
 */
export const AUDIO = [
  { id: 'lofi', category: 'Music', c: 'var(--workspace-amber)', n: 'Lo-fi', d: 'Warm chords with soft vinyl texture.', icon: '🎵', glyph: 'fa-music', type: 'synthetic' },
  { id: 'instr', category: 'Music', c: 'var(--workspace-chart-after)', n: 'Instrumental', d: 'Soft arpeggios over gentle sustained chords.', icon: '🎹', glyph: 'fa-sliders', type: 'synthetic' },
  { id: 'nature', category: 'Nature textures', c: 'var(--workspace-chart-deep)', n: 'Nature', d: 'Synthesized rain and wind.', icon: '🌿', glyph: 'fa-leaf', type: 'synthetic' },
  { id: 'freq', category: 'Steady tones', c: 'var(--workspace-chart-sky)', n: 'Frequency', d: 'Steady tones with a subtle pulse.', icon: '🎧', glyph: 'fa-wave-square', type: 'synthetic' },
  { id: 'ambient', category: 'Atmospheric', c: 'var(--workspace-chart-sand)', n: 'Ambient', d: 'Slow, atmospheric chords and a soft drone.', icon: '🌌', glyph: 'fa-cloud-moon', type: 'synthetic' },
  { id: 'none', category: 'Quiet', c: 'var(--workspace-chart-before)', n: 'Silence', d: 'Study with the timer and no soundscape.', icon: '🔇', glyph: 'fa-volume-xmark', type: 'none' }
];

/**
 * Study room background scene ids (art registry lives in studyScenes.js,
 * which imports the image assets and must stay out of node-test reach).
 */
export const STUDY_SCENE_IDS = ['night', 'sakura', 'sunny'];

/**
 * Study task types
 */
export const TASKS = [
  'Reading',
  'Writing',
  'Problem solving',
  'Memorizing',
  'Revision',
  'Coding'
];

/**
 * Mood ratings (1-5 scale)
 */
export const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
export const MOOD_LABELS = ['Very low', 'Low', 'Neutral', 'Good', 'Excellent'];
export const TASK_COMPLETION_LABELS = {
  completed: 'Completed',
  partial: 'Partially completed',
  not_completed: 'Not completed'
};

/**
 * LocalStorage keys - MUST match existing implementation
 * DO NOT change these without data migration
 */
export const STORAGE_KEYS = {
  SESSIONS: 'moodbeats:sessions',
  GOAL: 'moodbeats:goal',
  USER_NAME: 'moodbeats:userName',
  SCHEMA_VERSION: 'moodbeats:schema_version',
  // Legacy keys (for migration detection)
  LEGACY_SESSIONS: 'studybeats:sessions',
  LEGACY_GOAL: 'studybeats:goal'
};

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Helper functions
 */
export const getAudioName = (id) => AUDIO.find(a => a.id === id)?.n || 'Unknown';
export const getAudioIcon = (id) => AUDIO.find(a => a.id === id)?.icon || '🎵';
export const getAudioColor = (id) => AUDIO.find(a => a.id === id)?.c || 'var(--workspace-rose)';
export const getAudioGlyph = (id) => AUDIO.find(a => a.id === id)?.glyph || 'fa-music';
