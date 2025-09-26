import { TINT_CONFIG, SORT_MODES } from '../constants';


export const calculateTintStyle = (kana, allStats, sortBy, requiredSuccesses) => {
  const failures = kana.failures || 0;
  const timeSpent = kana.timeSpent || 0;
  const timeThreshold = requiredSuccesses + 1;

  switch (sortBy) {
    case SORT_MODES.FAILURES:
      if (failures === 0) return {};
      const alpha = Math.min(TINT_CONFIG.MAX_ALPHA, 0.04 + 0.02 * failures);
      return { backgroundColor: `rgba(${TINT_CONFIG.COLORS.RED.r}, ${TINT_CONFIG.COLORS.RED.g}, ${TINT_CONFIG.COLORS.RED.b}, ${alpha})` };

    case SORT_MODES.TIME:
      if (timeSpent <= timeThreshold) return {};
      const adjustedTimeSpent = timeSpent - timeThreshold;
      const maxTime = Math.max(...allStats.map(s => Math.max(0, (s.timeSpent || 0) - timeThreshold)));
      const timeAlpha = maxTime > 0 ? Math.min(TINT_CONFIG.MAX_ALPHA, (adjustedTimeSpent / maxTime) * TINT_CONFIG.MAX_ALPHA) : 0;
      return { backgroundColor: `rgba(${TINT_CONFIG.COLORS.PURPLE.r}, ${TINT_CONFIG.COLORS.PURPLE.g}, ${TINT_CONFIG.COLORS.PURPLE.b}, ${timeAlpha})` };

    case SORT_MODES.ALPHABETICAL:
      if (failures === 0 && timeSpent <= timeThreshold) return {};
      const adjustedTimeForCombined = Math.max(0, timeSpent - timeThreshold);
      const maxTimeForNormalization = Math.max(...allStats.map(s => Math.max(0, (s.timeSpent || 0) - timeThreshold)));
      const maxFailures = Math.max(...allStats.map(s => s.failures || 0));
      const normalizedTime = maxTimeForNormalization > 0 ? adjustedTimeForCombined / maxTimeForNormalization : 0;
      const normalizedFailures = maxFailures > 0 ? failures / maxFailures : 0;
      const combinedScore = (normalizedFailures * TINT_CONFIG.ERROR_WEIGHT) + (normalizedTime * TINT_CONFIG.TIME_WEIGHT);
      if (combinedScore === 0) return {};
      const combinedAlpha = Math.min(TINT_CONFIG.MAX_ALPHA, combinedScore * TINT_CONFIG.MAX_ALPHA);
      const red = Math.round(TINT_CONFIG.COLORS.RED.r - (127 * combinedScore));
      const purple = Math.round(TINT_CONFIG.COLORS.PURPLE.r * combinedScore);
      return { backgroundColor: `rgba(${red}, 0, ${purple}, ${combinedAlpha})` };

    default:
      return {};
  }
};

export const getSortedStats = (sessionStats, sortBy) => {
  const stats = Object.values(sessionStats);

  switch (sortBy) {
    case SORT_MODES.FAILURES:
      return [...stats].sort((a, b) => {
        const failuresDiff = (b.failures || 0) - (a.failures || 0);
        if (failuresDiff !== 0) return failuresDiff;
        const aText = a.question || a.char || '';
        const bText = b.question || b.char || '';
        return aText.localeCompare(bText);
      });
    case SORT_MODES.ALPHABETICAL:
      return [...stats].sort((a, b) => {
        const aText = a.question || a.char || '';
        const bText = b.question || b.char || '';
        return aText.localeCompare(bText);
      });
    case SORT_MODES.TIME:
      return [...stats].sort((a, b) => {
        const timeDiff = (b.timeSpent || 0) - (a.timeSpent || 0);
        if (timeDiff !== 0) return timeDiff;
        const aText = a.question || a.char || '';
        const bText = b.question || b.char || '';
        return aText.localeCompare(bText);
      });
    default:
      return stats;
  }
};

export const getTotalStats = (sessionStats, progress) => {
  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const elapsedTimeSeconds = Object.values(sessionStats).reduce((sum, s) => sum + (s.timeSpent || 0), 0);

  return { total, mastered, totalFailures, elapsedTime: elapsedTimeSeconds };
};
