import { useState } from 'react';
import { HelpModal } from './HelpModal';


export const FloatingHelpButton = ({ icon: Icon, tooltip, title, children, theme, position = 'bottom-4 right-6' }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          fixed ${position} p-3 rounded-full
          ${theme.sectionBg} ${theme.text}
          shadow-lg hover:shadow-xl transition-all
          cursor-pointer
        `}
        title={tooltip}
      >
        <Icon className="w-5 h-5" />
      </button>

      <HelpModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        theme={theme}
      >
        {children}
      </HelpModal>
    </>
  );
};
