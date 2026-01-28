import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { hasServerError, clearServerError } from '../../services/apiService';


export const ServerErrorModal = () => {
  const { t } = useTranslation();
  const { theme, darkMode } = usePreferences();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if error occurred before component mounted
    if (hasServerError()) {
      setIsVisible(true);
    }

    const handleServerError = () => setIsVisible(true);

    window.addEventListener('server-error', handleServerError);
    return () => window.removeEventListener('server-error', handleServerError);
  }, []);

  const handleDismiss = () => {
    clearServerError();
    setIsVisible(false);
  };

  const handleRetry = () => {
    clearServerError();
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${theme.cardBg} rounded-2xl shadow-2xl max-w-md w-full p-6 relative`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-red-500/20' : 'bg-red-100'} rounded-full mb-4`}>
            <WifiOff className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>

          <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
            {t('serverError.title')}
          </h2>

          <p className={`text-base ${theme.textSecondary} mb-6`}>
            {t('serverError.message')}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer border ${theme.border} ${theme.text} hover:opacity-80`}
            >
              {t('serverError.dismiss')}
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              {t('serverError.retry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
