import { useState, useCallback } from 'react';
import { getCacheKey, initializeFavoritesMap } from '../utils/cacheHelpers';

/**
 * Shared hook for loading data with caching and favorites initialization
 * Works for both vocabulary and kanji in Review components and game logic
 *
 * @param {Object} options
 * @param {Object} options.cache - Current cache object
 * @param {Function} options.setCache - Setter for cache
 * @param {Function} options.setSessionFavorites - Setter for session favorites (optional)
 * @param {string} options.language - Current language code
 */
export const useDataLoader = ({
  cache,
  setCache,
  setSessionFavorites,
  language,
}) => {
  const [loading, setLoading] = useState(true);

  /**
   * Load data from cache or API
   * @param {Object} params
   * @param {string[]} params.selectedLists - List IDs to load
   * @param {Function} params.fetchFn - API function to fetch data (receives selectedLists, language)
   * @param {string} params.dataKey - Key in API response containing the data array (e.g., 'words' or 'kanji')
   * @param {boolean} params.showLoadingState - Whether to manage loading state (default: true)
   * @returns {Promise<Array>} Loaded data
   */
  const loadData = useCallback(async ({
    selectedLists,
    fetchFn,
    dataKey,
    showLoadingState = true,
  }) => {
    if (!selectedLists || selectedLists.length === 0) {
      return [];
    }

    const cacheKey = getCacheKey(selectedLists, language);
    const isFavoritesIncluded = selectedLists.includes('favorites');

    // Check cache first
    if (cache[cacheKey]) {
      const cachedData = cache[cacheKey];

      // Initialize session favorites if needed
      if (isFavoritesIncluded && setSessionFavorites) {
        setSessionFavorites(initializeFavoritesMap(cachedData));
      }

      if (showLoadingState) {
        setLoading(false);
      }

      return cachedData;
    }

    // Data not in cache - fetch from API
    if (showLoadingState) {
      setLoading(true);
    }

    try {
      const response = await fetchFn(selectedLists, language);
      const data = response[dataKey] || [];

      // Store in cache
      setCache(prev => ({ ...prev, [cacheKey]: data }));

      // Initialize session favorites if needed
      if (isFavoritesIncluded && setSessionFavorites) {
        setSessionFavorites(initializeFavoritesMap(data));
      }

      return data;
    } catch (error) {
      console.error(`Failed to load ${dataKey}:`, error);
      return [];
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [cache, setCache, setSessionFavorites, language]);

  /**
   * Load data synchronously from cache only (no API call)
   * Used when we want to avoid loading flash for cached data
   * @param {string[]} selectedLists - List IDs to check
   * @returns {Array|null} Cached data or null if not cached
   */
  const getFromCache = useCallback((selectedLists) => {
    if (!selectedLists || selectedLists.length === 0) {
      return null;
    }

    const cacheKey = getCacheKey(selectedLists, language);
    return cache[cacheKey] || null;
  }, [cache, language]);

  return {
    loading,
    setLoading,
    loadData,
    getFromCache,
  };
};
