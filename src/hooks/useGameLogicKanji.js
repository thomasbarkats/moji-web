import { GAME_MODES, KANJI_STEPS } from '../constants';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { kanjiAPI } from '../services/apiService';
import {
  selectNextItem,
  initializeGameState,
  finalizeItemSelection,
  initializeKanjiData,
  getFirstStepForKanji,
  initializeFavoritesMap,
  loadDataWithCache,
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
    setCurrentKanjiList,
    resetSteps,
    setCurrentStep,
    setStepData,
    setSessionFavoritesKanji,
    kanjiCache,
    setKanjiCache,
  } = useGameContextKanji();

  const { language } = usePreferences();


  const initializeKanjiGame = async (selectedLists) => {
    const setters = { setGameMode, setGameState, setUserInput, setStartTime, setFeedback };
    initializeGameState(setters, GAME_MODES.KANJI);

    // Load kanji data from cache or API
    const isFavoritesIncluded = selectedLists.includes('favorites');
    const allKanji = await loadDataWithCache({
      selectedLists,
      cache: kanjiCache,
      setCache: setKanjiCache,
      language,
      fetchFn: kanjiAPI.getKanji,
      dataKey: 'kanji',
    });

    // Initialize session favorites using isFavorite field
    if (isFavoritesIncluded) {
      setSessionFavoritesKanji(initializeFavoritesMap(allKanji));
    } else {
      setSessionFavoritesKanji(new Map());
    }

    if (allKanji.length === 0) return;

    setCurrentKanjiList(allKanji);

    const { initialProgress, initialStats } = initializeKanjiData(allKanji);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKanji(allKanji, initialProgress);
  };

  const selectNextKanji = (allKanji, currentProgress, forceRepeatKanji = null, forceRestartStep = null) => {
    const availableKanji = allKanji.filter(
      kanji => !currentProgress[kanji.character].mastered
    );

    if (availableKanji.length === 0) return null;

    let nextKanji;

    // Check if we need to force repeat a kanji (loop mode)
    if (forceRepeatKanji) {
      nextKanji = allKanji.find(k => k.character === forceRepeatKanji);
    } else {
      nextKanji = selectNextItem(availableKanji, currentProgress, currentItem?.key);
    }

    if (!nextKanji) return null;

    const newItem = {
      id: nextKanji.id,
      key: nextKanji.character,
      question: nextKanji.character,
      answer: '',
      readings: nextKanji.readings,
      notes: nextKanji.notes,
    };

    // Reset steps normally first
    resetSteps(nextKanji);

    // If there's a restart step specified, override it and update stepData if needed
    if (forceRestartStep !== null) {
      setCurrentStep(forceRestartStep);

      // If restarting at meanings step, we need to set the reading groups
      if (forceRestartStep === KANJI_STEPS.MEANINGS) {
        const readingGroups = nextKanji.readings.map(r => ({
          kun: r.kun && Array.isArray(r.kun) && r.kun.length > 0 ? r.kun : null,
          on: r.on && Array.isArray(r.on) && r.on.length > 0 ? r.on : null
        }));
        setStepData({ readingGroups });
      }
    }

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
