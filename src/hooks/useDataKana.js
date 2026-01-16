import { useState, useEffect } from 'react';
import { toRomaji } from 'wanakana';
import { kanaAPI } from '../services/apiService';


const convertKanaList = (kanaArray) => {
  return kanaArray.map(char => ({
    char,
    reading: toRomaji(char)
  }));
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

        setKanaData({
          hiragana: convertKanaList(response.hiragana),
          katakana: convertKanaList(response.katakana),
          hiraganaDakuten: convertKanaList(response.hiraganaDakuten),
          katakanaDakuten: convertKanaList(response.katakanaDakuten),
          hiraganaCombinations: convertKanaList(response.hiraganaCombinations),
          katakanaCombinations: convertKanaList(response.katakanaCombinations)
        });
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
