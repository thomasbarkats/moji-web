import { useState, useEffect } from 'react';
import { toRomaji } from 'wanakana';
import kanaJSON from '../data/kana.json';


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

  useEffect(() => {
    setKanaData({
      hiragana: convertKanaList(kanaJSON.hiragana),
      katakana: convertKanaList(kanaJSON.katakana),
      hiraganaDakuten: convertKanaList(kanaJSON.hiraganaDakuten),
      katakanaDakuten: convertKanaList(kanaJSON.katakanaDakuten),
      hiraganaCombinations: convertKanaList(kanaJSON.hiraganaCombinations),
      katakanaCombinations: convertKanaList(kanaJSON.katakanaCombinations)
    });
  }, []);

  return kanaData;
};
