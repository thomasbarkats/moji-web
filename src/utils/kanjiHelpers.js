import { KANJI_STEPS } from '../constants';


export const getAllKunReadings = (readings) => {
  return readings
    .map(r => r.kun)
    .filter(kun => kun !== null);
};

export const getAllOnReadings = (readings) => {
  return readings
    .map(r => r.on)
    .filter(on => on !== null);
};

export const getAllMeaningsInOrder = (readings) => {
  return readings.flatMap(r => r.meanings || []);
};

export const getExpectedAnswerForStep = (kanjiItem, step) => {
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

const normalizeAnswerItem = (item, isMeanings = false) => {
  let trimmed = item.trim();

  // Remove leading/trailing dashes
  trimmed = trimmed.replace(/^-+|-+$/g, '');

  if (isMeanings) {
    return trimmed.toLowerCase();
  }

  return toKatakana(trimmed);
};

const toKatakana = (text) => {
  return text.replace(/[\u3041-\u3096]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + 0x60);
  });
};

export const parseUserAnswers = (userInput, isMeanings = false) => {
  if (!userInput || !userInput.trim()) return [];

  return userInput
    .split(/[,、]+/)
    .map(item => normalizeAnswerItem(item, isMeanings))
    .filter(item => item.length > 0);
};

const validateReadings = (userAnswers, expectedReadings) => {
  const normalizedExpected = expectedReadings.map(r => {
    const withoutDash = r.replace(/^-+|-+$/g, '');

    const fullVersion = withoutDash.replace(/[()]/g, ''); // Remove parentheses but expect full content

    return toKatakana(fullVersion);
  });

  if (userAnswers.length !== expectedReadings.length) return false;

  const matchedIndices = new Set();

  for (const userAnswer of userAnswers) {
    let found = false;
    for (let i = 0; i < normalizedExpected.length; i++) {
      if (matchedIndices.has(i)) continue;

      const expected = normalizedExpected[i];
      if (userAnswer === expected) {
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
    const normalizedExpectedGroup = group.map(m => m.toLowerCase());

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

export const getKunReadingsForAudio = (readings) => {
  return getAllKunReadings(readings);
};

export const getOnReadingsForAudio = (readings) => {
  return getAllOnReadings(readings);
};

export const formatKanjiForReview = (kanji) => {
  const kunReadings = getAllKunReadings(kanji.readings);
  const onReadings = getAllOnReadings(kanji.readings);

  // Format meanings with associated readings for display
  const meaningRows = kanji.readings.map(group => {
    const readings = [];
    if (group.kun) readings.push(group.kun);
    if (group.on) readings.push(group.on);

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

export const getChipsForMeaningsStep = (stepData) => {
  const kunChips = stepData.kunReadings || [];
  const onChips = stepData.onReadings || [];

  // Determine max length for alignment
  const maxLength = Math.max(kunChips.length, onChips.length);

  return {
    kunRow: [...kunChips, ...Array(Math.max(0, maxLength - kunChips.length)).fill(null)],
    onRow: [...onChips, ...Array(Math.max(0, maxLength - onChips.length)).fill(null)]
  };
};
