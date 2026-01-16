import { createContext, useContext, useState, useEffect } from 'react';
import { KANJI_STEPS, GAME_STATES } from '../constants';
import { useDataKanji } from '../hooks';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { useGameContext } from './GameContext';
import { kanjiAPI } from '../services/apiService';
import {
  getFirstStepForKanji,
  getNextStepForKanji,
  getReadingGroupsForDisplay,
} from '../utils';


const GameContextKanji = createContext();

export const KanjiGameProvider = ({ children }) => {
  const { kanjiMode, language } = usePreferences();
  const { isAuthenticated } = useAuth();
  const { gameState } = useGameContext();
  const { kanjiLists, loading: kanjiLoading, error: kanjiError } = useDataKanji(language, isAuthenticated);

  // Step management for multi-step kanji validation
  const [currentStep, setCurrentStep] = useState(KANJI_STEPS.KUN_READINGS);
  const [stepData, setStepData] = useState({
    kunReadings: [],
    onReadings: []
  });

  // Kanji-specific selections
  const [kanjiSelectedLists, setKanjiSelectedLists] = useState([]);
  const [currentKanjiList, setCurrentKanjiList] = useState([]);
  const [sessionFavoritesKanji, setSessionFavoritesKanji] = useState(new Map());

  // Local override for kanjiLists metadata (to update counts without refetching)
  const [kanjiListsOverrides, setKanjiListsOverrides] = useState({});

  // Cache for loaded kanji by selection (key = sorted listIds + lang)
  const [kanjiCache, setKanjiCache] = useState({});

  // Clean up empty favorites list when returning to menu
  useEffect(() => {
    if (gameState === GAME_STATES.MENU) {
      const favoritesCount = kanjiListsOverrides.favorites?.count ?? kanjiLists.favorites?.count ?? 0;
      if (favoritesCount === 0 && kanjiSelectedLists.includes('favorites')) {
        setKanjiSelectedLists(prev => prev.filter(id => id !== 'favorites'));
      }
    }
  }, [gameState]);

  // Favorites management
  const addKanjiToFavorites = async (kanjiId) => {
    if (!isAuthenticated || !kanjiId) return;

    // Optimistic update
    setSessionFavoritesKanji(prev => new Map(prev).set(kanjiId, true));
    setKanjiListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: (prev.favorites?.count || kanjiLists.favorites?.count || 0) + 1
      }
    }));

    // Update cache: set isFavorite to true for this kanji in all cache entries
    setKanjiCache(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cacheKey => {
        updated[cacheKey] = updated[cacheKey].map(kanji =>
          kanji.id === kanjiId ? { ...kanji, isFavorite: true } : kanji
        );
      });
      return updated;
    });

    try {
      await kanjiAPI.addToFavorites(kanjiId);
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      // Revert on error
      setSessionFavoritesKanji(prev => {
        const newMap = new Map(prev);
        newMap.delete(kanjiId);
        return newMap;
      });
      setKanjiListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: Math.max(0, (prev.favorites?.count || kanjiLists.favorites?.count || 0) - 1)
        }
      }));
      // Revert cache
      setKanjiCache(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(cacheKey => {
          updated[cacheKey] = updated[cacheKey].map(kanji =>
            kanji.id === kanjiId ? { ...kanji, isFavorite: false } : kanji
          );
        });
        return updated;
      });
    }
  };

  const removeKanjiFromFavorites = async (kanjiId) => {
    if (!isAuthenticated || !kanjiId) return;

    const currentCount = kanjiListsOverrides.favorites?.count || kanjiLists.favorites?.count || 0;
    const newCount = Math.max(0, currentCount - 1);

    // Optimistic update
    setSessionFavoritesKanji(prev => {
      const newMap = new Map(prev);
      newMap.delete(kanjiId);
      return newMap;
    });
    setKanjiListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: newCount
      }
    }));

    // Update cache: set isFavorite to false for this kanji in all cache entries
    setKanjiCache(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cacheKey => {
        updated[cacheKey] = updated[cacheKey].map(kanji =>
          kanji.id === kanjiId ? { ...kanji, isFavorite: false } : kanji
        );
      });
      return updated;
    });

    // If favorites list becomes empty and is selected, remove it from selection
    // BUT only if we're in MENU state (not during a game or review session)
    if (newCount === 0 && kanjiSelectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
      setKanjiSelectedLists(prev => prev.filter(id => id !== 'favorites'));
    }

    try {
      await kanjiAPI.removeFromFavorites(kanjiId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      // Revert on error
      setSessionFavoritesKanji(prev => new Map(prev).set(kanjiId, true));
      setKanjiListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: currentCount
        }
      }));
      // Revert cache
      setKanjiCache(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(cacheKey => {
          updated[cacheKey] = updated[cacheKey].map(kanji =>
            kanji.id === kanjiId ? { ...kanji, isFavorite: true } : kanji
          );
        });
        return updated;
      });
      // Revert selection if it was removed
      if (newCount === 0 && !kanjiSelectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
        setKanjiSelectedLists(prev => [...prev, 'favorites']);
      }
    }
  };

  // Reset steps when moving to a new kanji
  const resetSteps = (currentKanji = null) => {
    if (!currentKanji) {
      setCurrentStep(KANJI_STEPS.KUN_READINGS);
      setStepData({ readingGroups: [] });
      return;
    }

    const firstStep = getFirstStepForKanji(currentKanji.readings, kanjiMode);

    if (firstStep === KANJI_STEPS.MEANINGS) {
      const readingGroups = getReadingGroupsForDisplay(currentKanji.readings);
      setStepData({ readingGroups });
    } else {
      setStepData({ readingGroups: [] });
    }

    setCurrentStep(firstStep);
  };

  const proceedToNextStep = (currentKanji) => {
    const nextStep = getNextStepForKanji(currentStep, currentKanji.readings, kanjiMode);

    // Store complete reading groups ONLY when transitioning to meanings step
    if (nextStep === KANJI_STEPS.MEANINGS) {
      const readingGroups = getReadingGroupsForDisplay(currentKanji.readings);
      setStepData({ readingGroups });
    }

    setCurrentStep(nextStep);
  };

  const value = {
    // Data
    kanjiLists,
    kanjiLoading,
    kanjiError,

    // Step state
    currentStep,
    setCurrentStep,
    stepData,
    setStepData,

    // Kanji selection
    kanjiSelectedLists,
    setKanjiSelectedLists,
    currentKanjiList,
    setCurrentKanjiList,

    // Favorites
    sessionFavoritesKanji,
    setSessionFavoritesKanji,
    kanjiListsOverrides,
    addKanjiToFavorites,
    removeKanjiFromFavorites,

    // Cache
    kanjiCache,
    setKanjiCache,

    // Step actions
    resetSteps,
    proceedToNextStep,
  };

  return (
    <GameContextKanji.Provider value={value}>
      {children}
    </GameContextKanji.Provider>
  );
};

export const useGameContextKanji = () => {
  const context = useContext(GameContextKanji);
  if (!context) {
    throw new Error('useGameContextKanji must be used within KanjiGameProvider');
  }
  return context;
};
