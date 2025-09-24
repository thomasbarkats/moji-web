export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getAllKanaForMode = (mode, kanaData, options = {}) => {
  const { includeDakuten = false, includeCombinations = false } = options;
  let result = [];

  switch (mode) {
    case 'hiragana':
      result = [...kanaData.hiragana];
      if (includeDakuten && kanaData.hiraganaDakuten) {
        result = [...result, ...kanaData.hiraganaDakuten];
      }
      if (includeCombinations && kanaData.hiraganaCombinations) {
        result = [...result, ...kanaData.hiraganaCombinations];
      }
      break;
    case 'katakana':
      result = [...kanaData.katakana];
      if (includeDakuten && kanaData.katakanaDakuten) {
        result = [...result, ...kanaData.katakanaDakuten];
      }
      if (includeCombinations && kanaData.katakanaCombinations) {
        result = [...result, ...kanaData.katakanaCombinations];
      }
      break;
    case 'both':
      result = [...kanaData.hiragana, ...kanaData.katakana];
      if (includeDakuten) {
        if (kanaData.hiraganaDakuten) result = [...result, ...kanaData.hiraganaDakuten];
        if (kanaData.katakanaDakuten) result = [...result, ...kanaData.katakanaDakuten];
      }
      if (includeCombinations) {
        if (kanaData.hiraganaCombinations) result = [...result, ...kanaData.hiraganaCombinations];
        if (kanaData.katakanaCombinations) result = [...result, ...kanaData.katakanaCombinations];
      }
      break;
    default:
      return [];
  }

  return result;
};

export const initializeKanaData = (allKana) => {
  const initialProgress = {};
  const initialStats = {};

  allKana.forEach(kana => {
    initialProgress[kana.char] = { successes: 0, failures: 0, mastered: false };
    initialStats[kana.char] = { ...kana, failures: 0, successes: 0, timeSpent: 0 };
  });

  return { initialProgress, initialStats };
};
