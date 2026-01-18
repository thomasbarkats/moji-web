import { createContext, useContext, useState, useEffect } from 'react';
import { GAME_STATES, GAME_MODES } from '../constants';
import { useDataVocabulary } from '../hooks';
import { useFavoritesManagement } from '../hooks/useFavoritesManagement';
import { vocabularyAPI } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useGameContext } from './GameContext';
import { usePreferences } from './PreferencesContext';


const GameContextVocabulary = createContext();

export const VocabularyGameProvider = ({ children }) => {
  const { language } = usePreferences();
  const { isAuthenticated } = useAuth();
  const { gameState, setGameMode, setGameState } = useGameContext();
  const { vocabularyLists, loading: vocabularyLoading, error: vocabularyError } = useDataVocabulary(language, isAuthenticated);

  // Vocabulary-specific selections
  const [wordsSelectedLists, setWordsSelectedLists] = useState([]);
  const [currentVocabularyWords, setCurrentVocabularyWords] = useState([]);

  // Track which words in current session are favorites (word ID -> boolean)
  const [sessionFavoritesVocabulary, setSessionFavoritesVocabulary] = useState(new Map());

  // Local override for vocabularyLists metadata (to update counts without refetching)
  const [vocabularyListsOverrides, setVocabularyListsOverrides] = useState({});

  // Cache for loaded words by selection (key = sorted listIds + lang)
  const [wordsCache, setWordsCache] = useState({});

  // Expected count for review mode skeleton loading
  const [reviewExpectedCount, setReviewExpectedCount] = useState(0);

  // Clean up empty favorites list when returning to menu
  useEffect(() => {
    if (gameState === GAME_STATES.MENU) {
      const favoritesCount = vocabularyListsOverrides.favorites?.count ?? vocabularyLists.favorites?.count ?? 0;
      if (favoritesCount === 0 && wordsSelectedLists.includes('favorites')) {
        setWordsSelectedLists(prev => prev.filter(id => id !== 'favorites'));
      }
    }
  }, [gameState]);

  // Review mode
  const openReviewVocabulary = (lists, expectedCount = 0) => {
    setWordsSelectedLists(lists);
    setReviewExpectedCount(expectedCount);
    setGameMode(GAME_MODES.VOCABULARY);
    setGameState(GAME_STATES.REVIEW);
  };

  // Favorites management using shared hook
  const { addToFavorites, removeFromFavorites, toggleFavorite } = useFavoritesManagement({
    api: vocabularyAPI,
    isAuthenticated,
    gameState,
    lists: vocabularyLists,
    selectedLists: wordsSelectedLists,
    setSelectedLists: setWordsSelectedLists,
    sessionFavorites: sessionFavoritesVocabulary,
    setSessionFavorites: setSessionFavoritesVocabulary,
    listsOverrides: vocabularyListsOverrides,
    setListsOverrides: setVocabularyListsOverrides,
    cache: wordsCache,
    setCache: setWordsCache,
  });

  const value = {
    // Data
    vocabularyLists,
    vocabularyLoading,
    vocabularyError,

    // Vocabulary selections
    wordsSelectedLists,
    setWordsSelectedLists,
    currentVocabularyWords,
    setCurrentVocabularyWords,

    // Actions
    openReviewVocabulary,

    // Review
    reviewExpectedCount,

    // Favorites
    sessionFavoritesVocabulary,
    setSessionFavoritesVocabulary,
    vocabularyListsOverrides,
    addVocabularyToFavorites: addToFavorites,
    removeVocabularyFromFavorites: removeFromFavorites,
    toggleVocabularyFavorite: toggleFavorite,

    // Cache
    wordsCache,
    setWordsCache,
  };

  return (
    <GameContextVocabulary.Provider value={value}>
      {children}
    </GameContextVocabulary.Provider>
  );
};

export const useGameContextVocabulary = () => {
  const context = useContext(GameContextVocabulary);
  if (!context) {
    throw new Error('useGameContextVocabulary must be used within VocabularyGameProvider');
  }
  return context;
};
