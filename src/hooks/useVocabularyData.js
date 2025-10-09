import { useState, useEffect } from 'react';


export const useVocabularyData = (language = 'fr') => {
  const [vocabularyLists, setVocabularyLists] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVocabularyLists = async () => {
      const lists = {};

      try {
        const fr = import.meta.glob(`../data/vocabulary/fr/*.json`);

        const loadPromises = Object.entries(fr).map(async ([path, importFn]) => {
          try {
            const data = await importFn();
            const filename = path.split('/').pop().replace('.json', '');

            if (data.default && data.default.name && data.default.words) {
              lists[filename] = {
                name: data.default.name,
                words: data.default.words
              };
            } else {
              console.warn(`Invalid format for vocabulary list: ${filename}`);
            }
          } catch (error) {
            console.warn(`Failed to load vocabulary file: ${path}`, error);
          }
        });

        await Promise.all(loadPromises);

        setVocabularyLists(lists);
      } catch (error) {
        console.error('Failed to load vocabulary lists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularyLists();
  }, [language]);

  return { vocabularyLists, loading };
};
