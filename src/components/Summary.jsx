import { Trophy, Target, BarChart3, Clock, ChevronDown } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from '../contexts/I18nContext';
import { Button, StatsCard } from '.';
import { formatTime } from '../utils';
import { calculateTintStyle } from '../services/statsService';
import { GAME_MODES } from '../constants';


export const Summary = ({ onNewSession, onRestartSameMode, sortedStats }) => {
  const { t } = useTranslation();
  const { gameMode, sessionStats, sortBy, setSortBy } = useGameContext();
  const { requiredSuccesses, theme } = usePreferences();


  const total = Object.values(sessionStats).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const elapsedTime = Object.values(sessionStats).reduce((sum, s) => sum + (s.timeSpent || 0), 0);
  const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;
  const isKanjiMode = gameMode === GAME_MODES.KANJI;


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

  return (
    <div className={`min-h-screen ${theme.bg} p-4 flex items-center -mb-8`}>
      <div className="w-full max-w-4xl mx-auto">
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>{t('summary.congratulations')}</h2>
            <p className={theme.textSecondary}>{getFinalSummaryText()}</p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sortedStats.map((item) => {
              const bgStyle = calculateTintStyle(item, Object.values(sessionStats), sortBy, requiredSuccesses, isVocabularyMode);

              return (
                <div
                  key={item.key}
                  className={`rounded-lg p-4 transition-colors duration-200 ${item.infoText ? 'cursor-help' : ''}`}
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
                  <div className={`flex justify-between items-center text-sm ${theme.textMuted}`}>
                    <span>{formatTime(item.timeSpent || 0)}</span>
                    {(item.failures || 0) > 0 ? <span>✗ {item.failures}</span> : <span></span>}
                  </div>
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
