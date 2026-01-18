import { createContext, useContext, useState, useEffect } from 'react';
import { KANJI_STEPS, GAME_STATES } from '../constants';
import { useDataKanji } from '../hooks';
import { useFavoritesManagement } from '../hooks/useFavoritesManagement';
import { kanjiAPI } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useGameContext } from './GameContext';
import { usePreferences } from './PreferencesContext';
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

  // Favorites management using shared hook
  const { addToFavorites, removeFromFavorites, toggleFavorite } = useFavoritesManagement({
    api: kanjiAPI,
    isAuthenticated,
    gameState,
    lists: kanjiLists,
    selectedLists: kanjiSelectedLists,
    setSelectedLists: setKanjiSelectedLists,
    sessionFavorites: sessionFavoritesKanji,
    setSessionFavorites: setSessionFavoritesKanji,
    listsOverrides: kanjiListsOverrides,
    setListsOverrides: setKanjiListsOverrides,
    setCache: setKanjiCache,
  });

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
    addKanjiToFavorites: addToFavorites,
    removeKanjiFromFavorites: removeFromFavorites,
    toggleKanjiFavorite: toggleFavorite,

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
