import { useState, useEffect } from 'react';


export const useDataKanji = () => {
  const [kanjiLists, setKanjiLists] = useState({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadKanjiLists = async () => {
      try {
        const modules = import.meta.glob('../data/kanji/fr/*.json');
        const loadedLists = {};

        for (const path in modules) {
          const module = await modules[path]();
          const filename = path.split('/').pop().replace('.json', '');
          loadedLists[filename] = module.default || module;
        }

        setKanjiLists(loadedLists);
      } catch (error) {
        console.error('Failed to load kanji lists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKanjiLists();
  }, []);

  return { kanjiLists, loading };
};
