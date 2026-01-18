import { useState } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { HelpModal } from './HelpModal';


export const FloatingHelpButton = ({ icon: Icon, tooltip, title, children }) => {
  const { theme } = usePreferences();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-3 rounded-full w-12 h-12 ${theme.buttonPrimaryBg} ${theme.text} shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center`}
        title={tooltip}
      >
        <Icon className="w-5 h-5" />
      </button>

      <HelpModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={title}
      >
        {children}
      </HelpModal>
    </>
  );
};
