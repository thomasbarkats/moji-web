import * as wanakana from 'wanakana';
import { KANJI_STEPS } from '../constants';


// Helper functions
export const hasKunReadings = (readingGroup) => {
  return readingGroup.kun && Array.isArray(readingGroup.kun) && readingGroup.kun.length > 0;
};

export const hasOnReadings = (readingGroup) => {
  return readingGroup.on && Array.isArray(readingGroup.on) && readingGroup.on.length > 0;
};

// Get all readings flattened (EXHAUSTIVE - for display/feedback)
export const getAllKunReadings = (readings) => {
  const allKun = readings.flatMap(r => hasKunReadings(r) ? r.kun : []);
  return [...new Set(allKun)];
};

export const getAllOnReadings = (readings) => {
  const allOn = readings.flatMap(r => hasOnReadings(r) ? r.on : []);
  return [...new Set(allOn)];
};

export const getAllMeaningsInOrder = (readings) => {
  return readings.flatMap(r => r.meanings || []);
};

// Helper to normalize a reading for deduplication (remove dashes and parentheses)
const normalizeReadingForDedup = (reading) => {
  return reading.replace(/^-+|-+$/g, '').replace(/[()（）]/g, '');
};

// Get deduplicated readings (for validation - ignores dashes/parentheses)
export const getDeduplicatedKunReadings = (readings) => {
  const allKun = readings.flatMap(r => hasKunReadings(r) ? r.kun : []);
  
  const seen = new Set();
  const deduplicated = [];
  
  for (const reading of allKun) {
    const normalized = normalizeReadingForDedup(reading);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(reading);
    }
  }
  
  return deduplicated;
};

export const getDeduplicatedOnReadings = (readings) => {
  const allOn = readings.flatMap(r => hasOnReadings(r) ? r.on : []);
  
  const seen = new Set();
  const deduplicated = [];
  
  for (const reading of allOn) {
    const normalized = normalizeReadingForDedup(reading);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(reading);
    }
  }
  
  return deduplicated;
};

// Get reading groups for display (preserves structure with nulls)
export const getReadingGroupsForDisplay = (readings) => {
  return readings.map(r => ({
    kun: hasKunReadings(r) ? r.kun : null,
    on: hasOnReadings(r) ? r.on : null
  }));
};

// Get expected answer for current step
export const getExpectedAnswerForStep = (kanjiItem, step) => {
  switch (step) {
    case KANJI_STEPS.KUN_READINGS:
      return getDeduplicatedKunReadings(kanjiItem.readings);
    case KANJI_STEPS.ON_READINGS:
      return getDeduplicatedOnReadings(kanjiItem.readings);
    case KANJI_STEPS.MEANINGS:
      return getAllMeaningsInOrder(kanjiItem.readings);
    default:
      return [];
  }
};

// Get expected reading for current step feedback displaying
export const getExpectedReadingsForStep = (kanjiItem, step) => {
  switch (step) {
    case KANJI_STEPS.KUN_READINGS:
      return getKunReadings(kanjiItem.readings);
    case KANJI_STEPS.ON_READINGS:
      return getOnReadings(kanjiItem.readings);
    case KANJI_STEPS.MEANINGS:
      return getAllMeaningsInOrder(kanjiItem.readings);
    default:
      return [];
  }
};

// Normalization helpers
const toKatakana = (text) => {
  return text.replace(/[\u3041-\u3096]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0x60);
  });
};

const removeAccents = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const normalizeAnswerItem = (item, isMeanings = false) => {
  let trimmed = item.trim();
  trimmed = trimmed.replace(/^-+|-+$/g, '');

  if (isMeanings) {
    // Remove accents and convert to lowercase for meanings
    return removeAccents(trimmed).toLowerCase();
  }

  // Convert romaji to hiragana if input contains latin characters
  if (/[a-zA-Z]/.test(trimmed)) {
    trimmed = wanakana.toHiragana(trimmed);
  }

  // Remove BOTH latin AND japanese parentheses
  trimmed = trimmed.replace(/[()（）]/g, '');

  return toKatakana(trimmed);
};

// Parse user input
export const parseUserAnswers = (userInput, isMeanings = false) => {
  if (!userInput || !userInput.trim()) return [];

  return userInput
    .split(/[,、]+/) // Split on comma/japanese comma only
    .map(item => normalizeAnswerItem(item, isMeanings))
    .filter(item => item.length > 0);
};

// Validation functions
const validateReadings = (userAnswers, expectedReadings) => {
  const normalizedExpected = expectedReadings.map(r => {
    const withoutDash = r.replace(/^-+|-+$/g, '');
    const fullVersion = withoutDash.replace(/[()]/g, '');
    return toKatakana(fullVersion);
  });

  console.log('User answers:', userAnswers);
  console.log('Expected (normalized):', normalizedExpected);
  console.log('Lengths:', userAnswers.length, expectedReadings.length);

  if (userAnswers.length !== expectedReadings.length) return false;

  const matchedIndices = new Set();

  for (const userAnswer of userAnswers) {
    let found = false;
    for (let i = 0; i < normalizedExpected.length; i++) {
      if (matchedIndices.has(i)) continue;

      if (userAnswer === normalizedExpected[i]) {
        matchedIndices.add(i);
        found = true;
        break;
      }
    }
    if (!found) return false;
  }

  return matchedIndices.size === expectedReadings.length;
};

const validateMeanings = (userAnswers, kanjiItem) => {
  const meaningGroups = kanjiItem.readings.map(r => r.meanings || []);
  const totalMeanings = meaningGroups.reduce((sum, group) => sum + group.length, 0);

  if (userAnswers.length !== totalMeanings) return false;

  let userIndex = 0;

  for (const group of meaningGroups) {
    const groupSize = group.length;
    const userGroup = userAnswers.slice(userIndex, userIndex + groupSize);
    // Normalize expected meanings: lowercase + remove accents
    const normalizedExpectedGroup = group.map(m => removeAccents(m.toLowerCase()));

    const userGroupSorted = [...userGroup].sort();
    const expectedGroupSorted = [...normalizedExpectedGroup].sort();

    if (!arraysEqual(userGroupSorted, expectedGroupSorted)) {
      return false;
    }

    userIndex += groupSize;
  }

  return true;
};

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => val === arr2[idx]);
};

export const validateKanjiAnswer = (userInput, kanjiItem, step) => {
  const isMeanings = step === KANJI_STEPS.MEANINGS;
  const userAnswers = parseUserAnswers(userInput, isMeanings);

  if (step === KANJI_STEPS.MEANINGS) {
    return validateMeanings(userAnswers, kanjiItem);
  } else {
    const expectedAnswers = getExpectedAnswerForStep(kanjiItem, step);
    return validateReadings(userAnswers, expectedAnswers);
  }
};

// Audio helpers
export const getKunReadingsForAudio = (readings) => {
  return getAllKunReadings(readings);
};

export const getOnReadingsForAudio = (readings) => {
  return getAllOnReadings(readings);
};

// Step navigation
export const getFirstStepForKanji = (readings) => {
  const hasKun = readings.some(r => hasKunReadings(r));
  const hasOn = readings.some(r => hasOnReadings(r));

  if (hasKun) return KANJI_STEPS.KUN_READINGS;
  if (hasOn) return KANJI_STEPS.ON_READINGS;
  return KANJI_STEPS.MEANINGS;
};

export const getNextStepForKanji = (currentStep, readings) => {
  const hasOn = readings.some(r => hasOnReadings(r));

  if (currentStep === KANJI_STEPS.KUN_READINGS) {
    return hasOn ? KANJI_STEPS.ON_READINGS : KANJI_STEPS.MEANINGS;
  }

  if (currentStep === KANJI_STEPS.ON_READINGS) {
    return KANJI_STEPS.MEANINGS;
  }

  return KANJI_STEPS.MEANINGS;
};

// Review formatting
export const formatKanjiForReview = (kanji) => {
  const kunReadings = getAllKunReadings(kanji.readings);
  const onReadings = getAllOnReadings(kanji.readings);

  const meaningRows = kanji.readings.map(group => {
    const readings = [];
    if (hasKunReadings(group)) readings.push(...group.kun);
    if (hasOnReadings(group)) readings.push(...group.on);

    return {
      readings: readings.join(', '),
      meanings: group.meanings.join(', ')
    };
  });

  return {
    character: kanji.character,
    kun: kunReadings.join(', '),
    on: onReadings.join(', '),
    meaningRows,
    notes: kanji.notes
  };
};
