#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createVocabularySet() {
  console.log('\n=== CREATE VOCABULARY SET ===\n');

  const nameFr = await question('French name: ');
  const nameEn = await question('English name: ');

  const words = [];
  let addMore = true;

  console.log('\nAdd words (press Enter or empty jp to finish):\n');

  while (addMore) {
    const jp = await question(`Word ${words.length + 1} - Japanese: `);
    if (!jp.trim()) {
      addMore = false;
      break;
    }

    const fr = await question('  French: ');
    const en = await question('  English: ');
    const noteFr = await question('  Note FR (optional): ');
    const noteEn = await question('  Note EN (optional): ');

    const word = { jp, fr, en };
    if (noteFr.trim()) word.note_fr = noteFr.trim();
    if (noteEn.trim()) word.note_en = noteEn.trim();

    words.push(word);
    console.log('');
  }

  const data = {
    fr: nameFr,
    en: nameEn,
    words
  };

  const filename = sanitizeFilename(nameFr) + '.json';
  const filepath = path.join(process.cwd(), 'src/data/vocabulary', filename);

  // Format manually to match formatter output
  let output = '{\n';
  output += `  "fr": ${JSON.stringify(data.fr)},\n`;
  output += `  "en": ${JSON.stringify(data.en)},\n`;
  output += '  "words": [';

  data.words.forEach((word, index) => {
    if (index === 0) {
      output += '{\n';
    } else {
      output += ', {\n';
    }

    output += `    "jp": ${JSON.stringify(word.jp)},\n`;
    output += `    "fr": ${JSON.stringify(word.fr)},\n`;
    output += `    "en": ${JSON.stringify(word.en)}`;

    if (word.note_fr) {
      output += `,\n    "note_fr": ${JSON.stringify(word.note_fr)}`;
    }
    if (word.note_en) {
      output += `,\n    "note_en": ${JSON.stringify(word.note_en)}`;
    }

    output += '\n  }';
  });

  output += ']\n';
  output += '}\n';

  fs.writeFileSync(filepath, output);
  console.log(`\nCreated: ${filename}`);
  console.log(`Total words: ${words.length}`);
}

async function createKanjiSet() {
  console.log('\n=== CREATE KANJI SET ===\n');

  const nameFr = await question('French name: ');
  const nameEn = await question('English name: ');

  const kanji = [];
  let addMore = true;

  console.log('\nAdd kanji (press Enter on empty character to finish):\n');

  while (addMore) {
    const character = await question(`Kanji ${kanji.length + 1} - Character: `);
    if (!character.trim()) {
      addMore = false;
      break;
    }

    const readings = [];
    let addMoreReadings = true;

    console.log('  Add reading groups (press Enter on empty kun AND on to finish):\n');

    while (addMoreReadings) {
      const kunInput = await question(`    Reading ${readings.length + 1} - Kun (comma separated, or empty): `);
      const onInput = await question('      On (comma separated, or empty): ');

      if (!kunInput.trim() && !onInput.trim()) {
        addMoreReadings = false;
        break;
      }

      const frInput = await question('      French meanings (comma separated): ');
      const enInput = await question('      English meanings (comma separated): ');

      const reading = {
        kun: kunInput.trim() ? kunInput.split(',').map(s => s.trim()) : null,
        on: onInput.trim() ? onInput.split(',').map(s => s.trim()) : null,
        fr: frInput.split(',').map(s => s.trim()),
        en: enInput.split(',').map(s => s.trim())
      };

      readings.push(reading);
      console.log('');
    }

    const notes = await question('  Notes (optional): ');

    const kanjiEntry = { character, readings };
    if (notes.trim()) kanjiEntry.notes = notes.trim();

    kanji.push(kanjiEntry);
    console.log('');
  }

  const data = {
    fr: nameFr,
    en: nameEn,
    kanji
  };

  const filename = sanitizeFilename(nameFr) + '.json';
  const filepath = path.join(process.cwd(), 'src/data/kanji', filename);

  // Format manually to match formatter output
  const formatArray = (arr) => {
    if (arr === null) return 'null';
    return '[' + arr.map(item => JSON.stringify(item)).join(', ') + ']';
  };

  let output = '{\n';
  output += `  "fr": ${JSON.stringify(data.fr)},\n`;
  output += `  "en": ${JSON.stringify(data.en)},\n`;
  output += '  "kanji": [';

  data.kanji.forEach((k, kanjiIndex) => {
    if (kanjiIndex === 0) {
      output += '{\n';
    } else {
      output += ', {\n';
    }

    output += `    "character": ${JSON.stringify(k.character)},\n`;
    output += '    "readings": [';

    k.readings.forEach((reading, readingIndex) => {
      if (readingIndex === 0) {
        output += '{\n';
      } else {
        output += ', {\n';
      }

      output += `      "kun": ${formatArray(reading.kun)},\n`;
      output += `      "on": ${formatArray(reading.on)},\n`;
      output += `      "fr": ${formatArray(reading.fr)},\n`;
      output += `      "en": ${formatArray(reading.en)}\n`;
      output += '    }';
    });

    output += ']';

    if (k.notes) {
      output += `,\n    "notes": ${JSON.stringify(k.notes)}`;
    }

    output += '\n  }';
  });

  output += ']\n';
  output += '}\n';

  fs.writeFileSync(filepath, output);
  console.log(`\nCreated: ${filename}`);
  console.log(`Total kanji: ${kanji.length}`);
}

async function createDataSet() {
  console.log('\n=== CREATE DATA SET ===');
  console.log('1. Vocabulary');
  console.log('2. Kanji');

  const choice = await question('\nChoice (1 or 2): ');

  if (choice === '1') {
    await createVocabularySet();
  } else if (choice === '2') {
    await createKanjiSet();
  } else {
    console.log('Invalid choice');
  }

  rl.close();
}

createDataSet();
