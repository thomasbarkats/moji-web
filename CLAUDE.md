# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kana Trainer Web is a React-based Japanese learning application that helps users practice hiragana, katakana, kanji, and vocabulary. The app uses a spaced-repetition-like system to track mastery of individual characters and words.

## Development Commands

- **Start dev server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Format data files**: `pnpm run data:format` - Formats all JSON files in `src/data/vocabulary/` and `src/data/kanji/` with consistent formatting
- **List data stats**: `pnpm run data:list` - Shows statistics about vocabulary and kanji data files
- **Add new data**: `pnpm run data:add` - Interactive CLI to create new vocabulary or kanji sets

**Important**: This project uses **pnpm only** (not npm or yarn).

## Architecture

### Context-Based State Management

The application uses React Context for state management with three primary contexts:

1. **GameContext** (`src/contexts/GameContext.jsx`) - Main game state for kana and vocabulary modes
   - Manages game states: MENU, PLAYING, SUMMARY, REVIEW
   - Handles app mode switching between kana, vocabulary, and kanji
   - Stores current item, user input, feedback, progress, and session stats
   - Provides vocabulary-specific state like selected word lists

2. **GameContextKanji** (`src/contexts/GameContextKanji.jsx`) - Specialized context for kanji mode
   - Manages multi-step validation (kun readings → on readings → meanings)
   - Tracks current step and accumulated step data across kanji prompts

3. **PreferencesContext** - User preferences (theme, language, default app mode, dakuten/combination modes, etc.)

4. **I18nContext** - Internationalization support for French/English UI

### Game Logic Separation

Game logic is separated into specialized hooks in `src/hooks/`:

- **useGameLogicKana.js** - Kana-specific game logic (hiragana/katakana)
- **useGameLogicKanji.js** - Kanji multi-step validation logic
- **useGameLogicVocabulary.js** - Vocabulary game logic with bidirectional translation
- **useGameActions.js** - Shared game actions (submit answer, reset game, etc.)
- **useDataKana.js**, **useDataKanji.js**, **useDataVocabulary.js** - Data loading hooks

### Component Organization

Components follow this structure:
- **Game Menus**: `GameMenuKana.jsx`, `GameMenuKanji.jsx`, `GameMenuVocabulary.jsx` - Mode-specific configuration screens
- **Game Play**: `GamePlay.jsx` - Universal gameplay screen that adapts based on app mode
- **Review Screens**: `ReviewKana.jsx`, `ReviewKanji.jsx`, `ReviewVocabulary.jsx` - Browse all items without playing
- **Summary**: `Summary.jsx` - Post-game statistics and results
- **UI Components**: Reusable components in `src/components/ui/`

### Data Format

**Vocabulary files** (`src/data/vocabulary/*.json`):
```json
{
  "fr": "French name",
  "en": "English name",
  "words": [{
    "jp": "{漢字}[かんじ]",
    "fr": "french translation",
    "en": "english translation",
    "note_fr": "optional french note",
    "note_en": "optional english note"
  }]
}
```

Japanese text uses furigana notation: `{kanji}[reading]` for kanji with readings, plain text for kana/katakana.

**Kanji files** (`src/data/kanji/*.json`):
```json
{
  "fr": "French name",
  "en": "English name",
  "kanji": [{
    "character": "漢",
    "readings": [{
      "kun": ["くだもの", "は"],
      "on": ["カ"],
      "fr": ["fruit", "feuille"],
      "en": ["fruit", "leaf"]
    }],
    "notes": "optional notes"
  }]
}
```

Kanji can have multiple reading groups. Each group associates kun/on readings with their specific meanings. Use `null` for kun/on when a reading type doesn't apply to that group.

### Game Flow

1. **Menu State** → User selects mode and options
2. **Playing State** → Game presents items, user inputs answers
3. **Summary State** → Shows session statistics sorted by failures/time/alphabetically
4. **Review State** → Browse mode to view all items in selected lists

### Key Utilities

- **gameHelpers.js** - Core game logic (item selection, progress tracking, data initialization)
- **kanaHelpers.js** - Kana-specific utilities (romanization validation, filtering)
- **kanjiHelpers.js** - Kanji utilities (multi-step validation, reading extraction, furigana parsing)
- **vocabularyHelpers.js** - Vocabulary utilities (furigana parsing for display)
- **statsService.js** - Statistics sorting and aggregation
- **audioHelpers.js** - Speech synthesis for Japanese pronunciation

### Constants

All game modes, states, and configuration constants are defined in `src/constants.js`. Always reference these constants rather than using string literals.

## Data Management

When modifying vocabulary or kanji data files:
1. Edit the JSON files directly in `src/data/vocabulary/` or `src/data/kanji/`
2. Run `pnpm run data:format` to ensure consistent formatting
3. The formatter validates kanji readings and warns about common errors (e.g., comma-separated readings in a single string instead of array elements)

Use `pnpm run data:add` to interactively create new vocabulary or kanji sets - it automatically formats output correctly.

## Multi-Step Kanji Validation

Kanji mode uses a unique multi-step validation flow:
1. First prompt: Enter all kun readings (or skip if none)
2. Second prompt: Enter all on readings (or skip if none)
3. Third prompt: Enter all meanings (with accumulated readings displayed)

The flow is managed by `GameContextKanji` with step transitions handled in `useGameLogicKanji.js`. If `kanjiMode` is set to "meanings_only", steps 1-2 are skipped.

## Speech Synthesis

The app uses Web Speech API for Japanese pronunciation. Configuration is in `SPEECH_CONFIG` in constants. Wanakana library is used for romanization conversion (hiragana ↔ romaji).
