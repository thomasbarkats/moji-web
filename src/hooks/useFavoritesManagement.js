import { useCallback } from 'react';
import { GAME_STATES } from '../constants';
import { updateCacheFavoriteStatus } from '../utils/cacheHelpers';


/**
 * Shared hook for managing favorites with optimistic updates
 * Works for both vocabulary and kanji
 *
 * @param {Object} options
 * @param {Object} options.api - API object with addToFavorites and removeFromFavorites methods
 * @param {boolean} options.isAuthenticated - Whether the user is authenticated
 * @param {string} options.gameState - Current game state
 * @param {Object} options.lists - Lists metadata (e.g., vocabularyLists or kanjiLists)
 * @param {string[]} options.selectedLists - Currently selected list IDs
 * @param {Function} options.setSelectedLists - Setter for selected lists
 * @param {Map} options.sessionFavorites - Session favorites map
 * @param {Function} options.setSessionFavorites - Setter for session favorites
 * @param {Object} options.listsOverrides - Local overrides for lists metadata
 * @param {Function} options.setListsOverrides - Setter for lists overrides
 * @param {Object} options.cache - Data cache object
 * @param {Function} options.setCache - Setter for cache
 */
export const useFavoritesManagement = ({
  api,
  isAuthenticated,
  gameState,
  lists,
  selectedLists,
  setSelectedLists,
  sessionFavorites,
  setSessionFavorites,
  listsOverrides,
  setListsOverrides,
  cache,
  setCache,
}) => {
  const getCurrentFavoritesCount = useCallback(() => {
    return listsOverrides.favorites?.count ?? lists.favorites?.count ?? 0;
  }, [listsOverrides, lists]);

  const addToFavorites = useCallback(async (itemId) => {
    if (!isAuthenticated || !itemId) return;

    // Optimistic update - add to session
    setSessionFavorites(prev => new Map(prev).set(itemId, true));

    // Optimistic update - increment count
    setListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: (prev.favorites?.count || lists.favorites?.count || 0) + 1
      }
    }));

    // Optimistic update - update cache
    setCache(prev => updateCacheFavoriteStatus(prev, itemId, true));

    try {
      await api.addToFavorites(itemId);
    } catch (error) {
      console.error('Failed to add to favorites:', error);

      // Revert session favorites
      setSessionFavorites(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });

      // Revert count
      setListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: Math.max(0, (prev.favorites?.count || lists.favorites?.count || 0) - 1)
        }
      }));

      // Revert cache
      setCache(prev => updateCacheFavoriteStatus(prev, itemId, false));
    }
  }, [isAuthenticated, api, lists, setSessionFavorites, setListsOverrides, setCache]);

  const removeFromFavorites = useCallback(async (itemId) => {
    if (!isAuthenticated || !itemId) return;

    const currentCount = getCurrentFavoritesCount();
    const newCount = Math.max(0, currentCount - 1);

    // Optimistic update - remove from session
    setSessionFavorites(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });

    // Optimistic update - decrement count
    setListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: newCount
      }
    }));

    // Optimistic update - update cache
    setCache(prev => updateCacheFavoriteStatus(prev, itemId, false));

    // If favorites list becomes empty and is selected, remove it from selection
    // BUT only if we're in MENU state (not during a game or review session)
    if (newCount === 0 && selectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
      setSelectedLists(prev => prev.filter(id => id !== 'favorites'));
    }

    try {
      await api.removeFromFavorites(itemId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);

      // Revert session favorites
      setSessionFavorites(prev => new Map(prev).set(itemId, true));

      // Revert count
      setListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: currentCount
        }
      }));

      // Revert cache
      setCache(prev => updateCacheFavoriteStatus(prev, itemId, true));

      // Revert selection if it was removed
      if (newCount === 0 && !selectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
        setSelectedLists(prev => [...prev, 'favorites']);
      }
    }
  }, [isAuthenticated, api, gameState, selectedLists, getCurrentFavoritesCount, setSelectedLists, setSessionFavorites, setListsOverrides, setCache]);

  const toggleFavorite = useCallback((itemId) => {
    if (!itemId) return;

    if (sessionFavorites.has(itemId)) {
      removeFromFavorites(itemId);
    } else {
      addToFavorites(itemId);
    }
  }, [sessionFavorites, addToFavorites, removeFromFavorites]);

  return {
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
  };
};
