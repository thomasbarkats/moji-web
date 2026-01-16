// ============================================
// PARSING
// ============================================

export const parseVocabularyEntry = (entry, language = 'en') => {
  // Handle object format from API
  if (typeof entry === 'object' && !Array.isArray(entry) && entry.jp) {
    const japaneseRaw = entry.jp;
    const translation = entry.translation || '';
    const infoText = entry.note || null;

    const parts = parseJapaneseText(japaneseRaw);

    const speechText = parts.map(part => {
      if (part.type === 'kanji') return part.reading;
      if (part.type === 'optional') return part.text.slice(1, -1);
      return part.text;
    }).join('');

    return {
      jp: japaneseRaw,
      cleanedJp: cleanJapaneseText(japaneseRaw),
      speechText,
      translation,
      infoText,
      parts,
    };
  }

  // Legacy array format support
  if (Array.isArray(entry) && entry.length >= 2) {
    const [japaneseRaw, translation, infoText = null] = entry;
    const parts = parseJapaneseText(japaneseRaw);

    const speechText = parts.map(part => {
      if (part.type === 'kanji') return part.reading;
      if (part.type === 'optional') return part.text.slice(1, -1);
      return part.text;
    }).join('');

    return {
      jp: japaneseRaw,
      cleanedJp: cleanJapaneseText(japaneseRaw),
      speechText,
      translation,
      infoText,
      parts,
    };
  }

  throw new Error('Invalid vocabulary entry format');
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

      // If followed by '[', it's a kanji with reading
      if (nextChar === '[') {
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
      } else {
        // If not followed by '[', treat the content as plain text
        const content = text.substring(i + 1, closeBraceIdx);
        parts.push({
          type: 'text',
          text: content,
        });
        i = closeBraceIdx + 1;
        continue;
      }
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
    .replace(/\{([^}]+)\}/g, '$1');
};

// ============================================
// NORMALIZATION
// ============================================

export const normalizeAnswer = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .replace(/[.,;:!?'"(){}[\]/-]/g, '')  // Remove punctuation, /, and -
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .trim();
}

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
// WORD SORTING FOR ORDER-INDEPENDENT MATCHING
// ============================================

export const sortWords = (text) => {
  return text.split(' ').filter(w => w).sort().join(' ');
};

// ============================================
// CARTESIAN PRODUCT FOR VARIANT COMBINATIONS
// ============================================

const cartesianProduct = (arrays) => {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map(item => [item]);

  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  return first.flatMap(item =>
    restProduct.map(combo => [item, ...combo])
  );
};

// ============================================
// VALIDATION
// ============================================

export const checkVocabularyAnswer = (userAnswer, correctAnswer) => {
  // Split by / to get all required translations
  const correctParts = correctAnswer.split('/').map(part => part.trim());

  // For each correct part, generate optional variants and normalize
  const variantsPerPart = correctParts.map(part => {
    if (part.includes('(') && part.includes(')')) {
      const variants = generateOptionalVariants(part);
      return variants.map(normalizeAnswer);
    }
    return [normalizeAnswer(part)];
  });

  // Generate all possible combinations (cartesian product of variants)
  const allCombinations = cartesianProduct(variantsPerPart);

  // For each combination, join all words and sort them
  const sortedCorrectCombinations = allCombinations.map(combo =>
    sortWords(combo.join(' '))
  );

  // Normalize user answer and sort its words
  const normalizedUser = normalizeAnswer(userAnswer);
  const sortedUserWords = sortWords(normalizedUser);

  // Check if user's sorted words match any valid combination
  return sortedCorrectCombinations.includes(sortedUserWords);
};
