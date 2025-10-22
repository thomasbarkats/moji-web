import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import {
  getAllKanaForMode,
  initializeKanaData,
  selectNextItem,
  initializeGameState,
  finalizeItemSelection
} from '../utils';


export const useGameLogicKana = () => {
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
    const setters = { setGameMode, setGameState, setUserInput, setStartTime, setFeedback };
    initializeGameState(setters, mode);

    const options = { dakutenMode, combinationsMode };
    const allKana = getAllKanaForMode(mode, kanaData, options);
    const { initialProgress, initialStats } = initializeKanaData(allKana);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKana(allKana, initialProgress);
  };

  const selectNextKana = (allKana, currentProgress) => {
    const availableKana = allKana.filter(kana => !currentProgress[kana.char].mastered);

    if (availableKana.length === 0) return null;

    const nextKana = selectNextItem(availableKana, currentProgress, currentItem?.key);

    if (!nextKana) return null;

    const newItem = {
      key: nextKana.char,
      question: nextKana.char,
      answer: nextKana.reading,
    };

    const setters = { setCurrentItem, setUserInput, setFeedback, setProgress };
    const refs = { currentItemStartRef };
    finalizeItemSelection(newItem, nextKana.char, setters, refs);

    return newItem;
  };

  return {
    initializeKanaGame,
    selectNextKana,
  };
};
