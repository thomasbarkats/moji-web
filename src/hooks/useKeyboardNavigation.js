import { useEffect } from 'react';
import { useGameContext } from '../contexts/GameContext';
import { GAME_STATES, APP_MODES } from '../constants';


const APP_MODE_ORDER = [APP_MODES.KANA, APP_MODES.KANJI, APP_MODES.VOCABULARY,];

export function useKeyboardNavigation() {
  const { gameState, appMode, switchToKana, switchToVocabulary, switchToKanji } = useGameContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only navigate on arrow keys when in MENU state (not playing or reviewing)
      if (gameState !== GAME_STATES.MENU) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToNextMode(appMode);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToPreviousMode(appMode);
      }
    };

    const navigateToNextMode = (currentMode) => {
      const currentIndex = APP_MODE_ORDER.indexOf(currentMode);
      if (currentIndex < APP_MODE_ORDER.length - 1) {
        switchToMode(APP_MODE_ORDER[currentIndex + 1]);
      }
    };

    const navigateToPreviousMode = (currentMode) => {
      const currentIndex = APP_MODE_ORDER.indexOf(currentMode);
      if (currentIndex > 0) {
        switchToMode(APP_MODE_ORDER[currentIndex - 1]);
      }
    };

    const switchToMode = (mode) => {
      switch (mode) {
        case APP_MODES.KANA:
          switchToKana();
          break;
        case APP_MODES.VOCABULARY:
          switchToVocabulary();
          break;
        case APP_MODES.KANJI:
          switchToKanji();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, appMode, switchToKana, switchToVocabulary, switchToKanji]);
}
