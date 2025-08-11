import type { BoardConfig } from './types';

export const BOARD_CONFIG: BoardConfig = {
  defaultNoteColor: '#ffffa0', // Light yellow
  minNoteWidth: 200,
  minNoteHeight: 200,
  maxNoteWidth: 500,
  maxNoteHeight: 500,
};

// Mobile-optimized note configuration
export const MOBILE_NOTE_CONFIG = {
  defaultNoteColor: '#ffffa0', // Light yellow
  minNoteWidth: 150,  // Smaller minimum for mobile
  minNoteHeight: 120, // Smaller minimum for mobile
  maxNoteWidth: 300,  // Smaller maximum for mobile screens
  maxNoteHeight: 400, // Smaller maximum for mobile screens
  defaultWidth: 180,  // Optimal default width for mobile
  defaultHeight: 140, // Optimal default height for mobile
  padding: {
    viewport: 16,     // Minimum distance from screen edges
    toolbar: 80,      // Space to account for bottom toolbar
  }
} as const;

export const COLORS = {
  NOTE_COLORS: [
    '#ffffa0', // Light yellow
    '#ffcc99', // Light orange
    '#ffb3ba', // Light pink
    '#bae1ff', // Light blue
    '#baffc9', // Light green
    '#ffd1dc', // Light red
    '#e6ccff', // Light purple
    '#ffffba'  // Cream
  ]
} as const;

export const VALIDATION_RULES = {
  NOTE_TEXT_MAX_LENGTH: 5000,
  BOARD_ID_MIN_LENGTH: 8,
  BOARD_ID_MAX_LENGTH: 36,
} as const;

export const INTERACTION_CONFIG = {
  METRICS_CHECK_INTERVAL: 1000,
  MIN_THROTTLE_DELAY: 30,
  MAX_THROTTLE_DELAY: 100,
} as const;

export const LIVE_USER_CONFIG = {
  INACTIVE_THRESHOLD: 10000,
  UPDATE_INTERVAL: 5000,
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  LANDSCAPE_HEIGHT: 500,
  COMPACT_WIDTH: 480,
  TINY_WIDTH: 380,
} as const;

export const UI_TIMING = {
  DOUBLE_CLICK_THRESHOLD: 300,
} as const;

export const ICON_SIZES = {
  MOBILE: {
    SMALL: 14,
    MEDIUM: 16,
    LARGE: 18,
  },
  DESKTOP: {
    SMALL: 14,
    MEDIUM: 16,
    LARGE: 18,
  }
} as const;

// Mobile text editing configuration
export const MOBILE_TEXT_CONFIG = {
  fontSize: '14px',
  lineHeight: '1.4',
  padding: '12px',
  autoFocus: true,
  keyboardDismiss: 'on-tap-outside',
} as const;

export const VIEWPORT_CONFIG = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  DEFAULT_ZOOM: 1,
  ZOOM_STEP: 0.1,
  ZOOM_WHEEL_SENSITIVITY: 0.002,
  PAN_BUTTON: 0, // Left mouse button
  PAN_TOUCH_THRESHOLD: 10, // pixels
  CANVAS_CENTER: 1000,
} as const;

