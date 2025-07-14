/**
 * @file constants/animations.ts
 * @description Animation timing and configuration constants
 * @features - Consistent animation durations, easing curves, timing values
 */

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const CAROUSEL_ANIMATIONS = {
  FADE_DURATION: 200,
  SCALE_DURATION: 300,
  AUTO_SCROLL_INTERVAL: 4000,
  SCROLL_FAILURE_DELAY: 500,
} as const;

export const CHAT_INPUT_ANIMATIONS = {
  HEIGHT_CHANGE_DURATION: 300,
  EXPANDED_HEIGHT: 70,
  COLLAPSED_HEIGHT: 50,
} as const;

export const MENU_ANIMATIONS = {
  SLIDE_DURATION: 300,
  BACKDROP_FADE_DURATION: 300,
  SLIDE_DISTANCE: -300,
} as const;

export const FADE_VALUES = {
  VISIBLE: 1,
  SEMI_TRANSPARENT: 0.7,
  HIDDEN: 0,
} as const;

export const SCALE_VALUES = {
  NORMAL: 1,
  EXPANDED: 1.05,
  COMPRESSED: 0.95,
} as const;