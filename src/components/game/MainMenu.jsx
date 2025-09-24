import { Sun, Moon } from 'lucide-react';
import { GAME_MODES, REQUIRED_SUCCESSES_LIMITS } from '../../constants';


export const MainMenu = ({
  theme,
  darkMode,
  toggleDarkMode,
  cycleSoundMode,
  getSoundModeIcon,
  requiredSuccesses,
  onRequiredSuccessesChange,
  onStartGame
}) => {
  const renderModeButton = (mode, icon, label, className) => (
    <button
      onClick={() => onStartGame(mode)}
      className={`w-full ${className} text-white font-semibold py-4 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
    >
      <div className="flex items-center justify-center">
        <span className="text-3xl mr-4 font-normal">{icon}</span>
        <span className="text-base">{label}</span>
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md`}>
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.text} mb-2`}>学習カナ</h1>
          <p className={theme.textSecondary}>Kana Learning</p>
        </div>

        <div className="space-y-4">
          {renderModeButton(GAME_MODES.HIRAGANA, 'ひ', 'Hiragana', 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700')}
          {renderModeButton(GAME_MODES.KATAKANA, 'カ', 'Katakana', 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700')}
          {renderModeButton(GAME_MODES.BOTH, 'ひカ', 'Hiragana + Katakana', 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700')}
        </div>

        <div className={`mt-8 p-4 ${theme.sectionBg} rounded-xl`}>
          <p className={`text-sm ${theme.textSecondary} text-center`}>
            Master each kana by getting it right {requiredSuccesses} times!
          </p>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="flex justify-end items-center">
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
          </div>

          <div className="flex justify-end items-center space-x-3">
            <label className={`text-sm font-medium ${theme.textSecondary}`}>
              Required successes:
            </label>
            <input
              type="number"
              min={REQUIRED_SUCCESSES_LIMITS.MIN}
              max={REQUIRED_SUCCESSES_LIMITS.MAX}
              value={requiredSuccesses}
              onChange={onRequiredSuccessesChange}
              className={`${theme.inputBg} ${theme.border} rounded-lg px-3 py-1 w-16 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${theme.text}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
