import { useRef, useEffect } from 'react';
import { Clock, RefreshCw, Sun, Moon } from 'lucide-react';
import { ProgressBar } from '../ui';
import { FEEDBACK_TYPES } from '../../constants';
import { formatTime } from '../../utils';


export const GamePlay = ({
  theme,
  darkMode,
  toggleDarkMode,
  cycleSoundMode,
  getSoundModeIcon,
  currentKana,
  userInput,
  setUserInput,
  feedback,
  progress,
  requiredSuccesses,
  sessionStats,
  startTime,
  onSubmit,
  onReset
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!feedback && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [feedback, currentKana]);


  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !feedback) {
      e.preventDefault();
      onSubmit();
    }
  };

  const total = Object.values(sessionStats).length;
  const mastered = Object.values(progress).filter(p => p.mastered).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const progressPercentage = total ? (mastered / total) * 100 : 0;
  const liveElapsedSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-lg`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center space-x-2 ${theme.textSecondary}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTime(liveElapsedSec)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={cycleSoundMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={getSoundModeIcon().tooltip}
              >
                {getSoundModeIcon().icon}
              </button>
              <button
                onClick={onReset}
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

        {currentKana && (
          <div className="text-center mb-8">
            <div className={`text-8xl font-light ${theme.text} mb-6 select-none`}>
              {currentKana.char}
            </div>

            {feedback ? (
              <div className="mb-6">
                {feedback.type === FEEDBACK_TYPES.SUCCESS ? (
                  <div className={`${theme.feedbackSuccess.bg} border-2 rounded-xl p-6 animate-pulse`}>
                    <div className="text-6xl mb-2">✅</div>
                    <div className={`text-2xl font-bold ${theme.feedbackSuccess.title} mb-2`}>Correct!</div>
                    <div className={`text-lg ${theme.feedbackSuccess.text}`}>"{feedback.correctAnswer}"</div>
                  </div>
                ) : (
                  <div className={`${theme.feedbackError.bg} border-2 rounded-xl p-6 animate-pulse`}>
                    <div className="text-6xl mb-2">❌</div>
                    <div className={`text-2xl font-bold ${theme.feedbackError.title} mb-2`}>Incorrect</div>
                    <div className={`text-lg ${theme.feedbackError.text} mb-1`}>You wrote: "{feedback.userAnswer}"</div>
                    <div className={`text-lg ${theme.feedbackError.title} font-semibold`}>Correct answer: "{feedback.correctAnswer}"</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type the reading..."
                  className={`w-full text-2xl text-center py-4 px-6 border-2 ${theme.inputBorder} ${theme.inputBg} ${theme.text} rounded-xl focus:ring-4 focus:ring-blue-200 outline-none transition-all`}
                  autoComplete="off"
                  disabled={feedback !== null}
                />
              </div>
            )}

            {!feedback && (
              <button
                onClick={onSubmit}
                disabled={!userInput.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
              >
                Validate (Enter/Space)
              </button>
            )}

            <div className={`mt-4 text-sm ${theme.textMuted}`}>
              Success: {progress[currentKana.char]?.successes || 0}/{requiredSuccesses} |
              Errors: {progress[currentKana.char]?.failures || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
