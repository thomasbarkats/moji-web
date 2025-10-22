import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';


export const KeyboardHint = ({ theme }) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showHint) {
        setShowHint(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showHint]);


  return (
    <>
      <button
        onClick={() => setShowHint(true)}
        className={`
          fixed bottom-4 right-6 p-3 rounded-full
          ${theme.sectionBg} ${theme.text}
          shadow-lg hover:shadow-xl transition-all
          cursor-pointer
        `}
        title="Japanese keyboard help"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {showHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`${theme.cardBg} rounded-xl p-6 max-w-md w-full shadow-2xl`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                Japanese Input Setup
              </h3>
              <button
                onClick={() => setShowHint(false)}
                className={`p-1 rounded ${theme.text} cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`space-y-3 ${theme.textSecondary}`}>
              <div>
                <h4 className="font-medium mb-1">Windows:</h4>
                <p className="text-sm">
                  1. Press <kbd>Win + Space</kbd> to switch input methods<br/>
                  2. Or click the language icon in taskbar<br/>
                  3. Select Japanese IME<br/>
                  4. Press <kbd>Capslock</kbd> to toggle hiragana/romaji
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Quick tips:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Type in romaji, it converts to hiragana</li>
                  <li>• Press <kbd>Space</kbd> to convert to kanji</li>
                  <li>• Press <kbd>F7</kbd> for katakana</li>
                  <li>• Press <kbd>Enter</kbd> to confirm</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
