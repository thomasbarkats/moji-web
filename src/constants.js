export const APP_MODES = {
  KANA: 'kana',
  KANJI: 'kanji',
  VOCABULARY: 'vocabulary'
};

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  JP: 'jp'
};

export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  SUMMARY: 'summary',
  REVIEW: 'review'
};

export const GAME_MODES = {
  HIRAGANA: 'hiragana',
  KATAKANA: 'katakana',
  BOTH: 'both',
  VOCABULARY: 'vocabulary',
  KANJI: 'kanji'
};

export const KANA_TYPES = {
  DAKUTEN: 'dakuten',
  COMBINATION: 'combination'
};

export const KANA_INCLUSION = {
  OFF: 'off',
  ADD: 'add',
  ONLY: 'only'
};

export const SORT_MODES = {
  FAILURES: 'failures',
  ALPHABETICAL: 'alphabetical',
  TIME: 'time',
  DEFAULT: 'default',
  STROKES: 'strokes'
};

export const VOCABULARY_MODES = {
  TO_JAPANESE: 'to_japanese',
  FROM_JAPANESE: 'from_japanese',
  SOUND_ONLY: 'sound_only'
};

export const KANJI_MODES = {
  ALL: 'all',
  MEANINGS_ONLY: 'meanings_only'
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
  SUCCESS_FEEDBACK_DELAY: 500,
  ERROR_FEEDBACK_DELAY: 2000
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

export const KANJI_STEPS = {
  KUN_READINGS: 1,
  ON_READINGS: 2,
  MEANINGS: 3
};

// Progress tracking API types
export const ITEM_TYPES = {
  KANJI: 'kanji',
  VOCABULARY: 'vocabulary',
  KANA: 'kana',
};

// Maps kanji step numbers to progress type strings
export const KANJI_PROGRESS_TYPES = {
  [KANJI_STEPS.KUN_READINGS]: 'kun_readings',
  [KANJI_STEPS.ON_READINGS]: 'on_readings',
  [KANJI_STEPS.MEANINGS]: 'meanings',
};
