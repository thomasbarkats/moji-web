import { useRef, useEffect, useState } from 'react';
import { Clock, RefreshCw, Sun, Moon } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useKanjiGameContext } from '../contexts/KanjiGameContext';
import { useGameActions } from '../hooks';
import { ProgressBar } from '.';
import { formatTime, cleanJapaneseText, getChipsForMeaningsStep } from '../utils';
import {
  FEEDBACK_TYPES,
  GAME_MODES,
  VOCABULARY_MODES,
  KANJI_STEPS,
} from '../constants';


export const GamePlay = () => {
  const { handleSubmit, resetGame } = useGameActions();
  const { currentStep, stepData } = useKanjiGameContext();

  const {
    requiredSuccesses,
    vocabularyMode,
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
  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const progressPercentage = total ? (mastered / total) * 100 : 0;

  const displayCorrectAnswer = feedback && isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
    ? cleanJapaneseText(feedback.correctAnswer)
    : feedback?.correctAnswer;

  const displayKanjiTextHelperText = (currentStep) => {
    switch (currentStep) {
      case KANJI_STEPS.KUN_READINGS:
        return (
          <span>
            Enter all
            <span className={`px-4 py-2 mx-2 ${theme.statsBg.green} ${theme.text} rounded-lg text-md`}>kun</span>
            readings
          </span>
        );
      case KANJI_STEPS.ON_READINGS:
        return (
          <span>
            Enter all
            <span className={`px-4 py-2 mx-2 ${theme.statsBg.blue} ${theme.text} rounded-lg text-md`}>ON</span>
            readings
          </span>
        );
      case KANJI_STEPS.MEANINGS:
        return <span>Enter all meanings <b>(in reading order)</b></span>;
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-lg`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center space-x-2 ${theme.textSecondary}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(liveTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode
                  ? <Sun className="w-5 h-5" />
                  : <Moon className="w-5 h-5" />
                }
              </button>
              <button
                onClick={cycleSoundMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={getSoundModeIcon().tooltip}
              >
                {getSoundModeIcon().icon}
              </button>
              <button
                onClick={resetGame}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ProgressBar percentage={progressPercentage} theme={theme} />

          <div className={`flex justify-between text-sm ${theme.textSecondary}`}>
            <span>{mastered}/{total} mastered</span>
            <span>{totalFailures} errors</span>
          </div>
        </div>

        {currentItem && (
          <div className="text-center mb-8">
            <div className={`
              ${isVocabularyMode ? (vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? 'text-[2.5rem]' : 'text-[2rem]') : 'text-8xl'}
              font-light ${theme.text} select-none mb-2`}>
              {isVocabularyMode && vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE ? (
                <JapaneseTextDisplay parts={currentItem.parts} theme={theme} />
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
                    <div className={`text-2xl font-bold ${theme.feedbackSuccess.title} mb-2`}>Correct!</div>
                    <div className={`text-lg ${theme.feedbackSuccess.text}`}>"{displayCorrectAnswer}"</div>
                    {
                      isVocabularyMode &&
                      vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE &&
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
                    <div className={`text-2xl font-bold ${theme.feedbackError.title} mb-2`}>Incorrect</div>
                    <div className={`text-lg ${theme.feedbackError.text} mb-1`}>You wrote: "{feedback.userAnswer}"</div>
                    <div className={`text-lg ${theme.feedbackError.title} font-semibold`}>Correct answer: "{displayCorrectAnswer}"</div>
                    {
                      isVocabularyMode &&
                      vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE &&
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
                      ? '... (comma separated)'
                      : isVocabularyMode
                        ? "Type the translation..."
                        : "Type the reading..."
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
                Validate (Enter)
              </button>
            )}

            <div className={`mt-4 text-sm ${theme.textMuted}`}>
              Success: {progress[currentItem.question]?.successes || 0}/{requiredSuccesses} |
              Errors: {progress[currentItem.question]?.failures || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const JapaneseTextDisplay = ({ parts, theme }) => {
  if (!parts) return null;

  return (
    <span className="inline-block">
      {parts.map((part, idx) => {
        if (part.type === 'kanji') {
          return (
            <span key={idx} className="inline-block align-bottom text-center">
              <span className={`block text-sm ${theme.textMuted}`}>
                {part.reading}
              </span>
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
  const { kunRow, onRow } = getChipsForMeaningsStep(stepData);

  return (
    <div className="pt-2 space-y-2">
      <div className="flex justify-left gap-2 flex-wrap">
        {kunRow.map((reading, idx) => (
          <span key={`kun-${idx}`} className={
            `${reading ? theme.statsBg.green : theme.sectionBg} ${theme.text}
              inline-flex items-center justify-center w-20 h-8 rounded-lg text-sm`
          }>
            {reading || ''}
          </span>
        ))}
      </div>
      <div className="flex justify-left gap-2 flex-wrap">
        {onRow.map((reading, idx) => (
          <span key={`on-${idx}`} className={
            `${reading ? theme.statsBg.blue : theme.sectionBg} ${theme.text}
            inline-flex items-center justify-center w-20 h-8 rounded-lg text-sm`
          }>
            {reading || ''}
          </span>
        ))}
      </div>
    </div>
  );
};
