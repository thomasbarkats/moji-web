import { useState, useEffect } from 'react';
import { LANGUAGES } from '../constants';
import { kanjiAPI } from '../services/apiService';


export const useDataKanji = (language = LANGUAGES.EN, isAuthenticated = false) => {
  const [kanjiLists, setKanjiLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadKanjiLists = async () => {
      try {
        setLoading(true);
        setError(null);

        const listsResponse = await kanjiAPI.getLists(language);
        const loadedLists = {};

        listsResponse.lists.forEach((listMeta) => {
          const kanjiChars = listMeta.preview ? listMeta.preview.split(' ').filter(c => c) : [];
          const kanjiArray = kanjiChars.map(char => ({
            character: char,
            strokes: 0,
            notes: '',
            readings: []
          }));

          loadedLists[listMeta.id] = {
            name: listMeta.name,
            kanji: kanjiArray,
            isLocked: listMeta.isLocked,
            count: listMeta.kanjiCount || kanjiArray.length
          };
        });

        setKanjiLists(loadedLists);
      } catch (error) {
        console.error('Failed to load kanji lists:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadKanjiLists();
  }, [language, isAuthenticated]);

  return { kanjiLists, loading, error };
};
