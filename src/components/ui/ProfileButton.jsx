import { User, CreditCard, LogOut, Crown, Loader2, Mail, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { subscriptionAPI } from '../../services/apiService';
import { LoginModal } from '../LoginModal';
import { UnlockModal } from '../UnlockModal';
import { HelpModal } from './HelpModal';


export const ProfileButton = ({ position = 'bottom-4 right-6' }) => {
  const { user, isAuthenticated, hasActiveSubscription, hasLifetimeAccess, logout } = useAuth();
  const { theme, darkMode } = usePreferences();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
  };

  const handleManageSubscription = async () => {
    if (!hasActiveSubscription) {
      // User doesn't have a subscription, show unlock modal
      setShowMenu(false);
      setShowUnlockModal(true);
      return;
    }

    // User has active subscription, redirect to Stripe portal
    try {
      setShowMenu(false);
      setIsRedirecting(true);
      const returnUrl = window.location.href;
      const { url } = await subscriptionAPI.getPortalUrl(returnUrl);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get portal URL:', error);
      // Fallback to showing unlock modal if API call fails
      setShowUnlockModal(true);
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleContactSupport = () => {
    setShowMenu(false);
    setShowContactModal(true);
  };

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'thomasbarkats@gmail.com';
  const isStripeEnabled = import.meta.env.VITE_STRIPE_ENABLED === 'true';

  // Get first letter of user's first name for avatar
  const getInitial = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <div ref={menuRef} className={`fixed ${position} z-50`}>
        {/* Profile Button */}
        <button
          onClick={() => isAuthenticated ? setShowMenu(!showMenu) : handleLogin()}
          className={`
            w-11 h-11 p-3 rounded-full
            ${theme.selectorBg}
            ${theme.text}
            shadow-lg hover:shadow-xl transition-all
            cursor-pointer
            flex items-center justify-center
          `}
          title={isAuthenticated ? t('profile.title') : t('auth.login')}
        >
          {isAuthenticated ? (
            <span className="text-base font-semibold">
              {getInitial()}
            </span>
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>

        {/* Dropdown Menu - Only show if authenticated */}
        {isAuthenticated && showMenu && (
          <div
            className={`
              absolute bottom-full right-0 mb-2
              ${theme.selectorBg} ${theme.text}
              rounded-lg shadow-xl
              min-w-[220px]
              border ${theme.border}
              overflow-hidden
            `}
          >
            {/* User Info */}
            <div className={`px-4 py-3 border-b ${theme.border}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {user?.email}
                </p>
                {hasActiveSubscription &&
                  <p className="pt-4 text-xs opacity-50 truncate">
                    {t('profile.activeSubscription')}
                    &nbsp;-&nbsp;
                    {t('profile.renewOn')}&nbsp;
                    {new Date(user.subscriptionEndDate).toLocaleDateString()}
                  </p>
                }
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Lifetime Access - Non-clickable */}
              {hasLifetimeAccess && (
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {t('profile.lifetimeAccess')}
                  </span>
                </div>
              )}

              {/* Manage Subscription - For all users without lifetime access */}
              {!hasLifetimeAccess && (
                <button
                  onClick={isStripeEnabled ? handleManageSubscription : undefined}
                  disabled={!isStripeEnabled}
                  className={`
                    w-full px-4 py-2.5 flex items-center gap-3
                    ${isStripeEnabled ? theme.selectorHover : 'opacity-50'}
                    transition-colors text-left
                    ${isStripeEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isStripeEnabled ? t('profile.manageSubscription') : t('subscription.comingSoon')}
                  </span>
                </button>
              )}

              {/* Contact Support */}
              <button
                onClick={handleContactSupport}
                className={`
                  w-full px-4 py-2.5 flex items-center gap-3
                  ${theme.selectorHover}
                  transition-colors text-left
                  cursor-pointer
                `}
              >
                <Mail className="w-4 h-4" />
                <span>{t('profile.contactSupport')}</span>
              </button>

              <button
                onClick={handleLogout}
                className={`
                  w-full px-4 py-2.5 flex items-center gap-3
                  ${theme.selectorHover}
                  transition-colors text-left
                  text-red-600 hover:text-red-700
                  cursor-pointer
                `}
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        theme={theme}
        darkMode={darkMode}
      />

      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        theme={theme}
      />

      <HelpModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={t('profile.contactSupport')}
        theme={theme}
      >
        {/* Warning */}
        <div className={`flex gap-3 p-3 rounded-lg ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'} border ${darkMode ? 'border-amber-700' : 'border-amber-200'}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
            {t('support.warningMessage')}
          </p>
        </div>

        {/* Email Address */}
        <div>
          <h4 className={`font-semibold mb-2 ${theme.text}`}>{t('support.emailAddress')}</h4>
          <div className={`p-3 rounded-lg ${theme.selectorBg} border ${theme.border}`}>
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-500 hover:text-blue-600 font-mono break-all"
            >
              {supportEmail}
            </a>
          </div>
        </div>

        {/* Your Information */}
        <div>
          <h4 className={`font-semibold mb-2 ${theme.text}`}>{t('support.yourInformation')}</h4>
          <div className={`p-3 rounded-lg ${theme.selectorBg} border ${theme.border} space-y-2 text-sm`}>
            <div className="flex flex-col gap-1">
              <span className={theme.textMuted}>
                {t('support.accountEmail')}:
              </span>
              <span className="font-mono">{user?.email || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={theme.textMuted}>
                {t('support.subscriptionStatus')}:
              </span>
              <span>
                {hasLifetimeAccess
                  ? t('profile.lifetimeAccess')
                  : hasActiveSubscription
                  ? t('profile.monthlySubscription')
                  : t('profile.noSubscription')}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h4 className={`font-semibold mb-2 ${theme.text}`}>{t('support.whatToInclude')}</h4>
          <ul className={`space-y-2 ${theme.textMuted} text-sm`}>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('support.instruction1')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('support.instruction2')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>{t('support.instruction3')}</span>
            </li>
          </ul>
        </div>
      </HelpModal>

      {/* Redirecting Modal */}
      {isRedirecting && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${theme.modalBg} ${theme.text} rounded-2xl p-8 shadow-2xl max-w-md mx-4`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-lg font-medium text-center">
                {t('profile.redirecting')}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
