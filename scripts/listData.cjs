const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const lang = args[0] || 'fr';

if (!['fr', 'en'].includes(lang)) {
  console.error('Usage: node list-data.js [fr|en]');
  process.exit(1);
}

function getVisualWidth(str) {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Japanese characters, Chinese characters, and full-width characters
    if ((code >= 0x3000 && code <= 0x9FFF) || 
        (code >= 0xFF00 && code <= 0xFFEF)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

function padToVisualWidth(str, targetWidth) {
  const currentWidth = getVisualWidth(str);
  const spacesNeeded = targetWidth - currentWidth;
  return str + ' '.repeat(Math.max(0, spacesNeeded));
}

function listKanji() {
  const kanjiDir = path.join(process.cwd(), 'src/data/kanji');

  if (!fs.existsSync(kanjiDir)) {
    console.log('No kanji directory found');
    return;
  }

  const files = fs.readdirSync(kanjiDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  console.log('\n=== KANJI SETS ===\n');

  const rows = [];

  files.forEach(file => {
    const filepath = path.join(kanjiDir, file);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    const name = data[lang] || data.fr;
    const characters = data.kanji.map(k => k.character).join(' ');

    let complexity = 0;
    let nbGroups = 0;
    data.kanji.forEach(k => {
      k.readings.forEach(reading => {
        nbGroups += 1;
        complexity += reading.kun ? reading.kun.length : 0;
        complexity += reading.on ? reading.on.length : 0;
        complexity += reading[lang] ? reading[lang].length : reading.fr.length;
      });
    });

    rows.push({ name, characters, score: `${complexity}.${nbGroups}` });
  });

  const maxNameWidth = Math.max(...rows.map(r => getVisualWidth(r.name)));
  const maxCharWidth = Math.max(...rows.map(r => getVisualWidth(r.characters)));

  rows.forEach(row => {
    const namePadded = padToVisualWidth(row.name, maxNameWidth + 1);
    const charPadded = padToVisualWidth(row.characters, maxCharWidth + 1);
    console.log(`${namePadded}| ${charPadded}| ${row.score}`);
  });
}

function listVocabulary() {
  const vocabDir = path.join(process.cwd(), 'src/data/vocabulary');

  if (!fs.existsSync(vocabDir)) {
    console.log('No vocabulary directory found');
    return;
  }

  const files = fs.readdirSync(vocabDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  console.log('\n=== VOCABULARY SETS ===\n');

  const rows = [];

  files.forEach(file => {
    const filepath = path.join(vocabDir, file);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    const name = data[lang] || data.fr;
    const count = data.words.length;

    rows.push({ name, info: `${count} words` });
  });

  const maxNameWidth = Math.max(...rows.map(r => getVisualWidth(r.name)));

  rows.forEach(row => {
    const namePadded = padToVisualWidth(row.name, maxNameWidth + 1);
    console.log(`${namePadded}| ${row.info}`);
  });
}

listKanji();
listVocabulary();
console.log('');
