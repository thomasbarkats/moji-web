import * as wanakana from 'wanakana';
import { KANJI_STEPS, KANJI_MODES } from '../constants';


// ============================================
// READING GROUP CHECKS
// ============================================

export const hasKunReadings = (readingGroup) => {
  return readingGroup.kun && Array.isArray(readingGroup.kun) && readingGroup.kun.length > 0;
};

export const hasOnReadings = (readingGroup) => {
  return readingGroup.on && Array.isArray(readingGroup.on) && readingGroup.on.length > 0;
};

// ============================================
// NORMALIZATION HELPERS
// ============================================

const removeAccents = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Normalize reading for deduplication (removes dashes and parentheses)
const normalizeReadingForDedup = (reading) => {
  return reading.replace(/^-+|-+$/g, '').replace(/[()（）]/g, '');
};

// Normalize user input item
const normalizeAnswerItem = (item, isMeanings = false) => {
  let trimmed = item.trim();
  trimmed = trimmed.replace(/^-+|-+$/g, '');

  if (isMeanings) {
    return removeAccents(trimmed).toLowerCase();
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    trimmed = wanakana.toHiragana(trimmed);
  }

  trimmed = trimmed.replace(/[()（）]/g, '');
  return wanakana.toKatakana(trimmed);
};

// ============================================
// READING EXTRACTION (with options)
// ============================================

// Generic function to get readings with optional deduplication
const getReadings = (readings, type, deduplicate = false) => {
  const hasReadings = type === 'kun' ? hasKunReadings : hasOnReadings;
  const allReadings = readings.flatMap(r => hasReadings(r) ? r[type] : []);

  if (!deduplicate) {
    return [...new Set(allReadings)]; // Remove exact duplicates only
  }

  // Deduplicate based on normalized form
  const seen = new Set();
  const deduplicated = [];

  for (const reading of allReadings) {
    const normalized = normalizeReadingForDedup(reading);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(reading);
    }
  }

  return deduplicated;
};

// Public APIs for readings
export const getAllKunReadings = (readings) => getReadings(readings, 'kun', false);
export const getAllOnReadings = (readings) => getReadings(readings, 'on', false);
export const getDeduplicatedKunReadings = (readings) => getReadings(readings, 'kun', true);
export const getDeduplicatedOnReadings = (readings) => getReadings(readings, 'on', true);

export const getAllMeaningsInOrder = (readings) => {
  return readings.flatMap(r => r.meanings || []);
};

// Reading groups for display (preserves structure with nulls)
export const getReadingGroupsForDisplay = (readings) => {
  return readings.map(r => ({
    kun: hasKunReadings(r) ? r.kun : null,
    on: hasOnReadings(r) ? r.on : null
  }));
};

// ============================================
// STEP-BASED HELPERS
// ============================================

// Get expected answer for validation (deduplicated for readings)
export const getExpectedAnswerForValidation = (kanjiItem, step) => {
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

// Get readings for feedback display (exhaustive)
export const getExpectedAnswerForFeedback = (kanjiItem, step) => {
  switch (step) {
    case KANJI_STEPS.KUN_READINGS:
      return getAllKunReadings(kanjiItem.readings);
    case KANJI_STEPS.ON_READINGS:
      return getAllOnReadings(kanjiItem.readings);
    case KANJI_STEPS.MEANINGS:
      return getAllMeaningsInOrder(kanjiItem.readings);
    default:
      return [];
  }
};

// Aliases for audio (same as exhaustive feedback)
export const getKunReadingsForAudio = getAllKunReadings;
export const getOnReadingsForAudio = getAllOnReadings;


// ============================================
// USER INPUT PARSING
// ============================================

export const parseUserAnswers = (userInput, isMeanings = false) => {
  if (!userInput || !userInput.trim()) return [];

  return userInput
    .split(/[,、]+/)
    .map(item => normalizeAnswerItem(item, isMeanings))
    .filter(item => item.length > 0);
};

// ============================================
// VALIDATION
// ============================================

const validateReadings = (userAnswers, expectedReadings) => {
  const normalizedExpected = expectedReadings.map(r => {
    const normalized = normalizeReadingForDedup(r);
    return wanakana.toKatakana(normalized);
  });

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

    const normalizedExpectedGroup = group.map(m =>
      removeAccents(m.toLowerCase()).replace(/[()]/g, '')
    );
    const normalizedUserGroup = userGroup.map(m =>
      removeAccents(m.toLowerCase()).replace(/[()]/g, '')
    );

    const userGroupSorted = [...normalizedUserGroup].sort();
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
    const expectedAnswers = getExpectedAnswerForValidation(kanjiItem, step);
    return validateReadings(userAnswers, expectedAnswers);
  }
};

// ============================================
// STEP NAVIGATION
// ============================================

export const getFirstStepForKanji = (readings, kanjiMode = KANJI_MODES.ALL) => {
  if (kanjiMode === KANJI_MODES.MEANINGS_ONLY) {
    return KANJI_STEPS.MEANINGS;
  }

  const hasKun = readings.some(r => hasKunReadings(r));
  const hasOn = readings.some(r => hasOnReadings(r));

  if (hasKun) return KANJI_STEPS.KUN_READINGS;
  if (hasOn) return KANJI_STEPS.ON_READINGS;
  return KANJI_STEPS.MEANINGS;
};

export const getNextStepForKanji = (currentStep, readings, kanjiMode = KANJI_MODES.ALL) => {
  if (kanjiMode === KANJI_MODES.MEANINGS_ONLY) {
    return KANJI_STEPS.MEANINGS;
  }

  const hasOn = readings.some(r => hasOnReadings(r));

  if (currentStep === KANJI_STEPS.KUN_READINGS) {
    return hasOn ? KANJI_STEPS.ON_READINGS : KANJI_STEPS.MEANINGS;
  }

  if (currentStep === KANJI_STEPS.ON_READINGS) {
    return KANJI_STEPS.MEANINGS;
  }

  return KANJI_STEPS.MEANINGS;
};

// ============================================
// REVIEW FORMATTING
// ============================================

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
    id: kanji.id,
    character: kanji.character,
    kun: kunReadings.join(', '),
    on: onReadings.join(', '),
    meaningRows,
    notes: kanji.notes,
    strokes: kanji.strokes
  };
};
