import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { OAuthButtons } from '../OAuthButtons';
import { UnlockModal } from '../UnlockModal';


export const ReviewProgressHeader = ({ theme, darkMode, progressPercentage = 0, children, haveAccess = false, onModalOpenChange }) => {
  const { t } = useTranslation();
  const { isAuthenticated, hasActiveSubscription, hasLifetimeAccess } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Notify parent when modal state changes
  const handleModalChange = (isOpen) => {
    setShowUnlockModal(isOpen);
    if (onModalOpenChange) {
      onModalOpenChange(isOpen);
    }
  };

  if (!haveAccess) {
    haveAccess = hasActiveSubscription || hasLifetimeAccess;
  }

  // If user can't see progress and not authenticated, show login invitation
  if (!haveAccess && !isAuthenticated) {
    return (
      <div className={`mb-6 py-3 px-4 ${theme.sectionBg} rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3`}>
        <span className={`text-sm ${theme.text}`}>{t('review.loginToTrackProgress')}</span>
        <div className="[&_button]:!py-3 [&_button]:text-sm">
          <OAuthButtons theme={{ ...theme, darkMode }} />
        </div>
      </div>
    );
  }

  // If user can't see progress but is authenticated, show subscribe invitation
  if (!haveAccess) {
    return (
      <>
        <div className={`mb-6 py-3 px-4 ${theme.sectionBg} rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3`}>
          <span className={`text-sm ${theme.text}`}>{t('review.subscribeToTrackProgress')}</span>
          <button
            onClick={() => handleModalChange(true)}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all cursor-pointer text-sm whitespace-nowrap"
          >
            {t('common.unlockAllLists')}
          </button>
        </div>
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => handleModalChange(false)}
          theme={theme}
        />
      </>
    );
  }

  return (
    <div className={`mb-6 p-4 ${theme.sectionBg} rounded-lg`}>
      <div className="flex items-center justify-between mb-2 gap-3">
        <div className={`text-sm ${theme.text} flex items-center gap-2 flex-wrap`}>
          {children}
        </div>
        <span className={`text-xs ${theme.textMuted} flex-shrink-0`}>{Math.round(progressPercentage)}%</span>
      </div>
      <div className={`${theme.progressBg} rounded-full h-2 w-full`}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: '#22c55e',
          }}
        />
      </div>
    </div>
  );
};
