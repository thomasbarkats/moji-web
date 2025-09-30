import { useState, useEffect } from 'react';


const VOCABULARY_LISTS = {
  'premiers-kanji': 'Premiers mots en kanji',
  'formules-politesse': 'Les formules de politesse',
  'materiel-domestique': 'Le matériel domestique',
  'pays': 'Les pays',
};

export const useVocabularyData = (language = 'fr') => {
  const [vocabularyLists, setVocabularyLists] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadVocabularyLists = async () => {
      const lists = {};

      for (const [key, name] of Object.entries(VOCABULARY_LISTS)) {
        try {
          const data = await import(`../data/${language}/${key}.json`);

          lists[key] = {
            name,
            words: Object.entries(data.default).map(([japanese, translation]) => ({
              japanese,
              translation
            }))
          };
        } catch (error) {
          console.warn(`Failed to load vocabulary list: ${key}`, error);
        }
      }

      setVocabularyLists(lists);
      setLoading(false);
    };

    loadVocabularyLists();
  }, [language]);


  return { vocabularyLists, loading };
};
