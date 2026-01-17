import { useState, useEffect } from 'react';
import { Coffee } from 'lucide-react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useTranslation } from '../../contexts/I18nContext';


export const SlowLoadingOverlay = ({ isLoading }) => {
  const { t } = useTranslation();
  const { theme, darkMode } = usePreferences();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowOverlay(true);
      }, 2500);
    } else {
      setShowOverlay(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (!showOverlay || !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`${theme.cardBg} rounded-2xl shadow-2xl max-w-md w-full p-6`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-amber-500/20' : 'bg-amber-100'} rounded-full mb-4`}>
            <Coffee className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'} animate-gentle-bounce`} />
          </div>

          <h2 className={`text-xl font-bold ${theme.text} mb-3`}>
            {t('common.loading')}
          </h2>

          <p className={`text-base ${theme.textSecondary}`}>
            {t('common.loadingText')}
          </p>

          <div className="mt-6">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${darkMode ? 'bg-amber-400' : 'bg-amber-500'} rounded-full animate-pulse`} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
