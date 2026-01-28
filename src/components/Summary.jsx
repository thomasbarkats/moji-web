import { Trophy, Target, BarChart3, Clock, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GAME_MODES, ITEM_TYPES, KANJI_PROGRESS_TYPES, KANJI_STEPS, KANJI_MODES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useProgress } from '../hooks';
import { calculateTintStyle } from '../services/statsService';
import { formatTime, triggerConfetti } from '../utils';
import { Button, StatsCard, ScoreProgressBar } from '.';
import { ReviewProgressHeader } from './ui/ReviewProgressHeader';


export const Summary = ({ onNewSession, onRestartSameMode, sortedStats }) => {
  const { t } = useTranslation();
  const { gameMode, sessionStats, sortBy, setSortBy, stoppedEarly } = useGameContext();
  const { requiredSuccesses, theme, vocabularyMode, darkMode, kanjiMode } = usePreferences();
  const { hasActiveSubscription, hasLifetimeAccess } = useAuth();
  const haveAccess = hasActiveSubscription || hasLifetimeAccess;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine item type for progress fetching
  const itemType = gameMode === GAME_MODES.VOCABULARY
    ? ITEM_TYPES.VOCABULARY
    : gameMode === GAME_MODES.KANJI
      ? ITEM_TYPES.KANJI
      : ITEM_TYPES.KANA;

  const { getProgress } = useProgress(itemType);

  // Helper function to calculate kanji score
  // In meanings_only mode: return only meanings score
  // In all mode: return average of kun, on, and meanings scores
  const getKanjiScore = (itemId) => {
    if (!itemId) return 0;

    if (kanjiMode === KANJI_MODES.MEANINGS_ONLY) {
      const meaningsProgress = getProgress(itemId, KANJI_PROGRESS_TYPES[KANJI_STEPS.MEANINGS]);
      return meaningsProgress?.score || 0;
    }

    // Mode ALL: calculate average of kun, on, and meanings
    const kunProgress = getProgress(itemId, KANJI_PROGRESS_TYPES[KANJI_STEPS.KUN]);
    const onProgress = getProgress(itemId, KANJI_PROGRESS_TYPES[KANJI_STEPS.ON]);
    const meaningsProgress = getProgress(itemId, KANJI_PROGRESS_TYPES[KANJI_STEPS.MEANINGS]);

    const kunScore = kunProgress?.score || 0;
    const onScore = onProgress?.score || 0;
    const meaningsScore = meaningsProgress?.score || 0;

    // Calculate average and round to nearest integer
    return Math.round((kunScore + onScore + meaningsScore) / 3);
  };

  // Trigger confetti only when session is completed normally (not stopped early)
  useEffect(() => {
    if (!stoppedEarly) {
      triggerConfetti();
    }
  }, [stoppedEarly]);

  // Handle Escape key to return to menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isModalOpen) {
        onNewSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewSession, isModalOpen]);

  const total = Object.values(sessionStats).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const elapsedTime = Object.values(sessionStats).reduce((sum, s) => sum + (s.timeSpent || 0), 0);
  const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;
  const isKanjiMode = gameMode === GAME_MODES.KANJI;
  const isKanaMode = !isVocabularyMode || !isKanjiMode;


  const getFinalSummaryText = () => {
    if (isVocabularyMode) {
      return t('summary.masteredVocabulary');
    }
    if (isKanjiMode) {
      return t('summary.masteredKanji');
    }
    switch (gameMode) {
      case GAME_MODES.HIRAGANA:
        return t('summary.masteredHiragana');
      case GAME_MODES.KATAKANA:
        return t('summary.masteredKatakana');
      case GAME_MODES.BOTH:
        return t('summary.masteredKana');
      default:
        return t('summary.sessionCompleted');
    }
  };

  const getStudyLabel = () => {
    if (isVocabularyMode) return t('summary.wordsStudied');
    if (isKanjiMode) return t('summary.kanjiStudied');
    return t('summary.kanaStudied');
  };

  const getBreakdownTitle = () => {
    if (isVocabularyMode) return t('summary.breakdownByWord');
    if (isKanjiMode) return t('summary.breakdownByKanji');
    return t('summary.breakdownByKana');
  };

  const getSortOptions = () => {
    const baseOptions = [
      { value: 'failures', label: t('summary.sortByErrors') },
      { value: 'time', label: t('summary.sortByTime') }
    ];

    if (isVocabularyMode) {
      return [
        ...baseOptions,
        { value: 'alphabetical', label: t('summary.sortByWord') }
      ];
    } else if (isKanjiMode) {
      return [
        ...baseOptions,
        { value: 'alphabetical', label: t('summary.sortByKanji') }
      ];
    } else {
      return [
        ...baseOptions,
        { value: 'alphabetical', label: t('summary.sortByKana') }
      ];
    }
  };

  const renderGlobalProgressHeader = () => {
    // Calculate global progress for items in this session
    const allItems = Object.values(sessionStats);
    const totalItems = allItems.length;

    // Count mastered items (score === 5)
    const masteredItems = allItems.filter(item => {
      if (!item.id) return false;

      let score;
      if (isKanjiMode) {
        score = getKanjiScore(item.id);
      } else if (isVocabularyMode) {
        const progress = getProgress(item.id, vocabularyMode);
        score = progress?.score || 0;
      } else {
        const progress = getProgress(item.id, 'kana');
        score = progress?.score || 0;
      }

      return score === 5;
    }).length;

    const progressPercentage = totalItems > 0 ? (masteredItems / totalItems) * 100 : 0;

    // Determine the label for items
    const itemLabel = isVocabularyMode
      ? t('common.words')
      : isKanjiMode
        ? t('common.kanji')
        : t('common.kana');

    return (
      <ReviewProgressHeader
        theme={theme}
        darkMode={darkMode}
        progressPercentage={progressPercentage}
        haveAccess={isKanaMode || haveAccess}
        onModalOpenChange={setIsModalOpen}
      >
        <span>{masteredItems} {itemLabel} / {totalItems} {t('review.mastered')}</span>
      </ReviewProgressHeader>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 flex items-center -mb-8`}>
      <div className="w-full max-w-4xl mx-auto">
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>
          {!stoppedEarly && (
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>{t('summary.congratulations')}</h2>
              <p className={theme.textSecondary}>{getFinalSummaryText()}</p>
            </div>
          )}

          {stoppedEarly && (
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>{t('summary.title')}</h2>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard
              icon={<Target className={`w-8 h-8 ${theme.statsText.blue} mx-auto mb-2`} />}
              value={total}
              label={getStudyLabel()}
              bgColor={theme.statsBg.blue}
              textColor={theme.statsText.blue}
            />
            <StatsCard
              icon={<BarChart3 className={`w-8 h-8 ${theme.statsText.red} mx-auto mb-2`} />}
              value={totalFailures}
              label={t('summary.totalErrors')}
              bgColor={theme.statsBg.red}
              textColor={theme.statsText.red}
            />
            <StatsCard
              icon={<Clock className={`w-8 h-8 ${theme.statsText.green} mx-auto mb-2`} />}
              value={formatTime(elapsedTime)}
              label={t('summary.totalTime')}
              bgColor={theme.statsBg.green}
              textColor={theme.statsText.green}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${theme.text}`}>{getBreakdownTitle()}</h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none ${theme.sectionBg} ${theme.border} ${theme.text} rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          {renderGlobalProgressHeader()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sortedStats.map((item) => {
              const bgStyle = calculateTintStyle(item, Object.values(sessionStats), sortBy, requiredSuccesses, isVocabularyMode);
              const isPracticed = item.timeSpent > 0;

              // Get progress for this item
              let progressScore = 0;
              const canShowProgress = isKanaMode || haveAccess;
              if (canShowProgress && item.id) {
                if (isKanjiMode) {
                  progressScore = getKanjiScore(item.id);
                } else if (isVocabularyMode) {
                  const vocabProgress = getProgress(item.id, vocabularyMode);
                  progressScore = vocabProgress?.score || 0;
                } else {
                  const kanaProgress = getProgress(item.id, 'kana');
                  progressScore = kanaProgress?.score || 0;
                }
              }

              return (
                <div
                  key={item.key}
                  className={`rounded-lg p-4 transition-colors duration-200 ${item.infoText ? 'cursor-help' : ''} ${!isPracticed ? 'opacity-50' : ''}`}
                  style={bgStyle}
                  title={item.infoText || ''}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${isVocabularyMode ? 'text-md font-medium' : 'text-3xl'} ${theme.text}`}>
                      {item.title}
                    </span>
                    <span className={`text-sm ${theme.textSecondary} ${isVocabularyMode ? 'max-w-[50%] text-right' : ''}`}>
                      {item.subtitle}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center text-sm ${theme.textMuted} mb-2`}>
                    {isPracticed && <span>{formatTime(item.timeSpent || 0)}</span>}
                    {!isPracticed && <span></span>}
                    {(item.failures || 0) > 0 ? <span>✗ {item.failures}</span> : <span></span>}
                  </div>
                  {canShowProgress && (
                    <div className="mt-2">
                      <ScoreProgressBar score={progressScore} theme={theme} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onNewSession} variant="primary">
              {t('summary.newSession')}
            </Button>
            <Button onClick={onRestartSameMode} variant="success">
              {t('summary.restartSameMode')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
