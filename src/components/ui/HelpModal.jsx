import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePreferences } from '../../contexts/PreferencesContext';


export const HelpModal = ({ show, onClose, title, children }) => {
  const { theme } = usePreferences();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`${theme.modalBg} rounded-xl p-6 max-w-md w-full shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${theme.text} cursor-pointer hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`space-y-4 ${theme.textSecondary}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
