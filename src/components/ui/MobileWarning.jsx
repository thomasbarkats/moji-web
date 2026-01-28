import { X, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';


export const MobileWarning = () => {
  const { t } = useTranslation();
  const { theme, darkMode } = usePreferences();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Detect mobile (not tablet) - screen width < 640px
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setIsVisible(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${theme.cardBg} rounded-2xl shadow-2xl max-w-md w-full p-6 relative`}>
        <button
          onClick={handleDismiss}
          className={`absolute top-4 right-4 p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'} rounded-full mb-4`}>
            <Smartphone className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>

          <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
            {t('mobileWarning.title')}
          </h2>

          <p className={`text-base ${theme.textSecondary} mb-6`}>
            {t('mobileWarning.message')}
          </p>

          <button
            onClick={handleDismiss}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
          >
            {t('mobileWarning.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
};
