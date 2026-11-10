// ============================================
// MOODBEATS CONSTANTS
// ============================================

/**
 * Audio categories - All synthetically generated via Web Audio API
 * NOTE: These are NOT actual audio files or recordings
 */
export const AUDIO = [
  { 
    id: 'lofi', 
    c: '#BF5AFF', 
    n: 'Lo-fi', 
    d: 'Synthesized mellow tones', 
    icon: '🎵',
    type: 'synthetic'
  },
  { 
    id: 'instr', 
    c: '#8B35FF', 
    n: 'Instrumental', 
    d: 'Generated soft arpeggios', 
    icon: '🎹',
    type: 'synthetic'
  },
  { 
    id: 'nature', 
    c: '#8B35FF', // Changed from green to purple
    n: 'Nature', 
    d: 'Synthesized ambient sounds', 
    icon: '🌿',
    type: 'synthetic'
  },
  { 
    id: 'freq', 
    c: '#BF5AFF', 
    n: 'Frequency', 
    d: 'Generated tone patterns', 
    icon: '🎧',
    type: 'synthetic'
  },
  { 
    id: 'ambient', 
    c: '#C9B4FF', // Soft lavender
    n: 'Ambient', 
    d: 'Atmospheric generated sounds', 
    icon: '🌌',
    type: 'synthetic'
  },
  { 
    id: 'none', 
    c: '#938B9E', 
    n: 'Silence', 
    d: 'No audio, pure focus', 
    icon: '🔇',
    type: 'none'
  }
];

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
export const getAudioColor = (id) => AUDIO.find(a => a.id === id)?.c || '#8B35FF';
