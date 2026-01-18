import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../contexts/I18nContext';
import { subscriptionAPI } from '../../services/apiService';


export const LegalModal = ({ show, onClose, theme }) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState('legal');
  const [pricingOptions, setPricingOptions] = useState([]);

  // Legal information from environment variables
  const legalName = import.meta.env.VITE_LEGAL_NAME || '[NOM_COMPLET]';
  const legalSiret = import.meta.env.VITE_LEGAL_SIRET || '[SIRET]';
  const legalAddress = import.meta.env.VITE_LEGAL_ADDRESS || '[ADRESSE]';
  const legalEmail = import.meta.env.VITE_SUPPORT_EMAIL || '[EMAIL_CONTACT]';
  const lastUpdate = import.meta.env.VITE_LEGAL_LAST_UPDATE || '[DATE_MISE_A_JOUR]';


  // Load pricing options when modal opens
  useEffect(() => {
    if (show) {
      subscriptionAPI.getOptions()
        .then(data => setPricingOptions(data.options || []))
        .catch(() => setPricingOptions([]));
    }
  }, [show]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);


  const formatPrice = (option) => {
    return new Intl.NumberFormat(navigator.language || 'fr-FR', {
      style: 'currency',
      currency: option.currency,
    }).format(option.price);
  };

  const monthlyOption = pricingOptions.find(o => o.isRecurring);
  const lifetimeOption = pricingOptions.find(o => !o.isRecurring);

  if (!show) return null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ id, title }) => (
    <button
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 ${theme.selectorBg} ${theme.text} rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
    >
      <span className="font-semibold">{title}</span>
      {expandedSection === id ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </button>
  );

  const SectionContent = ({ children }) => (
    <div className={`px-4 pb-4 pt-2 ${theme.textSecondary} text-sm space-y-3`}>
      {children}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={`${theme.modalBg} rounded-xl max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 pb-5 border-b ${theme.border}`}>
          <h3 className={`text-lg font-semibold ${theme.text}`}>
            {t('legal.title')}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${theme.text} cursor-pointer hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">

          {/* Mentions légales */}
          <div className={`rounded-lg border ${theme.border} overflow-hidden`}>
            <SectionHeader id="legal" title={t('legal.legalNotice.title')} />
            {expandedSection === 'legal' && (
              <SectionContent>
                <p><strong>{t('legal.legalNotice.publisherTitle')}</strong></p>
                <p>{t('legal.legalNotice.publisherName')}: {legalName}</p>
                <p>SIRET: {legalSiret}</p>
                <p>{t('legal.legalNotice.address')}: {legalAddress}</p>
                <p>{t('legal.legalNotice.email')}: {legalEmail}</p>

                <p className="pt-2"><strong>{t('legal.legalNotice.hostingTitle')}</strong></p>
                <p>{t('legal.legalNotice.hostingInfo')}</p>
              </SectionContent>
            )}
          </div>

          {/* CGU / CGV */}
          <div className={`rounded-lg border ${theme.border} overflow-hidden`}>
            <SectionHeader id="terms" title={t('legal.terms.title')} />
            {expandedSection === 'terms' && (
              <SectionContent>
                <p><strong>1. {t('legal.terms.objectTitle')}</strong></p>
                <p>{t('legal.terms.objectContent')}</p>

                <p><strong>2. {t('legal.terms.accessTitle')}</strong></p>
                <p>{t('legal.terms.accessContent')}</p>

                <p><strong>3. {t('legal.terms.accountTitle')}</strong></p>
                <p>{t('legal.terms.accountContent')}</p>

                <p><strong>4. {t('legal.terms.pricingTitle')}</strong></p>
                <p>{t('legal.terms.pricingContent')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  {monthlyOption && (
                    <li>{t('legal.terms.pricingMonthly')}: {formatPrice(monthlyOption)} {t('legal.terms.perMonth')}</li>
                  )}
                  {lifetimeOption && (
                    <li>{t('legal.terms.pricingLifetime')}: {formatPrice(lifetimeOption)} {t('legal.terms.oneTime')}</li>
                  )}
                  {pricingOptions.length === 0 && (
                    <li className={theme.textMuted}>{t('legal.terms.pricingUnavailable')}</li>
                  )}
                </ul>

                <p><strong>5. {t('legal.terms.paymentTitle')}</strong></p>
                <p>{t('legal.terms.paymentContent')}</p>

                <p><strong>6. {t('legal.terms.withdrawalTitle')}</strong></p>
                <p>{t('legal.terms.withdrawalContent')}</p>

                <p><strong>7. {t('legal.terms.cancellationTitle')}</strong></p>
                <p>{t('legal.terms.cancellationContent')}</p>

                <p><strong>8. {t('legal.terms.intellectualPropertyTitle')}</strong></p>
                <p>{t('legal.terms.intellectualPropertyContent')}</p>

                <p><strong>9. {t('legal.terms.liabilityTitle')}</strong></p>
                <p>{t('legal.terms.liabilityContent')}</p>

                <p><strong>10. {t('legal.terms.modificationsTitle')}</strong></p>
                <p>{t('legal.terms.modificationsContent')}</p>

                <p><strong>11. {t('legal.terms.lawTitle')}</strong></p>
                <p>{t('legal.terms.lawContent')}</p>
              </SectionContent>
            )}
          </div>

          {/* Politique de confidentialité */}
          <div className={`rounded-lg border ${theme.border} overflow-hidden`}>
            <SectionHeader id="privacy" title={t('legal.privacy.title')} />
            {expandedSection === 'privacy' && (
              <SectionContent>
                <p><strong>1. {t('legal.privacy.responsibleTitle')}</strong></p>
                <p>{t('legal.privacy.responsibleContent')}: {legalName}, {legalEmail}</p>

                <p><strong>2. {t('legal.privacy.dataCollectedTitle')}</strong></p>
                <p>{t('legal.privacy.dataCollectedIntro')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>{t('legal.privacy.authData')}</strong>: {t('legal.privacy.authDataDetail')}</li>
                  <li><strong>{t('legal.privacy.deviceData')}</strong>: {t('legal.privacy.deviceDataDetail')}</li>
                  <li><strong>{t('legal.privacy.subscriptionData')}</strong>: {t('legal.privacy.subscriptionDataDetail')}</li>
                </ul>

                <p><strong>3. {t('legal.privacy.purposeTitle')}</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{t('legal.privacy.purpose1')}</li>
                  <li>{t('legal.privacy.purpose2')}</li>
                  <li>{t('legal.privacy.purpose3')}</li>
                </ul>

                <p><strong>4. {t('legal.privacy.legalBasisTitle')}</strong></p>
                <p>{t('legal.privacy.legalBasisContent')}</p>

                <p><strong>5. {t('legal.privacy.retentionTitle')}</strong></p>
                <p>{t('legal.privacy.retentionContent')}</p>

                <p><strong>6. {t('legal.privacy.recipientsTitle')}</strong></p>
                <p>{t('legal.privacy.recipientsContent')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Stripe</strong>: {t('legal.privacy.stripeDetail')}</li>
                  <li><strong>{t('legal.privacy.authProvider')}</strong>: {t('legal.privacy.authProviderDetail')}</li>
                </ul>

                <p><strong>7. {t('legal.privacy.cookiesTitle')}</strong></p>
                <p>{t('legal.privacy.cookiesContent')}</p>

                <p><strong>8. {t('legal.privacy.rightsTitle')}</strong></p>
                <p>{t('legal.privacy.rightsIntro')}</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{t('legal.privacy.rightAccess')}</li>
                  <li>{t('legal.privacy.rightRectification')}</li>
                  <li>{t('legal.privacy.rightErasure')}</li>
                  <li>{t('legal.privacy.rightPortability')}</li>
                  <li>{t('legal.privacy.rightObjection')}</li>
                </ul>
                <p>{t('legal.privacy.rightsContact')}: {legalEmail}</p>

                <p><strong>9. {t('legal.privacy.complaintTitle')}</strong></p>
                <p>{t('legal.privacy.complaintContent')}</p>

                <p className={`text-xs ${theme.textMuted} pt-2`}>
                  {t('legal.privacy.lastUpdate')}: {lastUpdate}
                </p>
              </SectionContent>
            )}
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
