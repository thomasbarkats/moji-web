import confetti from 'canvas-confetti';
import { GAME_MODES, GAME_STATES, KANA_INCLUSION, VOCABULARY_MODES } from '../constants';


// ============================================
// KANA COLLECTION
// ============================================

export const getAllKanaForMode = (mode, kanaData, options = {}) => {
  const { dakutenMode = KANA_INCLUSION.OFF, combinationsMode = KANA_INCLUSION.OFF } = options;
  let result = [];

  const includeBasics = dakutenMode !== KANA_INCLUSION.ONLY && combinationsMode !== KANA_INCLUSION.ONLY;

  const includeBasicHiragana = mode === GAME_MODES.HIRAGANA || mode === GAME_MODES.BOTH;
  const includeBasicKatakana = mode === GAME_MODES.KATAKANA || mode === GAME_MODES.BOTH;

  if (includeBasics) {
    if (includeBasicHiragana) result = [...result, ...kanaData.hiragana];
    if (includeBasicKatakana) result = [...result, ...kanaData.katakana];
  }

  if (dakutenMode !== KANA_INCLUSION.OFF) {
    if (includeBasicHiragana) result = [...result, ...kanaData.hiraganaDakuten];
    if (includeBasicKatakana) result = [...result, ...kanaData.katakanaDakuten];
  }

  if (combinationsMode !== KANA_INCLUSION.OFF) {
    if (includeBasicHiragana) result = [...result, ...kanaData.hiraganaCombinations];
    if (includeBasicKatakana) result = [...result, ...kanaData.katakanaCombinations];
  }

  return result;
};

// ============================================
// DATA INITIALIZATION
// ============================================

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
      id: kana.id,
      key: kana.char,
      title: kana.char,
      subtitle: kana.reading,
      successes: 0,
      failures: 0,
      timeSpent: 0
    };
  });

  return { initialProgress, initialStats };
};

export const initializeKanjiData = (kanjiArray) => {
  const initialProgress = {};
  const initialStats = {};

  kanjiArray.forEach(kanji => {
    const key = kanji.character;

    initialProgress[key] = {
      successes: 0,
      failures: 0,
      mastered: false,
      lastSeen: null
    };
    initialStats[key] = {
      id: kanji.id,
      key,
      title: kanji.character,
      subtitle: '',
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
    const key = word.jp;
    initialProgress[key] = {
      successes: 0,
      failures: 0,
      mastered: false,
      lastSeen: null
    };
    initialStats[key] = {
      id: word.id,
      key: word.jp,
      title: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? word.translation
        : word.cleanedJp,
      subtitle: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? word.cleanedJp
        : word.translation,
      successes: 0,
      failures: 0,
      timeSpent: 0
    };
  });

  return { initialProgress, initialStats };
};

export const initializeGameState = (setters, mode) => {
  const { setGameMode, setGameState, setUserInput, setStartTime, setFeedback } = setters;

  setGameMode(mode);
  setGameState(GAME_STATES.PLAYING);
  setUserInput('');
  setStartTime(Date.now());
  setFeedback(null);
};

// ============================================
// ITEM SELECTION
// ============================================

const getItemKey = (item) => item.char || item.jp || item.character;

const calculateWeight = (lastSeen) => {
  if (!lastSeen) return 10;

  const timeSinceLastSeen = Date.now() - lastSeen;
  const minutesAgo = timeSinceLastSeen / (1000 * 60);

  return Math.min(10, 1 + (minutesAgo / 5) * 9);
};

export const selectNextItem = (availableItems, currentProgress, currentItemKey = null) => {
  if (availableItems.length === 0) return null;
  if (availableItems.length === 1) return availableItems[0];

  let candidates = availableItems;
  if (currentItemKey && availableItems.length > 1) {
    const filtered = availableItems.filter(item => getItemKey(item) !== currentItemKey);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  const itemsWithWeights = candidates.map(item => {
    const key = getItemKey(item);
    const lastSeen = currentProgress[key]?.lastSeen;
    const weight = calculateWeight(lastSeen);
    return { item, weight };
  });

  const totalWeight = itemsWithWeights.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of itemsWithWeights) {
    random -= weight;
    if (random <= 0) {
      return item;
    }
  }

  return itemsWithWeights[itemsWithWeights.length - 1].item;
};

export const finalizeItemSelection = (item, key, setters, refs) => {
  const { setCurrentItem, setUserInput, setFeedback, setProgress } = setters;
  const { currentItemStartRef } = refs;

  setCurrentItem(item);
  setUserInput('');
  setFeedback(null);
  currentItemStartRef.current = Date.now();

  setProgress(prev => ({
    ...prev,
    [key]: {
      ...prev[key],
      lastSeen: Date.now()
    }
  }));
};

// ============================================
// OTHERS
// ============================================

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};
