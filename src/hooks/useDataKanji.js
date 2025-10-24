import { useState, useEffect } from 'react';
import { LANGUAGES } from '../constants';


export const useDataKanji = (language = LANGUAGES.EN) => {
  const [kanjiLists, setKanjiLists] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadKanjiLists = async () => {
      try {
        const modules = import.meta.glob('../data/kanji/*.json');
        const loadedLists = {};

        for (const path in modules) {
          const module = await modules[path]();
          const data = module.default || module;
          const filename = path.split('/').pop().replace('.json', '');

          if (data && data[language] && data.kanji) {
            // Transform kanji readings to use language-specific meanings
            const transformedKanji = data.kanji.map(k => ({
              ...k,
              readings: k.readings.map(reading => ({
                kun: reading.kun,
                on: reading.on,
                meanings: reading[language] || []
              }))
            }));

            loadedLists[filename] = {
              name: data[language],
              kanji: transformedKanji
            };
          }
        }

        setKanjiLists(loadedLists);
      } catch (error) {
        console.error('Failed to load kanji lists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKanjiLists();
  }, [language]);

  return { kanjiLists, loading };
};
