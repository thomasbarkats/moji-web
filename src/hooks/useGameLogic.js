import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getAllKanaForMode, initializeKanaData } from '../utils';
import { GAME_STATES } from '../constants';


export const useGameLogic = () => {
  const {
    kanaData,
    setGameMode,
    setGameState,
    setUserInput,
    setStartTime,
    setFeedback,
    setProgress,
    setSessionStats,
    setCurrentItem,
    currentItemStartRef,
  } = useGameContext();

  const { dakutenMode, combinationsMode } = usePreferences();


  const initializeGame = (mode) => {
    setGameMode(mode);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const options = { dakutenMode, combinationsMode };
    const allKana = getAllKanaForMode(mode, kanaData, options);
    const { initialProgress, initialStats } = initializeKanaData(allKana);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKana(allKana, initialProgress);
  };

  const selectNextKana = (allKana, currentProgress) => {
    const availableKana = allKana.filter(kana => !currentProgress[kana.char].mastered);

    if (availableKana.length === 0) {
      return null; // Signal to finish session
    }

    const randomIndex = Math.floor(Math.random() * availableKana.length);
    const nextKana = availableKana[randomIndex];
    const newItem = {
      key: nextKana.char,
      question: nextKana.char,
      answer: nextKana.reading,
    };

    setCurrentItem(newItem);
    setUserInput('');
    setFeedback(null);
    currentItemStartRef.current = Date.now();

    return newItem;
  };

  return {
    initializeGame,
    selectNextKana,
  };
};
