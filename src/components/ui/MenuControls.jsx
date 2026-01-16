import { Sun, Moon, Globe, Repeat2 } from 'lucide-react';
import { LANGUAGES, REQUIRED_SUCCESSES_LIMITS } from '../../constants';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';


export const MenuControls = ({
  theme,
  darkMode,
  toggleDarkMode,
  cycleSoundMode,
  getSoundModeIcon,
  requiredSuccesses,
  onRequiredSuccessesChange,
  showLoopMode = false,
  loopMode = false,
  onLoopModeChange = null
}) => {
  const { language, handleLanguageChange } = usePreferences();
  const { t } = useTranslation();

  const toggleLanguage = () => {
    handleLanguageChange(language === LANGUAGES.FR ? LANGUAGES.EN : LANGUAGES.FR);
  };

  return (
    <div className="mt-8 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => cycleSoundMode()}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={getSoundModeIcon().tooltip}
        >
          {getSoundModeIcon().icon}
        </button>
        <button
          onClick={toggleDarkMode}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleLanguage}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={t('settings.language')}
        >
          <div className="flex items-center gap-1">
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </div>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label className={`text-sm font-medium ${theme.textSecondary}`}>
          {t('menu.repetitions')}
        </label>
        <div className="flex items-center space-x-1">
          <input
            type="number"
            min={REQUIRED_SUCCESSES_LIMITS.MIN}
            max={REQUIRED_SUCCESSES_LIMITS.MAX}
            value={requiredSuccesses}
            onChange={onRequiredSuccessesChange}
            className={`${theme.inputBg} ${theme.border} rounded-lg px-1 py-2 w-12 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${theme.text}`}
          />
          {showLoopMode && (
            <button
              onClick={() => onLoopModeChange && onLoopModeChange(!loopMode)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                loopMode
                  ? darkMode ? 'bg-gray-600 hover:bg-gray-550 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  : `${theme.buttonSecondary}`
              }`}
              title={t('tooltips.loopMode')}
            >
              <Repeat2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
