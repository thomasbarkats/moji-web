import { useState, useEffect } from 'react';
import hiraganaJSON from '../../data/hiragana.json';
import katakanaJSON from '../../data/katakana.json';


export const useKanaData = () => {
  const [kanaData, setKanaData] = useState({ hiragana: [], katakana: [] });


  useEffect(() => {
    const hiraganaArray = Object.entries(hiraganaJSON).map(([char, reading]) => ({ char, reading }));
    const katakanaArray = Object.entries(katakanaJSON).map(([char, reading]) => ({ char, reading }));
    setKanaData({ hiragana: hiraganaArray, katakana: katakanaArray });
  }, []);

  return kanaData;
};
