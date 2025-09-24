import { useState, useEffect } from 'react';
import hiraganaJSON from '../data/hiragana.json';
import katakanaJSON from '../data/katakana.json';
import hiraganaDakutenJSON from '../data/hiragana-dh.json';
import katakanaDakutenJSON from '../data/katakana-dh.json';
import hiraganaCombinationsJSON from '../data/hiragana-yoon.json';
import katakanaCombinationsJSON from '../data/katakana-yoon.json';


export const useKanaData = () => {
  const [kanaData, setKanaData] = useState({
    hiragana: [],
    katakana: [],
    hiraganaDakuten: [],
    katakanaDakuten: [],
    hiraganaCombinations: [],
    katakanaCombinations: []
  });


  useEffect(() => {
    const hiraganaArray = Object.entries(hiraganaJSON).map(([char, reading]) => ({ char, reading }));
    const katakanaArray = Object.entries(katakanaJSON).map(([char, reading]) => ({ char, reading }));
    const hiraganaDakutenArray = Object.entries(hiraganaDakutenJSON).map(([char, reading]) => ({ char, reading }));
    const katakanaDakutenArray = Object.entries(katakanaDakutenJSON).map(([char, reading]) => ({ char, reading }));
    const hiraganaCombinationsArray = Object.entries(hiraganaCombinationsJSON).map(([char, reading]) => ({ char, reading }));
    const katakanaCombinationsArray = Object.entries(katakanaCombinationsJSON).map(([char, reading]) => ({ char, reading }));

    setKanaData({
      hiragana: hiraganaArray,
      katakana: katakanaArray,
      hiraganaDakuten: hiraganaDakutenArray,
      katakanaDakuten: katakanaDakutenArray,
      hiraganaCombinations: hiraganaCombinationsArray,
      katakanaCombinations: katakanaCombinationsArray
    });
  }, []);

  return kanaData;
};
