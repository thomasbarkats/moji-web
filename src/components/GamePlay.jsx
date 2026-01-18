import { Clock, Square, Sun, Moon, Volume2, Bookmark, Languages } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameActions } from '../hooks';
import { formatTime, cleanJapaneseText, speakReading } from '../utils';
import { ProgressBar } from '.';
import {
  FEEDBACK_TYPES,
  GAME_MODES,
  VOCABULARY_MODES,
  KANJI_STEPS,
} from '../constants';


export const GamePlay = () => {
  const { t } = useTranslation();
  const { handleSubmit, resetGame } = useGameActions();
  const {
    currentStep,
    stepData,
    sessionFavoritesKanji,
    toggleKanjiFavorite,
  } = useGameContextKanji();

  const {
    requiredSuccesses,
    vocabularyMode,
    showFurigana,
    handleShowFuriganaChange,
    theme,
    darkMode,
    toggleDarkMode,
    cycleSoundMode,
    getSoundModeIcon,
  } = usePreferences();

  const {
    gameMode,
    currentItem,
    userInput,
    setUserInput,
    feedback,
    progress,
    sessionStats,
    startTime,
  } = useGameContext();

  const {
    sessionFavoritesVocabulary,
    toggleVocabularyFavorite,
  } = useGameContextVocabulary();

  const { isAuthenticated } = useAuth();

  const inputRef = useRef(null);
  const [liveTime, setLiveTime] = useState(0);


  useEffect(() => {
    if (!feedback && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [feedback, currentItem]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setLiveTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);


  const handleKeyDown = (e) => {
    if ((e.key === 'Enter') && !feedback) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;
  const isKanjiMode = gameMode === GAME_MODES.KANJI;
  const isSoundOnlyMode = isVocabularyMode && currentItem?.isSoundOnly;
  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const progressPercentage = total ? (mastered / total) * 100 : 0;

  const handleReplayAudio = () => {
    if (currentItem?.speechText) {
      speakReading(currentItem.speechText, 1);
    }
  };

  const isFavoriteVocabulary = currentItem?.id ? sessionFavoritesVocabulary.has(currentItem.id) : false;
  const isFavoriteKanji = currentItem?.id ? sessionFavoritesKanji.has(currentItem.id) : false;

  const handleToggleFavorite = () => {
    if (!currentItem?.id) return;

    if (isVocabularyMode) {
      toggleVocabularyFavorite(currentItem.id);
    } else if (isKanjiMode) {
      toggleKanjiFavorite(currentItem.id);
    }
  };

  const displayCorrectAnswer = feedback && isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
    ? cleanJapaneseText(feedback.correctAnswer)
    : feedback?.correctAnswer;

  const displayKanjiTextHelperText = (currentStep) => {
    switch (currentStep) {
      case KANJI_STEPS.KUN_READINGS:
        return (
          <span>
            {t('gameplay.enterAll')}
            <span className={`px-4 py-2 mx-2 ${theme.statsBg.green} ${theme.text} rounded-lg text-md`}>kun</span>
            {t('gameplay.readings')}
          </span>
        );
      case KANJI_STEPS.ON_READINGS:
        return (
          <span>
            {t('gameplay.enterAll')}
            <span className={`px-4 py-2 mx-2 ${theme.statsBg.blue} ${theme.text} rounded-lg text-md`}>ON</span>
            {t('gameplay.readings')}
          </span>
        );
      case KANJI_STEPS.MEANINGS:
        return (
          <span>
            <span>{t('gameplay.enterMeanings')}</span>
            <br />
            <b>{t('gameplay.inReadingOrder')}</b>
          </span>
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-lg`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center space-x-2 ${theme.textSecondary}`}>
              {(isVocabularyMode || isKanjiMode) && isAuthenticated && currentItem?.id && (
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                  title={(isVocabularyMode ? isFavoriteVocabulary : isFavoriteKanji) ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
                >
                  <Bookmark
                    className={`w-5 h-5 ${(isVocabularyMode ? isFavoriteVocabulary : isFavoriteKanji) ? theme.bookmarkColor : ''}`}
                    fill={(isVocabularyMode ? isFavoriteVocabulary : isFavoriteKanji) ? "currentColor" : "none"}
                  />
                </button>
              )}
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(liveTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => cycleSoundMode(isSoundOnlyMode)}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={getSoundModeIcon().tooltip}
              >
                {getSoundModeIcon().icon}
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={darkMode ? t('gameplay.switchToLightMode') : t('gameplay.switchToDarkMode')}
              >
                {darkMode
                  ? <Sun className="w-5 h-5" />
                  : <Moon className="w-5 h-5" />
                }
              </button>
              {isVocabularyMode && vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE && (
                <button
                  onClick={() => handleShowFuriganaChange(!showFurigana)}
                  className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer relative`}
                  title={t('tooltips.toggleFurigana')}
                >
                  <Languages className="w-5 h-5" />
                  {!showFurigana && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`w-6 h-0.5 ${darkMode ? 'bg-gray-200' : 'bg-gray-600'} -rotate-45`} />
                    </div>
                  )}
                </button>
              )}
              <button
                onClick={resetGame}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer hover:text-red-500`}
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ProgressBar percentage={progressPercentage} theme={theme} />

          <div className={`flex justify-between text-sm ${theme.textSecondary}`}>
            <span>{mastered}/{total} {t('gameplay.mastered')}</span>
            <span>{totalFailures} {t('gameplay.errors')}</span>
          </div>
        </div>

        {currentItem && (
          <div className="text-center mb-8">
            <div className={`
              ${isVocabularyMode ? (vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? 'text-[2.5rem]' : 'text-[2rem]') : 'text-8xl'}
              font-light ${theme.text} select-none mb-2`}>
              {isSoundOnlyMode ? (
                <button
                  onClick={handleReplayAudio}
                  className={`p-6 ${theme.buttonSecondary} rounded-full transition-all hover:scale-110 cursor-pointer`}
                  title={t('tooltips.replayAudio')}
                >
                  <Volume2 className="w-16 h-16" />
                </button>
              ) : isVocabularyMode && vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? (
                <JapaneseTextDisplay parts={currentItem.parts} theme={theme} showFurigana={showFurigana} />
              ) : (
                currentItem.question
              )}
            </div>

            {
              isVocabularyMode &&
              vocabularyMode === VOCABULARY_MODES.TO_JAPANESE &&
              currentItem.infoText && (
                <div className={`text-sm ${theme.textMuted} mb-4 italic`}>
                  {currentItem.infoText}
                </div>
              )
            }


            {isKanjiMode && (
              <div className={`text-lg ${theme.textSecondary} pt-6 mb-2`}>
                {displayKanjiTextHelperText(currentStep)}
              </div>
            )}

            {isKanjiMode && currentStep === KANJI_STEPS.MEANINGS && (
              <KanjiReadingsChips stepData={stepData} theme={theme} />
            )}

            {feedback ? (
              <div className="pt-2 mb-6">
                {feedback.type === FEEDBACK_TYPES.SUCCESS ? (
                  <div className={`${theme.feedbackSuccess.bg} border-2 rounded-xl p-6 animate-pulse`}>
                    <div className="text-6xl mb-2">✅</div>
                    <div className={`text-2xl font-bold ${theme.feedbackSuccess.title} mb-2`}>{t('gameplay.correct')}</div>
                    <div className={`text-lg ${theme.feedbackSuccess.text}`}>"{displayCorrectAnswer}"</div>
                    {
                      isVocabularyMode &&
                      (vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE || isSoundOnlyMode) &&
                      currentItem.infoText && (
                        <div className={`text-sm ${theme.textMuted} mt-3 italic`}>
                          {currentItem.infoText}
                        </div>
                      )
                    }
                  </div>
                ) : (
                  <div className={`${theme.feedbackError.bg} border-2 rounded-xl p-6 animate-pulse`}>
                    <div className="text-6xl mb-2">❌</div>
                    <div className={`text-2xl font-bold ${theme.feedbackError.title} mb-2`}>{t('gameplay.incorrect')}</div>
                    <div className={`text-lg ${theme.feedbackError.text} mb-1`}>{t('gameplay.youWrote')} "{feedback.userAnswer}"</div>
                    <div className={`text-lg ${theme.feedbackError.title} font-semibold`}>{t('gameplay.correctAnswer')} "{displayCorrectAnswer}"</div>
                    {
                      isVocabularyMode &&
                      (vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE || isSoundOnlyMode) &&
                      currentItem.infoText && (
                        <div className={`text-sm ${theme.textMuted} mt-3 italic`}>
                          {currentItem.infoText}
                        </div>
                      )
                    }
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2 mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isKanjiMode
                      ? t('gameplay.commaSeparated')
                      : isVocabularyMode
                        ? t('gameplay.typeTranslation')
                        : t('gameplay.typeReading')
                  }
                  className={`w-full text-2xl text-center py-4 px-6 border-2 ${theme.inputBorder} ${theme.inputBg} ${theme.text} rounded-xl focus:ring-4 focus:ring-blue-200 outline-none transition-all`}
                  autoComplete="off"
                  disabled={feedback !== null}
                />
              </div>
            )}

            {!feedback && (
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
              >
                {t('gameplay.validate')}
              </button>
            )}

            {!feedback && !userInput.trim() && (
              <button
                onClick={() => handleSubmit(true)}
                className={`ml-2 font-semibold py-3 px-8 rounded-xl ${theme.buttonSkip} ransform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
              >
                {t('gameplay.skip')}
              </button>
            )}

            <div className={`mt-4 text-sm ${theme.textMuted}`}>
              {t('titles.success')}: {progress[currentItem.question]?.successes || 0}/{requiredSuccesses} | {t('titles.errors')}: {progress[currentItem.question]?.failures || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const JapaneseTextDisplay = ({ parts, theme, showFurigana = true }) => {
  if (!parts) return null;

  return (
    <span className="inline-block">
      {parts.map((part, idx) => {
        if (part.type === 'kanji') {
          return (
            <span key={idx} className="inline-block align-bottom text-center">
              {showFurigana && (
                <span className={`block text-sm ${theme.textMuted}`}>
                  {part.reading}
                </span>
              )}
              <span className="block">
                {part.text}
              </span>
            </span>
          );
        }
        if (part.type === 'optional') {
          return (
            <span key={idx} className={theme.textMuted}>
              {part.text}
            </span>
          );
        }
        return (
          <span key={idx}>
            {part.text}
          </span>
        );
      })}
    </span>
  );
};

const KanjiReadingsChips = ({ stepData, theme }) => {
  const groups = stepData.readingGroups || [];

  return (
    <div className="pt-2 w-full overflow-x-auto">
      <div className={`inline-flex flex-col gap-2 min-w-full border-2 ${theme.border} rounded-xl p-2`}>
        {/* Row for KUN readings */}
        <div className="flex gap-2">
          {groups.map((group, groupIdx) => (
            <div key={`kun-group-${groupIdx}`} className="flex items-end gap-2">
              {/* Column of KUN chips for this group */}
              <div className="flex flex-col gap-1">
                {group.kun ? (
                  group.kun.map((reading, readingIdx) => (
                    <span
                      key={`kun-${groupIdx}-${readingIdx}`}
                      className={`inline-flex items-center justify-center w-20 h-8 ${theme.statsBg.green} ${theme.text} rounded-lg text-sm`}
                    >
                      {reading}
                    </span>
                  ))
                ) : (
                  <span className={`inline-flex items-center justify-center w-20 h-8 ${theme.emptyBg} rounded-lg`}>
                  </span>
                )}
              </div>
              {/* Separator line */}
              {groupIdx < groups.length - 1 && (
                <div className={`w-px self-stretch ${theme.borderColor || 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Row for ON readings */}
        <div className="flex gap-2">
          {groups.map((group, groupIdx) => (
            <div key={`on-group-${groupIdx}`} className="flex items-top gap-2">
              {/* Column of ON chips for this group */}
              <div className="flex flex-col gap-1">
                {group.on ? (
                  group.on.map((reading, readingIdx) => (
                    <span
                      key={`on-${groupIdx}-${readingIdx}`}
                      className={`inline-flex items-center justify-center w-20 h-8 ${theme.statsBg.blue} ${theme.text} rounded-lg text-sm`}
                    >
                      {reading}
                    </span>
                  ))
                ) : (
                  <span className={`inline-flex items-center justify-center w-20 h-8 ${theme.emptyBg} rounded-lg`}>
                  </span>
                )}
              </div>
              {/* Separator line */}
              {groupIdx < groups.length - 1 && (
                <div className={`w-px self-stretch ${theme.borderColor || 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
