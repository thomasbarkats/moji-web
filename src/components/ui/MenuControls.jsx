import { Sun, Moon, Globe } from 'lucide-react';
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
  onRequiredSuccessesChange
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
          onClick={toggleLanguage}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={t('settings.language')}
        >
          <div className="flex items-center gap-1">
            <Globe className="w-5 h-5" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </div>
        </button>
        <button
          onClick={toggleDarkMode}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => cycleSoundMode()}
          className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
          title={getSoundModeIcon().tooltip}
        >
          {getSoundModeIcon().icon}
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <label className={`text-sm font-medium ${theme.textSecondary}`}>
          {t('menu.requiredSuccesses')}:
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
  );
};
