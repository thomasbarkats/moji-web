import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressAPI } from '../services/apiService';


export const useProgress = (itemType) => {
  const { isAuthenticated, hasActiveSubscription, hasLifetimeAccess } = useAuth();
  const haveAccess = hasActiveSubscription || hasLifetimeAccess;
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    // Only fetch progress for premium users
    if (!isAuthenticated || !haveAccess) {
      setProgressData({});
      return;
    }

    setLoading(true);
    try {
      const result = await progressAPI.getProgress(itemType);

      const merged = {};
      const progressArray = Array.isArray(result)
        ? result
        : (result?.items || result?.progress || result?.data || []);

      progressArray.forEach(item => {
        const key = String(item.itemId);
        if (!merged[key]) {
          merged[key] = {};
        }
        merged[key][item.progressType] = {
          score: item.score || 0,
        };
      });

      setProgressData(merged);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      setProgressData({});
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, haveAccess, itemType]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  /**
   * Get progress for a specific item and progress type
   * @param {string} itemId - The item ID
   * @param {string} progressType - The progress type (e.g., 'kun_readings', 'to_japanese')
   * @returns {Object} { score: number }
   */
  const getProgress = useCallback((itemId, progressType) => {
    const key = String(itemId);
    const itemProgress = progressData[key];
    if (!itemProgress || !itemProgress[progressType]) {
      return { score: 0 };
    }
    return itemProgress[progressType];
  }, [progressData]);

  return {
    progressData,
    loading,
    getProgress,
    refetch: fetchProgress,
  };
};
