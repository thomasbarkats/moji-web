# Kana Cafe

A React-based Japanese learning application for practicing hiragana, katakana, kanji, and vocabulary.

## Game Specificities

### Kana Mode
- Practice hiragana and katakana characters
- Optional dakuten (゛゜) and combination characters (きゃ, しゅ, etc.)
- Romanization input with Wanakana
- Audio pronunciation via Web Speech API

### Vocabulary Mode
- **Bidirectional translation**: French→Japanese, Japanese→French, or both
- **Sound mode**: Audio-only challenges (listen and type in Japanese)
- Furigana support: `{漢字}[かんじ]`

### Kanji Mode
- **Reading groups**: Kanji readings and their related meanings are grouped together for exhaustiveness and precision. Only obsolete or non-productive readings/meanings are ignored.
- **Multi-step validation**: Three-step input flow
  1. Enter all kun readings (訓読み) or skip
  2. Enter all on readings (音読み) or skip
  3. Enter all meanings with accumulated readings displayed (in order of reading groups)
- **Meanings-only mode**: Skip directly to meaning input
- Comma-separated input for multiple readings/meanings

### Review Mode
Browse all characters/words in selected lists without playing.

## Kanji Learning - Recommendation

Ggame's core principle may seem heavy at first. Finding / memorizing all the readings and meanings for each kanji is hard work. But forcing yourself through it—even though it takes time and long game sessions—is the best way to learn and memorize them correctly. Think of it as brain brute-force.

## Stack Choices

**JavaScript (not TypeScript)**: As a small learning game developed with AI assistance, vanilla JS provides lighter context and greater flexibility for rapid iteration without type system overhead for now.

**Minimal linting**: No heavy lint configurations. Personal conventions maintained through AI-assisted written script, prioritizing readability over rigid standards.
