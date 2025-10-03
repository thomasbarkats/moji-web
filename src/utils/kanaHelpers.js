import { KANA_TYPES, KANA_INCLUSION } from '../constants';

export const organizeKanaByRows = (baseKana, dakutenKana, combinationKana) => {
  // Sort all arrays by Japanese alphabetical order
  const sortedBase = [...baseKana].sort((a, b) => a.char.localeCompare(b.char, 'ja'));
  const sortedDakuten = [...dakutenKana].sort((a, b) => a.char.localeCompare(b.char, 'ja'));
  const sortedCombinations = [...combinationKana].sort((a, b) => a.char.localeCompare(b.char, 'ja'));

  const rows = [];

  // Process base kana - create complete 5-column rows with proper gaps
  let currentRow = [];
  let lastReading = null;

  sortedBase.forEach((kana) => {
    const currentReading = kana.reading;

    // Check if we need to add gaps based on vowel position
    if (lastReading) {
      const lastVowel = lastReading[lastReading.length - 1];
      const currentVowel = currentReading[currentReading.length - 1];
      const vowelOrder = ['a', 'i', 'u', 'e', 'o'];
      const lastIdx = vowelOrder.indexOf(lastVowel);
      const currentIdx = vowelOrder.indexOf(currentVowel);

      if (currentIdx !== -1 && lastIdx !== -1) {
        const gap = currentIdx - lastIdx - 1;
        for (let i = 0; i < gap; i++) {
          currentRow.push(null);
          if (currentRow.length === 5) {
            rows.push({ type: 'main', cells: [...currentRow] });
            checkAndAddDakutenRow(currentRow, sortedDakuten, rows);
            currentRow = [];
          }
        }
      }
    }

    currentRow.push(kana);
    lastReading = currentReading;

    if (currentRow.length === 5) {
      rows.push({ type: 'main', cells: [...currentRow] });
      checkAndAddDakutenRow(currentRow, sortedDakuten, rows);
      currentRow = [];
    }
  });

  // Add remaining kana in current row
  if (currentRow.length > 0) {
    while (currentRow.length < 5) currentRow.push(null);
    rows.push({ type: 'main', cells: currentRow });
    checkAndAddDakutenRow(currentRow, sortedDakuten, rows);
  }

  // Add combinations in rows of 5
  if (sortedCombinations.length > 0) {
    for (let i = 0; i < sortedCombinations.length; i += 5) {
      const combRow = sortedCombinations.slice(i, i + 5);
      while (combRow.length < 5) combRow.push(null);
      rows.push({ type: KANA_TYPES.COMBINATION, cells: combRow });
    }
  }

  return rows;
};

const checkAndAddDakutenRow = (baseRow, sortedDakuten, rows) => {
  const dakutenRow = [];
  let hasDakuten = false;

  baseRow.forEach(kana => {
    if (!kana) {
      dakutenRow.push(null);
      return;
    }

    const baseReading = kana.reading;
    const dakutenVariants = getDakutenReadings(baseReading);
    const foundDakuten = sortedDakuten.find(dk => dakutenVariants.includes(dk.reading));

    if (foundDakuten) {
      dakutenRow.push(foundDakuten);
      hasDakuten = true;
    } else {
      dakutenRow.push(null);
    }
  });

  if (hasDakuten) {
    rows.push({ type: KANA_TYPES.DAKUTEN, cells: dakutenRow });
  }
};

const getDakutenReadings = (baseReading) => {
  const variants = {
    'ka': ['ga'], 'ki': ['gi'], 'ku': ['gu'], 'ke': ['ge'], 'ko': ['go'],
    'sa': ['za'], 'shi': ['ji'], 'su': ['zu'], 'se': ['ze'], 'so': ['zo'],
    'ta': ['da'], 'chi': ['ji'], 'tsu': ['zu'], 'te': ['de'], 'to': ['do'],
    'ha': ['ba', 'pa'], 'hi': ['bi', 'pi'], 'fu': ['bu', 'pu'], 'he': ['be', 'pe'], 'ho': ['bo', 'po']
  };

  return variants[baseReading] || [];
};

export const initFilterSelection = (dakutenMode, combinationsMode) => {
  const options = [];
  if (dakutenMode !== KANA_INCLUSION.OFF) {
    options.push(KANA_TYPES.DAKUTEN)
  }
  if (combinationsMode !== KANA_INCLUSION.OFF) {
    options.push(KANA_TYPES.COMBINATION)
  }
  return options;
}
