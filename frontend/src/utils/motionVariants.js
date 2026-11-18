/**
 * Reusable animation variants for Framer Motion
 * Centralized motion library for consistent animation language across MoodBeats
 */

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

export const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// ============================================
// STAGGER ANIMATIONS
// ============================================

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
      duration: 0.4
    }
  }
});

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export const staggerItemScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// ============================================
// CARD & HOVER ANIMATIONS
// ============================================

export const cardHover = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const cardGlowHover = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 }
  }
};

// ============================================
// BUTTON ANIMATIONS
// ============================================

export const buttonHover = {
  rest: {
    scale: 1,
    transition: { duration: 0.15 }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.98 }
};

export const buttonGlow = {
  rest: {
    transition: { duration: 0.2 }
  },
  hover: {
    transition: { duration: 0.2 }
  }
};

// ============================================
// PAGE & MODAL TRANSITIONS
// ============================================

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const pageSlideIn = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
};

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

// ============================================
// INPUT & FOCUS ANIMATIONS
// ============================================

export const inputFocus = {
  rest: {
    transition: { duration: 0.2 }
  },
  focus: {
    transition: { duration: 0.2 }
  }
};

// ============================================
// SLIDER & CONTROL ANIMATIONS
// ============================================

export const sliderHandle = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  focus: {
    scale: 1.2,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.15,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  }
};

export const sliderTrackFill = {
  rest: {
    background: 'var(--gradient)'
  },
  active: {
    transition: { type: 'tween', duration: 0.2 }
  }
};

// ============================================
// COUNTER & NUMBER ANIMATIONS
// ============================================

export const counterContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export const counterItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// ============================================
// CHART & DATA ANIMATIONS
// ============================================

export const chartEnter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export const chartDataPoint = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.3,
    transition: { duration: 0.15 }
  }
};

// ============================================
// TIMER & PROGRESS ANIMATIONS
// ============================================

export const pulseGlow = {
  rest: {
  },
  pulse: {
    transition: { duration: 2, repeat: Infinity }
  }
};

export const progressRing = {
  initial: { strokeDashoffset: 0 },
  animate: (progress) => ({
    strokeDashoffset: (1 - progress) * 100,
    transition: { duration: 0.5, ease: 'easeInOut' }
  })
};

// ============================================
// BADGE & INDICATOR ANIMATIONS
// ============================================

export const badgeEntry = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  }
};

export const indicatorPulse = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 2, repeat: Infinity }
  }
};

// ============================================
// SELECTION & TOGGLE ANIMATIONS
// ============================================

export const selectionRing = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15 } }
};

export const toggleSwitch = {
  rest: { x: 0 },
  active: { x: 24 },
  transition: { type: 'spring', stiffness: 300, damping: 20 }
};

// ============================================
// PREMIUM ACTIVE STUDY ROOM (Phase 5)
// ============================================

export const timerMilestone = {
  pulse: {
    opacity: [1, 0.6, 1],
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut'
    }
  }
};

export const timerCompletion = {
  complete: {
    opacity: [1, 0.5, 1, 0.5, 1],
    scale: [1, 1.1, 1, 1.1, 1],
    transition: {
      duration: 1.2,
      ease: 'easeInOut'
    }
  }
};

export const frequencyBar = {
  animate: (height) => ({
    height: `${height}%`,
    transition: {
      duration: 0.1,
      ease: 'linear'
    }
  })
};

export const visualizerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const ambientGradient = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 8,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

export const volumeSliderThumb = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.2,
    transition: { duration: 0.2 }
  }
};

export const buttonFocusRing = {
  rest: {
    transition: { duration: 0.2 }
  },
  focus: {
    transition: { duration: 0.2 }
  }
};

export const modalBackdropBlur = {
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(4px)',
    transition: { duration: 0.2 }
  }
};

// ============================================
// STUDY SETUP ANIMATIONS (Phase 4)
// ============================================

export const pillButton = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.98 }
};

export const moodPill = {
  rest: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.025,
    opacity: 1,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.02,
    opacity: 1,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.95 }
};

export const taskPill = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.02,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.96 }
};

export const durationPill = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.025,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.97 }
};

export const audioCard = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.02,
    transition: { duration: 0.15 }
  },
  tap: { scale: 0.98 }
};

export const audioIcon = {
  rest: {
    scale: 1,
    rotate: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    rotate: 5,
    transition: { duration: 0.3 }
  }
};

export const selectionCheckmark = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 12 }
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const sliderThumbGlow = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  active: {
    scale: 1.3,
    transition: { duration: 0.2 }
  }
};

export const formGroupBlock = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.3,
      ease: 'easeOut'
    }
  })
};

export const studyCardEntry = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.2 }
  }
};

export const sessionSummaryBox = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.4 }
  }
};

export const proceedButton = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

// ============================================
// UTILITIES
// ============================================

/**
 * Returns a transition config with optional custom duration
 * @param {number} duration - Duration in milliseconds (default 300)
 * @param {string} ease - Easing function (default 'easeInOut')
 * @returns {object} Framer Motion transition object
 */
export const transition = (duration = 300, ease = 'easeInOut') => ({
  duration: duration / 1000,
  ease
});

/**
 * Returns a spring config with optional stiffness and damping
 * @param {number} stiffness - Spring stiffness (default 200)
 * @param {number} damping - Spring damping (default 15)
 * @returns {object} Framer Motion transition object
 */
export const springTransition = (stiffness = 200, damping = 15) => ({
  type: 'spring',
  stiffness,
  damping
});

/**
 * Delays an animation
 * @param {number} ms - Delay in milliseconds
 * @returns {object} Delay object for transition
 */
export const delay = (ms) => ({
  delay: ms / 1000
});
