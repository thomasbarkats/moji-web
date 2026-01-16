import { useState, useEffect } from 'react';
import { vocabularyAPI } from '../services/apiService';


export const useDataVocabulary = (language = 'fr', isAuthenticated = false) => {
  const [vocabularyLists, setVocabularyLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVocabularyLists = async () => {
      try {
        setLoading(true);
        setError(null);

        const listsResponse = await vocabularyAPI.getLists(language);
        const lists = {};

        listsResponse.lists.forEach((listMeta) => {
          const wordsArray = new Array(listMeta.wordCount || 0).fill(null);

          lists[listMeta.id] = {
            name: listMeta.name,
            words: wordsArray,
            isLocked: listMeta.isLocked,
            count: listMeta.wordCount || 0
          };
        });

        setVocabularyLists(lists);
      } catch (error) {
        console.error('Failed to load vocabulary lists:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularyLists();
  }, [language, isAuthenticated]);

  return { vocabularyLists, loading, error };
};
