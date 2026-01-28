import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';

/**
 * Confirmation modal when stopping a game session
 */
export const StopGameModal = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  const { theme, darkMode } = usePreferences();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${theme.cardBg} rounded-2xl shadow-2xl max-w-md w-full p-6 relative`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'} rounded-full mb-4`}>
            <AlertCircle className={`w-8 h-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>

          <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
            {t('stopGame.title')}
          </h2>

          <p className={`text-base ${theme.textSecondary} mb-6`}>
            {t('stopGame.message')}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer border ${theme.border} ${theme.text} hover:opacity-80`}
            >
              {t('stopGame.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              {t('stopGame.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
