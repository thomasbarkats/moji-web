import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../contexts/I18nContext';
import { OAuthButtons } from './OAuthButtons';


export const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  theme,
  darkMode
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${theme.modalBg} rounded-xl p-6 max-w-md w-full shadow-2xl`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            {t('auth.signIn')}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${theme.text} cursor-pointer hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`space-y-4 ${theme.textSecondary}`}>
          <p className="mb-4">
            {t('auth.signInDescription')}
          </p>

          <OAuthButtons onSuccess={handleSuccess} theme={{ ...theme, darkMode }} />

          <p className="text-xs text-center mt-4 opacity-60">
            {t('auth.termsAgreement')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
