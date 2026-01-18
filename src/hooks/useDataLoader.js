import { useState, useCallback } from 'react';
import { getCacheKey, initializeFavoritesMap } from '../utils/cacheHelpers';


export const useDataLoader = ({
  cache,
  setCache,
  setSessionFavorites,
  language,
}) => {
  const [loading, setLoading] = useState(true);

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

    if (cache[cacheKey]) {
      const cachedData = cache[cacheKey];
      if (isFavoritesIncluded && setSessionFavorites) {
        setSessionFavorites(initializeFavoritesMap(cachedData));
      }
      if (showLoadingState) {
        setLoading(false);
      }
      return cachedData;
    }

    if (showLoadingState) {
      setLoading(true);
    }

    try {
      const response = await fetchFn(selectedLists, language);
      const data = response[dataKey] || [];

      setCache(prev => ({ ...prev, [cacheKey]: data }));
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
