// ============================================
// PARSING
// ============================================

export const parseVocabularyEntry = (entry) => {
  if (!Array.isArray(entry) || entry.length < 2) {
    throw new Error('Invalid vocabulary entry format');
  }

  const [japaneseRaw, translation, infoText = null] = entry;
  const parts = parseJapaneseText(japaneseRaw);

  const speechText = parts.map(part => {
    if (part.type === 'kanji') return part.reading;
    if (part.type === 'optional') return part.text.slice(1, -1);
    return part.text;
  }).join('');

  const displayText = japaneseRaw
    .replace(/\{([^}]+)\}\[([^\]]+)\]/g, '$1')
    .replace(/\{([^}]+)\}/g, '$1');

  return {
    japanese: japaneseRaw,
    displayText,
    speechText,
    translation,
    infoText,
    parts,
  };
};

export const parseJapaneseText = (text) => {
  const parts = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === '(') {
      const closeIdx = text.indexOf(')', i);
      if (closeIdx === -1) throw new Error(`Unmatched '(' at position ${i}`);

      parts.push({
        type: 'optional',
        text: text.substring(i, closeIdx + 1),
        isOptional: true,
      });
      i = closeIdx + 1;
      continue;
    }

    if (char === '{') {
      const closeBraceIdx = text.indexOf('}', i);
      if (closeBraceIdx === -1) throw new Error(`Unmatched '{' at position ${i}`);

      const nextChar = text[closeBraceIdx + 1];
      if (nextChar !== '[') {
        throw new Error(`Expected '[' after '}' at position ${closeBraceIdx + 1}`);
      }

      const closeBracketIdx = text.indexOf(']', closeBraceIdx + 1);
      if (closeBracketIdx === -1) throw new Error(`Unmatched '[' at position ${closeBraceIdx + 1}`);

      const kanjiText = text.substring(i + 1, closeBraceIdx);
      const reading = text.substring(closeBraceIdx + 2, closeBracketIdx);

      parts.push({
        type: 'kanji',
        text: kanjiText,
        reading,
      });
      i = closeBracketIdx + 1;
      continue;
    }

    parts.push({
      type: 'text',
      text: char,
    });
    i++;
  }

  return parts;
};


// ============================================
// TEXT CLEANING
// ============================================

export const cleanJapaneseText = (text) => {
  return text
    .replace(/\{([^}]+)\}\[([^\]]+)\]/g, '$1')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/\[([^\]]+)\]/g, '');
};


// ============================================
// NORMALIZATION
// ============================================

export const normalizeAnswer = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:!?'"(){}[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};


// ============================================
// OPTIONAL VARIANTS GENERATION
// ============================================

export const generateOptionalVariants = (text) => {
  const variants = [text];

  const optionalPattern = /\([^)]+\)/g;
  const matches = [...text.matchAll(optionalPattern)];

  if (matches.length === 0) return variants;

  matches.forEach(match => {
    const newVariants = [];
    variants.forEach(variant => {
      newVariants.push(variant.replace(match[0], ''));
      newVariants.push(variant.replace(match[0], match[0].slice(1, -1)));
    });
    variants.push(...newVariants);
  });

  return [...new Set(variants)];
};


// ============================================
// VALIDATION
// ============================================

export const checkVocabularyAnswer = (userAnswer, correctAnswer) => {
  const cleanedCorrectAnswer = cleanJapaneseText(correctAnswer);

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(cleanedCorrectAnswer);

  if (normalizedUser === normalizedCorrect) return true;

  if (cleanedCorrectAnswer.includes('(') && cleanedCorrectAnswer.includes(')')) {
    const variants = generateOptionalVariants(cleanedCorrectAnswer);
    return variants.some(variant => normalizeAnswer(variant) === normalizedUser);
  }

  return false;
};
