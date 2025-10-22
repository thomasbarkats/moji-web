import { KANA_TYPES, KANA_INCLUSION } from '../constants';


// ============================================
// CONSTANTS
// ============================================

const VOWEL_ORDER = ['a', 'i', 'u', 'e', 'o'];
const COLUMNS_PER_ROW = 5;

const DAKUTEN_VARIANTS = {
  'ka': ['ga'], 'ki': ['gi'], 'ku': ['gu'], 'ke': ['ge'], 'ko': ['go'],
  'sa': ['za'], 'shi': ['ji'], 'su': ['zu'], 'se': ['ze'], 'so': ['zo'],
  'ta': ['da'], 'chi': ['ji'], 'tsu': ['zu'], 'te': ['de'], 'to': ['do'],
  'ha': ['ba', 'pa'], 'hi': ['bi', 'pi'], 'fu': ['bu', 'pu'], 'he': ['be', 'pe'], 'ho': ['bo', 'po']
};


// ============================================
// KANA ORGANIZATION FOR DISPLAY
// ============================================

const sortKanaByJapaneseOrder = (kanaArray) => {
  return [...kanaArray].sort((a, b) => a.char.localeCompare(b.char, 'ja'));
};

const getVowelFromReading = (reading) => {
  return reading[reading.length - 1];
};

const calculateVowelGap = (lastReading, currentReading) => {
  const lastVowel = getVowelFromReading(lastReading);
  const currentVowel = getVowelFromReading(currentReading);

  const lastIdx = VOWEL_ORDER.indexOf(lastVowel);
  const currentIdx = VOWEL_ORDER.indexOf(currentVowel);

  if (currentIdx === -1 || lastIdx === -1) return 0;

  return Math.max(0, currentIdx - lastIdx - 1);
};

const addNullsToRow = (row, count) => {
  for (let i = 0; i < count; i++) {
    row.push(null);
  }
};

const padRowToFull = (row) => {
  while (row.length < COLUMNS_PER_ROW) {
    row.push(null);
  }
};

const isRowFull = (row) => {
  return row.length === COLUMNS_PER_ROW;
};

const getDakutenReadings = (baseReading) => {
  return DAKUTEN_VARIANTS[baseReading] || [];
};

const findDakutenForKana = (kana, sortedDakuten) => {
  if (!kana) return null;

  const dakutenVariants = getDakutenReadings(kana.reading);
  return sortedDakuten.find(dk => dakutenVariants.includes(dk.reading)) || null;
};

const addDakutenRowIfNeeded = (baseRow, sortedDakuten, rows) => {
  const dakutenRow = baseRow.map(kana => findDakutenForKana(kana, sortedDakuten));
  const hasDakuten = dakutenRow.some(kana => kana !== null);

  if (hasDakuten) {
    rows.push({ type: KANA_TYPES.DAKUTEN, cells: dakutenRow });
  }
};

const finalizeRow = (row, rows, sortedDakuten) => {
  padRowToFull(row);
  rows.push({ type: 'main', cells: [...row] });
  addDakutenRowIfNeeded(row, sortedDakuten, rows);
  return [];
};

const processBaseKana = (sortedBase, sortedDakuten, rows) => {
  let currentRow = [];
  let lastReading = null;

  sortedBase.forEach((kana) => {
    if (lastReading) {
      const gap = calculateVowelGap(lastReading, kana.reading);
      addNullsToRow(currentRow, gap);

      if (isRowFull(currentRow)) {
        currentRow = finalizeRow(currentRow, rows, sortedDakuten);
      }
    }

    currentRow.push(kana);
    lastReading = kana.reading;

    if (isRowFull(currentRow)) {
      currentRow = finalizeRow(currentRow, rows, sortedDakuten);
    }
  });

  if (currentRow.length > 0) {
    finalizeRow(currentRow, rows, sortedDakuten);
  }
};

const processCombinations = (sortedCombinations, rows) => {
  if (sortedCombinations.length === 0) return;

  for (let i = 0; i < sortedCombinations.length; i += COLUMNS_PER_ROW) {
    const combRow = sortedCombinations.slice(i, i + COLUMNS_PER_ROW);
    padRowToFull(combRow);
    rows.push({ type: KANA_TYPES.COMBINATION, cells: combRow });
  }
};

export const organizeKanaByRows = (baseKana, dakutenKana, combinationKana) => {
  const sortedBase = sortKanaByJapaneseOrder(baseKana);
  const sortedDakuten = sortKanaByJapaneseOrder(dakutenKana);
  const sortedCombinations = sortKanaByJapaneseOrder(combinationKana);

  const rows = [];

  processBaseKana(sortedBase, sortedDakuten, rows);
  processCombinations(sortedCombinations, rows);

  return rows;
};


// ============================================
// FILTER INITIALIZATION
// ============================================

export const initFilterSelection = (dakutenMode, combinationsMode) => {
  const options = [];

  if (dakutenMode !== KANA_INCLUSION.OFF) {
    options.push(KANA_TYPES.DAKUTEN);
  }

  if (combinationsMode !== KANA_INCLUSION.OFF) {
    options.push(KANA_TYPES.COMBINATION);
  }

  return options;
};
