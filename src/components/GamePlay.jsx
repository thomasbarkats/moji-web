import { useRef, useEffect, useState } from 'react';
import { Clock, RefreshCw, Sun, Moon } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTheme, useSound, useGameActions } from '../hooks';
import { ProgressBar } from '.';
import { FEEDBACK_TYPES, GAME_MODES, VOCABULARY_MODES } from '../constants';
import { formatTime, cleanJapaneseText } from '../utils';


export const GamePlay = () => {
  const { theme, darkMode, toggleDarkMode } = useTheme();
  const { cycleSoundMode, getSoundModeIcon } = useSound();
  const { requiredSuccesses, vocabularyMode } = usePreferences();
  const { handleSubmit, resetGame } = useGameActions();

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
  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const progressPercentage = total ? (mastered / total) * 100 : 0;

  const displayCorrectAnswer = feedback && isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
    ? cleanJapaneseText(feedback.correctAnswer)
    : feedback?.correctAnswer;

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
            {feedback ? (
              <div className="mb-6">
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
                  placeholder={isVocabularyMode ? "Type the translation..." : "Type the reading..."}
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
    <span>
      {parts.map((part, idx) => {
        if (part.type === 'kanji') {
          return (
            <span
              key={idx}
              className="underline decoration-dotted decoration-1 underline-offset-4 cursor-help"
              title={part.reading}
            >
              {part.text}
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
