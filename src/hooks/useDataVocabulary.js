import { useState, useEffect } from 'react';


export const useDataVocabulary = (language = 'fr') => {
  const [vocabularyLists, setVocabularyLists] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVocabularyLists = async () => {
      const lists = {};

      try {
        const modules = import.meta.glob('../data/vocabulary/*.json');

        const loadPromises = Object.entries(modules).map(async ([path, importFn]) => {
          try {
            const data = await importFn();
            const filename = path.split('/').pop().replace('.json', '');

            if (data.default && data.default[language] && data.default.words) {
              // Transform words to legacy format [japanese, translation, note?]
              const transformedWords = data.default.words.map(word => {
                const result = [word.jp, word[language]];
                // Add note if it exists
                const noteKey = `note_${language}`;
                if (word[noteKey]) {
                  result.push(word[noteKey]);
                }
                return result;
              });

              lists[filename] = {
                name: data.default[language],
                words: transformedWords
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
