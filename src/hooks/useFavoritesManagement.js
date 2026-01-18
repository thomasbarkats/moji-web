import { useCallback } from 'react';
import { GAME_STATES } from '../constants';
import { updateCacheFavoriteStatus } from '../utils/cacheHelpers';


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
  setCache,
}) => {
  const getCurrentFavoritesCount = useCallback(() => {
    return listsOverrides.favorites?.count ?? lists.favorites?.count ?? 0;
  }, [listsOverrides, lists]);

  const addToFavorites = useCallback(async (itemId) => {
    if (!isAuthenticated || !itemId) return;

    setSessionFavorites(prev => new Map(prev).set(itemId, true));
    setListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: (prev.favorites?.count || lists.favorites?.count || 0) + 1
      }
    }));
    setCache(prev => updateCacheFavoriteStatus(prev, itemId, true));

    try {
      await api.addToFavorites(itemId);
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      setSessionFavorites(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
      setListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: Math.max(0, (prev.favorites?.count || lists.favorites?.count || 0) - 1)
        }
      }));
      setCache(prev => updateCacheFavoriteStatus(prev, itemId, false));
    }
  }, [isAuthenticated, api, lists, setSessionFavorites, setListsOverrides, setCache]);

  const removeFromFavorites = useCallback(async (itemId) => {
    if (!isAuthenticated || !itemId) return;

    const currentCount = getCurrentFavoritesCount();
    const newCount = Math.max(0, currentCount - 1);

    setSessionFavorites(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
    setListsOverrides(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        count: newCount
      }
    }));
    setCache(prev => updateCacheFavoriteStatus(prev, itemId, false));

    // Auto-deselect favorites list when it becomes empty (only in menu, not during game)
    if (newCount === 0 && selectedLists.includes('favorites') && gameState === GAME_STATES.MENU) {
      setSelectedLists(prev => prev.filter(id => id !== 'favorites'));
    }

    try {
      await api.removeFromFavorites(itemId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      setSessionFavorites(prev => new Map(prev).set(itemId, true));
      setListsOverrides(prev => ({
        ...prev,
        favorites: {
          ...prev.favorites,
          count: currentCount
        }
      }));
      setCache(prev => updateCacheFavoriteStatus(prev, itemId, true));
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
