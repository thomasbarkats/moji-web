import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getAllKanaForMode, initializeKanaData, selectNextItem } from '../utils';
import { GAME_STATES } from '../constants';


export const useKanaGameLogic = () => {
  const {
    kanaData,
    setGameMode,
    setGameState,
    setUserInput,
    setStartTime,
    setFeedback,
    setProgress,
    setSessionStats,
    currentItem,
    setCurrentItem,
    currentItemStartRef,
  } = useGameContext();

  const { dakutenMode, combinationsMode } = usePreferences();


  const initializeKanaGame = (mode) => {
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
      return null;
    }

    const nextKana = selectNextItem(availableKana, currentProgress, currentItem?.key);

    if (!nextKana) return null;

    const newItem = {
      key: nextKana.char,
      question: nextKana.char,
      answer: nextKana.reading,
    };

    setCurrentItem(newItem);
    setUserInput('');
    setFeedback(null);
    currentItemStartRef.current = Date.now();

    setProgress(prev => ({
      ...prev,
      [nextKana.char]: {
        ...prev[nextKana.char],
        lastSeen: Date.now()
      }
    }));

    return newItem;
  };

  return {
    initializeKanaGame,
    selectNextKana,
  };
};
