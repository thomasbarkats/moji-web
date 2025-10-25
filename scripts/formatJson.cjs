const fs = require('fs');
const path = require('path');

// Format vocabulary/*.json: compact objects with jp, fr, en, note_fr?, note_en?
function formatVocabularyJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

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

  fs.writeFileSync(filePath, output);
  console.log(`Formatted: ${path.relative(process.cwd(), filePath)}`);
}

// Format kanji/*.json: structured readings objects with fr, en arrays
function formatKanjiJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Validate readings for commas (invalid format)
  let hasErrors = false;
  data.kanji.forEach((kanji) => {
    kanji.readings.forEach((reading, readingIndex) => {
      // Check kun readings
      if (reading.kun && Array.isArray(reading.kun)) {
        reading.kun.forEach((kunReading, kunIndex) => {
          if (kunReading && kunReading.includes(',')) {
            console.warn(`WARNING in ${path.basename(filePath)} - Kanji "${kanji.character}" reading group ${readingIndex + 1}: kun[${kunIndex}] contains comma: "${kunReading}"`);
            console.warn(`  Should be split into separate array elements`);
            hasErrors = true;
          }
        });
      }

      // Check on readings
      if (reading.on && Array.isArray(reading.on)) {
        reading.on.forEach((onReading, onIndex) => {
          if (onReading && onReading.includes(',')) {
            console.warn(`WARNING in ${path.basename(filePath)} - Kanji "${kanji.character}" reading group ${readingIndex + 1}: on[${onIndex}] contains comma: "${onReading}"`);
            console.warn(`  Should be split into separate array elements`);
            hasErrors = true;
          }
        });
      }
    });
  });

  if (hasErrors) {
    console.log('');
  }

  // Helper to format arrays with space after commas between elements only
  const formatArray = (arr) => {
    if (arr === null) return 'null';
    return '[' + arr.map(item => JSON.stringify(item)).join(', ') + ']';
  };

  let output = '{\n';
  output += `  "fr": ${JSON.stringify(data.fr)},\n`;
  output += `  "en": ${JSON.stringify(data.en)},\n`;
  output += '  "kanji": [';

  data.kanji.forEach((kanji, kanjiIndex) => {
    if (kanjiIndex === 0) {
      output += '{\n';
    } else {
      output += ', {\n';
    }

    output += `    "character": ${JSON.stringify(kanji.character)},\n`;
    output += '    "readings": [';

    kanji.readings.forEach((reading, readingIndex) => {
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

    if (kanji.notes) {
      output += `,\n    "notes": ${JSON.stringify(kanji.notes)}`;
    }

    output += '\n  }';
  });

  output += ']\n';
  output += '}\n';

  fs.writeFileSync(filePath, output);
  console.log(`Formatted: ${path.relative(process.cwd(), filePath)}`);
}

// Main function
function formatAllJsonFiles() {
  const dataDir = path.join(process.cwd(), 'src/data');

  // Format vocabulary files
  const vocabDir = path.join(dataDir, 'vocabulary');
  if (fs.existsSync(vocabDir)) {
    const vocabFiles = fs.readdirSync(vocabDir).filter(f => f.endsWith('.json'));
    vocabFiles.forEach(file => {
      formatVocabularyJson(path.join(vocabDir, file));
    });
  }

  // Format kanji files
  const kanjiDir = path.join(dataDir, 'kanji');
  if (fs.existsSync(kanjiDir)) {
    const kanjiFiles = fs.readdirSync(kanjiDir).filter(f => f.endsWith('.json'));
    kanjiFiles.forEach(file => {
      formatKanjiJson(path.join(kanjiDir, file));
    });
  }

  console.log('\nAll JSON files formatted successfully');
}

// Run if called directly
if (require.main === module) {
  formatAllJsonFiles();
}

module.exports = { formatVocabularyJson, formatKanjiJson };
