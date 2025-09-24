export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getAllKanaForMode = (mode, kanaData) => {
  switch (mode) {
    case 'hiragana':
      return [...kanaData.hiragana];
    case 'katakana':
      return [...kanaData.katakana];
    case 'both':
      return [...kanaData.hiragana, ...kanaData.katakana];
    default:
      return [];
  }
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
