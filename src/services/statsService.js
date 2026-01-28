import { TINT_CONFIG, SORT_MODES } from '../constants';


// ============================================
// COLOR CALCULATION
// ============================================

const createTintStyle = (r, g, b, alpha) => {
  if (alpha === 0) return {};
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})` };
};

const getAnswerComplexity = (stat) => {
  // For kanji: use dedicated fields
  if (stat.kun !== undefined && stat.on !== undefined && stat.meanings !== undefined) {
    return stat.kun.length + stat.on.length + stat.meanings.length;
  }

  // For vocabulary and kana: use answer length
  return (stat.answer || '').length;
};

const calculateTimeThreshold = (stat, requiredSuccesses) => {
  const baseThreshold = requiredSuccesses + 1;
  const complexity = getAnswerComplexity(stat);

  // 1 second per 10 characters (adjustable)
  const CHARS_PER_SECOND = 10;
  const complexityBonus = Math.floor(complexity / CHARS_PER_SECOND);

  return baseThreshold + complexityBonus;
};

const calculateFailureTint = (failures) => {
  if (failures === 0) return {};
  const alpha = Math.min(TINT_CONFIG.MAX_ALPHA, 0.04 + 0.02 * failures);
  const { r, g, b } = TINT_CONFIG.COLORS.RED;
  return createTintStyle(r, g, b, alpha);
};

const calculateTimeTint = (stat, allStats, requiredSuccesses) => {
  const timeThreshold = calculateTimeThreshold(stat, requiredSuccesses);
  const timeSpent = stat.timeSpent || 0;

  if (timeSpent <= timeThreshold) return {};

  const adjustedTimeSpent = timeSpent - timeThreshold;

  const maxTime = Math.max(...allStats.map(s => {
    const threshold = calculateTimeThreshold(s, requiredSuccesses);
    return Math.max(0, (s.timeSpent || 0) - threshold);
  }));

  if (maxTime === 0) return {};

  const timeAlpha = Math.min(TINT_CONFIG.MAX_ALPHA, (adjustedTimeSpent / maxTime) * TINT_CONFIG.MAX_ALPHA);
  const { r, g, b } = TINT_CONFIG.COLORS.PURPLE;
  return createTintStyle(r, g, b, timeAlpha);
};

const calculateCombinedTint = (stat, allStats, requiredSuccesses) => {
  const failures = stat.failures || 0;
  const timeSpent = stat.timeSpent || 0;
  const timeThreshold = calculateTimeThreshold(stat, requiredSuccesses);

  if (failures === 0 && timeSpent <= timeThreshold) return {};

  const adjustedTime = Math.max(0, timeSpent - timeThreshold);
  const maxTimeForNormalization = Math.max(...allStats.map(s => {
    const threshold = calculateTimeThreshold(s, requiredSuccesses);
    return Math.max(0, (s.timeSpent || 0) - threshold);
  }));
  const maxFailures = Math.max(...allStats.map(s => s.failures || 0));

  const normalizedTime = maxTimeForNormalization > 0 ? adjustedTime / maxTimeForNormalization : 0;
  const normalizedFailures = maxFailures > 0 ? failures / maxFailures : 0;

  const combinedScore = (normalizedFailures * TINT_CONFIG.ERROR_WEIGHT) + (normalizedTime * TINT_CONFIG.TIME_WEIGHT);

  if (combinedScore === 0) return {};

  const combinedAlpha = Math.min(TINT_CONFIG.MAX_ALPHA, combinedScore * TINT_CONFIG.MAX_ALPHA);
  const red = Math.round(TINT_CONFIG.COLORS.RED.r - (127 * combinedScore));
  const purple = Math.round(TINT_CONFIG.COLORS.PURPLE.r * combinedScore);

  return createTintStyle(red, 0, purple, combinedAlpha);
};

export const calculateTintStyle = (kana, allStats, sortBy, requiredSuccesses) => {
  const failures = kana.failures || 0;

  switch (sortBy) {
    case SORT_MODES.FAILURES:
      return calculateFailureTint(failures);

    case SORT_MODES.TIME:
      return calculateTimeTint(kana, allStats, requiredSuccesses);

    case SORT_MODES.ALPHABETICAL:
      return calculateCombinedTint(kana, allStats, requiredSuccesses);

    default:
      return {};
  }
};

// ============================================
// SORTING
// ============================================

const getTextForSort = (stat) => {
  return stat.question || stat.char || '';
};

const compareByText = (a, b) => {
  return getTextForSort(a).localeCompare(getTextForSort(b));
};

const sortByFailures = (stats) => {
  // Separate practiced (timeSpent > 0) from unpracticed (timeSpent === 0)
  const practiced = stats.filter(s => (s.timeSpent || 0) > 0);
  const unpracticed = stats.filter(s => (s.timeSpent || 0) === 0);

  // Sort practiced items by failures
  const sortedPracticed = practiced.sort((a, b) => {
    const failuresDiff = (b.failures || 0) - (a.failures || 0);
    if (failuresDiff !== 0) return failuresDiff;
    return compareByText(a, b);
  });

  // Sort unpracticed items alphabetically
  const sortedUnpracticed = unpracticed.sort(compareByText);

  // Return practiced first, then unpracticed
  return [...sortedPracticed, ...sortedUnpracticed];
};

const sortByTime = (stats) => {
  // Separate practiced (timeSpent > 0) from unpracticed (timeSpent === 0)
  const practiced = stats.filter(s => (s.timeSpent || 0) > 0);
  const unpracticed = stats.filter(s => (s.timeSpent || 0) === 0);

  // Sort practiced items by time
  const sortedPracticed = practiced.sort((a, b) => {
    const timeDiff = (b.timeSpent || 0) - (a.timeSpent || 0);
    if (timeDiff !== 0) return timeDiff;
    return compareByText(a, b);
  });

  // Sort unpracticed items alphabetically
  const sortedUnpracticed = unpracticed.sort(compareByText);

  // Return practiced first, then unpracticed
  return [...sortedPracticed, ...sortedUnpracticed];
};

const sortAlphabetically = (stats) => {
  // Separate practiced (timeSpent > 0) from unpracticed (timeSpent === 0)
  const practiced = stats.filter(s => (s.timeSpent || 0) > 0);
  const unpracticed = stats.filter(s => (s.timeSpent || 0) === 0);

  // Sort both groups alphabetically
  const sortedPracticed = practiced.sort(compareByText);
  const sortedUnpracticed = unpracticed.sort(compareByText);

  // Return practiced first, then unpracticed
  return [...sortedPracticed, ...sortedUnpracticed];
};

const enrichStatsWithVocabulary = (sessionStats, currentVocabularyWords) => {
  return Object.values(sessionStats).map(stat => {
    const vocabularyItem = currentVocabularyWords.find(word => word.jp === stat.key);
    return {
      ...stat,
      infoText: vocabularyItem?.infoText || null,
    };
  });
};

export const getSortedStats = (sessionStats, sortBy, currentVocabularyWords = []) => {
  const stats = enrichStatsWithVocabulary(sessionStats, currentVocabularyWords);

  switch (sortBy) {
    case SORT_MODES.FAILURES:
      return sortByFailures(stats);

    case SORT_MODES.ALPHABETICAL:
      return sortAlphabetically(stats);

    case SORT_MODES.TIME:
      return sortByTime(stats);

    default:
      return stats;
  }
};

// ============================================
// AGGREGATION
// ============================================

export const getTotalStats = (sessionStats, progress) => {
  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const elapsedTimeSeconds = Object.values(sessionStats).reduce((sum, s) => sum + (s.timeSpent || 0), 0);

  return {
    total,
    mastered,
    totalFailures,
    elapsedTime: elapsedTimeSeconds
  };
};
