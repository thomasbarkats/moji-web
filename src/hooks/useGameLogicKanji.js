import { GAME_MODES } from '../constants';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import {
  selectNextItem,
  initializeGameState,
  finalizeItemSelection,
  initializeKanjiData,
} from '../utils';


export const useGameLogicKanji = () => {
  const {
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

  const {
    kanjiLists,
    setCurrentKanjiList,
    resetSteps,
  } = useGameContextKanji();


  const initializeKanjiGame = (selectedLists) => {
    const setters = { setGameMode, setGameState, setUserInput, setStartTime, setFeedback };
    initializeGameState(setters, GAME_MODES.KANJI);

    const allKanji = selectedLists.flatMap(listKey =>
      kanjiLists[listKey]?.kanji || []
    );

    setCurrentKanjiList(allKanji);

    const { initialProgress, initialStats } = initializeKanjiData(allKanji);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKanji(allKanji, initialProgress);
  };

  const selectNextKanji = (allKanji, currentProgress) => {
    const availableKanji = allKanji.filter(
      kanji => !currentProgress[kanji.character].mastered
    );

    if (availableKanji.length === 0) return null;

    const nextKanji = selectNextItem(availableKanji, currentProgress, currentItem?.key);

    if (!nextKanji) return null;

    const newItem = {
      key: nextKanji.character,
      question: nextKanji.character,
      answer: '',
      readings: nextKanji.readings,
      notes: nextKanji.notes,
    };

    resetSteps(nextKanji);

    const setters = { setCurrentItem, setUserInput, setFeedback, setProgress };
    const refs = { currentItemStartRef };
    finalizeItemSelection(newItem, nextKanji.character, setters, refs);

    return newItem;
  };

  return {
    initializeKanjiGame,
    selectNextKanji,
  };
};
