export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  SUMMARY: 'summary'
};

export const GAME_MODES = {
  HIRAGANA: 'hiragana',
  KATAKANA: 'katakana',
  BOTH: 'both'
};

export const KANA_OPTIONS = {
  DAKUTEN: 'dakuten',
  YOON: 'yoon'
};

export const SORT_MODES = {
  FAILURES: 'failures',
  ALPHABETICAL: 'alphabetical',
  TIME: 'time'
};

export const SOUND_MODES = {
  BOTH: 'both',
  NONE: 'none',
  SPEECH_ONLY: 'speech_only'
};

export const FEEDBACK_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error'
};

export const REQUIRED_SUCCESSES_LIMITS = {
  MIN: 1,
  MAX: 10
};

export const TIMING = {
  INPUT_FOCUS_DELAY: 100,
  SUCCESS_FEEDBACK_DELAY: 400,
  ERROR_FEEDBACK_DELAY: 1800
};

export const TINT_CONFIG = {
  MAX_ALPHA: 0.20,
  FAILURE_MULTIPLIER: 0.05,
  ERROR_WEIGHT: 0.6,
  TIME_WEIGHT: 0.4,
  COLORS: {
    RED: { r: 255, g: 0, b: 0 },
    PURPLE: { r: 128, g: 0, b: 128 }
  }
};

export const SPEECH_CONFIG = {
  JAPANESE: {
    lang: 'ja-JP',
    rate: 0.5,
    pitch: 1.2,
    volume: 1.5
  }
};
