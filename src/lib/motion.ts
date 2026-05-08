/**
 * APIS Unified Motion System
 * Standardized easing, timing, and spring constants for a calm SaaS experience.
 */

export const CALM_EASE = [0.22, 1, 0.36, 1]; // Custom easing for premium feel

export const TRANSITIONS = {
  DEFAULT: { duration: 0.4, ease: CALM_EASE },
  FAST: { duration: 0.2, ease: CALM_EASE },
  SLOW: { duration: 0.8, ease: CALM_EASE },
  SPRING: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1
  },
  SPRING_BOUNCY: {
    type: 'spring',
    stiffness: 400,
    damping: 20
  },
  STAGGER: 0.05 // Reduced from 0.1 for perceived speed
};

export const ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: TRANSITIONS.DEFAULT
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: TRANSITIONS.DEFAULT
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: TRANSITIONS.SPRING
  }
};
