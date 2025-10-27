import { Globe } from 'lucide-react';
import { LANGUAGES } from '../../constants';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';


export const LanguageSelector = ({ theme, darkMode }) => {
  const { language, handleLanguageChange } = usePreferences();
  const { t } = useTranslation();

  const languages = [
    { code: LANGUAGES.FR, label: t('languages.fr') },
    { code: LANGUAGES.EN, label: t('languages.en') }
  ];

  return (
    <div className={`flex items-center justify-between py-4 ${theme.text}`}>
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">{t('settings.language')}</span>
      </div>
      <div className="flex gap-2">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              language === lang.code
                ? 'bg-indigo-500 text-white font-medium'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};
