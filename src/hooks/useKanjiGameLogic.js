import { useGameContext } from '../contexts/GameContext';
import { useKanjiGameContext } from '../contexts/KanjiGameContext';
import { GAME_STATES, GAME_MODES } from '../constants';


export const useKanjiGameLogic = () => {
  const {
    kanjiLists,
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

  const { setCurrentKanjiList, resetSteps } = useKanjiGameContext();


  const initializeKanjiGame = (selectedLists) => {
    setGameMode(GAME_MODES.KANJI);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const allKanji = selectedLists.flatMap(listKey =>
      kanjiLists[listKey]?.kanji || []
    );

    setCurrentKanjiList(allKanji);

    const initialProgress = {};
    const initialStats = {};

    allKanji.forEach(kanji => {
      initialProgress[kanji.character] = {
        successes: 0,
        failures: 0,
        mastered: false,
      };
      initialStats[kanji.character] = {
        key: kanji.character,
        question: kanji.character,
        answer: '',
        successes: 0,
        failures: 0,
        timeSpent: 0,
      };
    });

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKanji(allKanji, initialProgress);
  };

  const selectNextKanji = (allKanji, currentProgress) => {
    const availableKanji = allKanji.filter(
      kanji => !currentProgress[kanji.character].mastered
    );

    if (availableKanji.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableKanji.length);
    const nextKanji = availableKanji[randomIndex];

    const newItem = {
      key: nextKanji.character,
      question: nextKanji.character,
      answer: '',
      readings: nextKanji.readings,
      notes: nextKanji.notes,
    };

    setCurrentItem(newItem);
    setUserInput('');
    setFeedback(null);
    resetSteps();
    currentItemStartRef.current = Date.now();

    return newItem;
  };

  return {
    initializeKanjiGame,
    selectNextKanji,
  };
};
