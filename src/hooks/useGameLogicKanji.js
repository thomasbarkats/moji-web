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

    // Load actual kanji data from API for all selected lists in one request
    const isFavoritesIncluded = selectedLists.includes('favorites');
    let allKanji = [];
    const cacheKey = `${[...selectedLists].sort().join(',')}_${language}`;

    // Check cache first
    if (kanjiCache[cacheKey]) {
      allKanji = kanjiCache[cacheKey];
    } else {
      try {
        const listData = await kanjiAPI.getKanji(selectedLists, language);
        // API returns kanji with readings.meanings in the correct language
        allKanji = listData.kanji || [];
        // Store in cache
        setKanjiCache(prev => ({ ...prev, [cacheKey]: allKanji }));
      } catch (error) {
        console.error(`Failed to load kanji lists:`, error);
      }
    }

    // Initialize session favorites using isFavorite field
    if (isFavoritesIncluded) {
      const favoritesMap = new Map();
      allKanji.forEach(kanji => {
        if (kanji.isFavorite) {
          favoritesMap.set(kanji.id, true);
        }
      });
      setSessionFavoritesKanji(favoritesMap);
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
