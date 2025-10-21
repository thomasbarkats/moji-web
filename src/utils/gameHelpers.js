import { GAME_MODES, KANA_INCLUSION, VOCABULARY_MODES } from '../constants';


export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getAllKanaForMode = (mode, kanaData, options = {}) => {
  const { dakutenMode = KANA_INCLUSION.OFF, combinationsMode = KANA_INCLUSION.OFF } = options;
  let result = [];

  // Check if we should include basic kana
  const includeBasics = dakutenMode !== KANA_INCLUSION.ONLY && combinationsMode !== KANA_INCLUSION.ONLY;

  // Determine base kana sets
  const includeBasicHiragana = mode === GAME_MODES.HIRAGANA || mode === GAME_MODES.BOTH;
  const includeBasicKatakana = mode === GAME_MODES.KATAKANA || mode === GAME_MODES.BOTH;

  // Add basic kana if needed
  if (includeBasics) {
    if (includeBasicHiragana) result = [...result, ...kanaData.hiragana];
    if (includeBasicKatakana) result = [...result, ...kanaData.katakana];
  }

  // Add dakuten if needed
  if (dakutenMode !== KANA_INCLUSION.OFF) {
    if (includeBasicHiragana) {
      result = [...result, ...kanaData.hiraganaDakuten];
    }
    if (includeBasicKatakana) {
      result = [...result, ...kanaData.katakanaDakuten];
    }
  }

  // Add combinations if needed
  if (combinationsMode !== KANA_INCLUSION.OFF) {
    if (includeBasicHiragana) {
      result = [...result, ...kanaData.hiraganaCombinations];
    }
    if (includeBasicKatakana) {
      result = [...result, ...kanaData.katakanaCombinations];
    }
  }

  return result;
};

export const initializeKanaData = (kanaArray) => {
  const initialProgress = {};
  const initialStats = {};

  kanaArray.forEach(kana => {
    initialProgress[kana.char] = {
      successes: 0,
      failures: 0,
      mastered: false,
      lastSeen: null
    };
    initialStats[kana.char] = {
      key: kana.char,
      question: kana.char,
      answer: kana.reading,
      successes: 0,
      failures: 0,
      timeSpent: 0
    };
  });

  return { initialProgress, initialStats };
};

export const initializeVocabularyData = (words, vocabularyMode) => {
  const initialProgress = {};
  const initialStats = {};

  words.forEach(word => {
    const key = word.japanese;
    initialProgress[key] = {
      successes: 0,
      failures: 0,
      mastered: false
    };
    initialStats[key] = {
      key: word.japanese,
      question: vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? word.japanese : word.translation,
      answer: vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? word.translation : word.japanese,
      successes: 0,
      failures: 0,
      timeSpent: 0
    };
  });

  return { initialProgress, initialStats };
};

const getItemKey = (item) => item.char || item.japanese || item.character;

/**
 * Calculate weight based on time since last seen
 * Never seen = max weight
 * Recently seen = lower weight
 * Long time ago = higher weight
 */
const calculateWeight = (lastSeen) => {
  if (!lastSeen) return 10; // Never seen gets max weight

  const timeSinceLastSeen = Date.now() - lastSeen;
  const minutesAgo = timeSinceLastSeen / (1000 * 60);

  // Weight increases with time: 1 at 0 min, 10 at 5+ min
  return Math.min(10, 1 + (minutesAgo / 5) * 9);
};

/**
 * Weighted random selection
 * Items not seen for longer get higher probability
 */
export const selectNextItem = (availableItems, currentProgress, currentItemKey = null) => {
  if (availableItems.length === 0) return null;
  if (availableItems.length === 1) return availableItems[0];

  // Filter out current item to avoid consecutive repeats
  let candidates = availableItems;
  if (currentItemKey && availableItems.length > 1) {
    const filtered = availableItems.filter(item => getItemKey(item) !== currentItemKey);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  // Calculate weights for all candidates
  const itemsWithWeights = candidates.map(item => {
    const key = getItemKey(item);
    const lastSeen = currentProgress[key]?.lastSeen;
    const weight = calculateWeight(lastSeen);
    return { item, weight };
  });

  // Weighted random selection
  const totalWeight = itemsWithWeights.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of itemsWithWeights) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback (should never reach here)
  return itemsWithWeights[itemsWithWeights.length - 1].item;
};
