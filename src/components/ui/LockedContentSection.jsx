import { BookOpen, Clock, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { OAuthButtons } from '../OAuthButtons';
import { UnlockModal } from '../UnlockModal';


const isStripeEnabled = import.meta.env.VITE_STRIPE_ENABLED === 'true';

export const LockedContentSection = ({
  selectedLists,
  hasLockedSelection,
  onStartPractice,
  onReview,
  totalCount,
  countLabel,
  reviewLabel,
  startGradient,
  theme,
  darkMode,
}) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Review Button */}
        <button
          onClick={() => {
            const canReview = selectedLists.length > 0 && !hasLockedSelection;
            if (canReview) onReview();
          }}
          disabled={selectedLists.length === 0 || hasLockedSelection}
          className={`w-full ${theme.sectionBg} ${theme.text} font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
            selectedLists.length > 0 && !hasLockedSelection
              ? 'transform hover:scale-105 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">{reviewLabel}</span>
          </div>
        </button>

        {/* Show OAuth buttons if not authenticated and locked list selected */}
        {hasLockedSelection && !isAuthenticated && (
          <div className={`p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl`}>
            <OAuthButtons theme={{ ...theme, darkMode }} />
            <p className={`text-xs text-center mt-3 opacity-70 ${theme.textSecondary}`}>
              {t('common.signInToUnlock')}
            </p>
          </div>
        )}

        {/* Show Unlock button if authenticated but list is still locked */}
        {hasLockedSelection && isAuthenticated && (
          <button
            onClick={isStripeEnabled ? () => setShowUnlockModal(true) : undefined}
            disabled={!isStripeEnabled}
            className={`w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
              isStripeEnabled
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform hover:scale-105 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isStripeEnabled ? <Lock className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span className="text-md">
                {isStripeEnabled ? t('common.unlockAllLists') : t('subscription.comingSoon')}
              </span>
            </div>
          </button>
        )}

        {/* Show normal Start Practice button if no locked selection */}
        {!hasLockedSelection && (
          <button
            onClick={() => selectedLists.length > 0 && onStartPractice()}
            disabled={selectedLists.length === 0}
            className={`w-full ${startGradient} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${selectedLists.length > 0
                ? 'transform hover:scale-105 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
              }`}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col text-left mb-1">
                <span className="text-lg">{t('common.startPractice')}</span>
                <div className="text-xs opacity-80">
                  {totalCount} {countLabel}
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        theme={theme}
      />
    </>
  );
};
