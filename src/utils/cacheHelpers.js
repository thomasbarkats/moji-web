/**
 * Generate a cache key from selected lists and language
 * @param {string[]} selectedLists - Array of list IDs
 * @param {string} language - Current language code
 * @returns {string} Cache key
 */
export const getCacheKey = (selectedLists, language) => {
  return `${[...selectedLists].sort().join(',')}_${language}`;
};

/**
 * Initialize a favorites map from items with isFavorite field
 * @param {Array} items - Array of items with id and isFavorite fields
 * @returns {Map} Map of itemId -> true for favorites
 */
export const initializeFavoritesMap = (items) => {
  const favoritesMap = new Map();
  items.forEach(item => {
    if (item.isFavorite) {
      favoritesMap.set(item.id, true);
    }
  });
  return favoritesMap;
};

/**
 * Update cache to set isFavorite for an item across all entries
 * @param {Object} cache - Current cache object
 * @param {string|number} itemId - ID of the item to update
 * @param {boolean} isFavorite - New favorite status
 * @returns {Object} Updated cache object
 */
export const updateCacheFavoriteStatus = (cache, itemId, isFavorite) => {
  const updated = { ...cache };
  Object.keys(updated).forEach(cacheKey => {
    updated[cacheKey] = updated[cacheKey].map(item =>
      item.id === itemId ? { ...item, isFavorite } : item
    );
  });
  return updated;
};

/**
 * Load data from cache or API with automatic caching
 * Used in game logic hooks for loading kanji/vocabulary data
 *
 * @param {Object} options
 * @param {string[]} options.selectedLists - List IDs to load
 * @param {Object} options.cache - Current cache object
 * @param {Function} options.setCache - Setter for cache
 * @param {string} options.language - Current language code
 * @param {Function} options.fetchFn - API function (receives selectedLists, language)
 * @param {string} options.dataKey - Key in API response containing the data array
 * @returns {Promise<Array>} Loaded data
 */
export const loadDataWithCache = async ({
  selectedLists,
  cache,
  setCache,
  language,
  fetchFn,
  dataKey,
}) => {
  const cacheKey = getCacheKey(selectedLists, language);

  // Check cache first
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Fetch from API
  try {
    const response = await fetchFn(selectedLists, language);
    const data = response[dataKey] || [];

    // Store in cache
    setCache(prev => ({ ...prev, [cacheKey]: data }));

    return data;
  } catch (error) {
    console.error(`Failed to load ${dataKey}:`, error);
    return [];
  }
};
