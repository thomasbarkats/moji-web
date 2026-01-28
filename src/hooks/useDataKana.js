import { useState, useEffect } from 'react';
import { toRomaji } from 'wanakana';
import { kanaAPI } from '../services/apiService';


/**
 * Groups flat kana array by category and adds reading
 * @param {Array} kanaArray - Array of { id, character, category }
 * @returns {Object} Grouped kana data by category
 */
const groupKanaByCategory = (kanaArray) => {
  const grouped = {
    hiragana: [],
    katakana: [],
    hiraganaDakuten: [],
    katakanaDakuten: [],
    hiraganaCombinations: [],
    katakanaCombinations: []
  };

  kanaArray.forEach(kana => {
    const category = kana.category;
    if (grouped[category]) {
      grouped[category].push({
        id: kana.id,
        char: kana.character,
        reading: toRomaji(kana.character)
      });
    }
  });

  return grouped;
};

export const useDataKana = () => {
  const [kanaData, setKanaData] = useState({
    hiragana: [],
    katakana: [],
    hiraganaDakuten: [],
    katakanaDakuten: [],
    hiraganaCombinations: [],
    katakanaCombinations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKanaData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await kanaAPI.getAll();

        // API now returns flat array of { id, character, category }
        const kanaArray = Array.isArray(response) ? response : (response?.items || response?.data || []);
        setKanaData(groupKanaByCategory(kanaArray));
      } catch (err) {
        console.error('Failed to load kana data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKanaData();
  }, []);

  return { kanaData, loading, error };
};
