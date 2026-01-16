import { X, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { subscriptionAPI } from '../services/apiService';


export const UnlockModal = ({ isOpen, onClose, theme }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPriceId, setProcessingPriceId] = useState(null);
  const { refreshSubscriptionStatus } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionAPI.getOptions();
      setOptions(data.options);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (option) => {
    try {
      setProcessingPriceId(option.priceId);
      setError(null);

      const currentUrl = window.location.href;
      const successUrl = `${currentUrl}?payment=success`;
      const cancelUrl = `${currentUrl}?payment=cancel`;

      const checkout = await subscriptionAPI.createCheckout(
        option.priceId,
        option.isRecurring === false,
        successUrl,
        cancelUrl
      );

      // Redirect to Stripe checkout
      window.location.href = checkout.url;
    } catch (err) {
      setError(err.message);
      setProcessingPriceId(null);
    }
  };

  // Check for payment success/cancel on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      // Refresh subscription status after successful payment
      refreshSubscriptionStatus().then(() => {
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
        onClose();
      });
    } else if (paymentStatus === 'cancel') {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${theme.modalBg} rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            {t('subscription.unlockTitle')}
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
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`animate-spin ${theme.text}`} size={32} />
            </div>
          )}

          {error && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${theme.feedbackError.bg} ${theme.feedbackError.text}`}>
              {error}
            </div>
          )}

          {!loading && options.length > 0 && (
            <>
              <p className="mb-4">
                {t('subscription.description')}
              </p>

              {options.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 border ${theme.border} rounded-lg transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-2xl font-bold ${theme.text}`}>
                      {new Intl.NumberFormat(navigator.language || 'en-US', {
                        style: 'currency',
                        currency: option.currency,
                      }).format(option.price)}
                    </div>
                    {option.isRecurring && (
                      <div className={`text-xs ${theme.textMuted}`}>{t('subscription.perMonth')}</div>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      <span>{t('subscription.features.vocabularyLists')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      <span>{t('subscription.features.kanjiLists')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      <span>{t('subscription.features.futureUpdates')}</span>
                    </div>
                    {!option.isRecurring && (
                      <div className={`flex items-center gap-2 text-sm ${theme.text}`}>
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                        <span className="font-semibold">{t('subscription.features.lifetimeAccess')}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePurchase(option)}
                    disabled={processingPriceId !== null}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all cursor-pointer text-sm ${processingPriceId === option.priceId
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                  >
                    {processingPriceId === option.priceId ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        {t('subscription.redirecting')}
                      </span>
                    ) : (
                      t(option.isRecurring ? 'subscription.subscribeMonthly' : 'subscription.subscribeLifetime')
                    )}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
