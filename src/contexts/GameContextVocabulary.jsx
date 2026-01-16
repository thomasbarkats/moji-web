import { createContext, useContext, useState, useEffect } from 'react';
import { GAME_STATES, GAME_MODES } from '../constants';
import { useDataVocabulary } from '../hooks';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { useGameContext } from './GameContext';
import { vocabularyAPI } from '../services/apiService';


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

  // Favorites management
  const addVocabularyToFavorites = async (wordId) => {
    if (!isAuthenticated || !wordId) return;

    // Optimistic update
    setSessionFavoritesVocabulary(prev => new Map(prev).set(wordId, true));
    setVocabularyListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: (prev.favorites?.count || vocabularyLists.favorites?.count || 0) + 1
      }
    }));

    // Update cache: set isFavorite to true for this word in all cache entries
    setWordsCache(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cacheKey => {
        updated[cacheKey] = updated[cacheKey].map(word =>
          word.id === wordId ? { ...word, isFavorite: true } : word
        );
      });
      return updated;
    });

    try {
      await vocabularyAPI.addToFavorites(wordId);
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      // Revert on error
      setSessionFavoritesVocabulary(prev => {
        const newMap = new Map(prev);
        newMap.delete(wordId);
        return newMap;
      });
      setVocabularyListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: Math.max(0, (prev.favorites?.count || vocabularyLists.favorites?.count || 0) - 1)
        }
      }));
      // Revert cache
      setWordsCache(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(cacheKey => {
          updated[cacheKey] = updated[cacheKey].map(word =>
            word.id === wordId ? { ...word, isFavorite: false } : word
          );
        });
        return updated;
      });
    }
  };

  const removeVocabularyFromFavorites = async (wordId) => {
    if (!isAuthenticated || !wordId) return;

    const currentCount = vocabularyListsOverrides.favorites?.count || vocabularyLists.favorites?.count || 0;
    const newCount = Math.max(0, currentCount - 1);

    // Optimistic update
    setSessionFavoritesVocabulary(prev => {
      const newMap = new Map(prev);
      newMap.delete(wordId);
      return newMap;
    });
    setVocabularyListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: newCount
      }
    }));

    // Update cache: set isFavorite to false for this word in all cache entries
    setWordsCache(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cacheKey => {
        updated[cacheKey] = updated[cacheKey].map(word =>
          word.id === wordId ? { ...word, isFavorite: false } : word
        );
      });
      return updated;
    });

    // If favorites list becomes empty and is selected, remove it from selection
    // BUT only if we're in MENU state (not during a game or review session)
    if (newCount === 0 && wordsSelectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
      setWordsSelectedLists(prev => prev.filter(id => id !== 'favorites'));
    }

    try {
      await vocabularyAPI.removeFromFavorites(wordId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      // Revert on error
      setSessionFavoritesVocabulary(prev => new Map(prev).set(wordId, true));
      setVocabularyListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: currentCount
        }
      }));
      // Revert cache
      setWordsCache(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(cacheKey => {
          updated[cacheKey] = updated[cacheKey].map(word =>
            word.id === wordId ? { ...word, isFavorite: true } : word
          );
        });
        return updated;
      });
      // Revert selection if it was removed
      if (newCount === 0 && !wordsSelectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
        setWordsSelectedLists(prev => [...prev, 'favorites']);
      }
    }
  };

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
    addVocabularyToFavorites,
    removeVocabularyFromFavorites,

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
