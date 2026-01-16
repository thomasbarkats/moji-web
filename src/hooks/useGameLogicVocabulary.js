import { GAME_MODES, VOCABULARY_MODES, SOUND_MODES } from '../constants';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { usePreferences } from '../contexts/PreferencesContext';
import { parseVocabularyEntry } from '../utils/vocabularyHelpers';
import { vocabularyAPI } from '../services/apiService';
import {
  speakReading,
  selectNextItem,
  initializeGameState,
  finalizeItemSelection,
  initializeVocabularyData,
} from '../utils';


export const useGameLogicVocabulary = () => {
  const {
    setGameMode,
    setGameState,
    setUserInput,
    setStartTime,
    setFeedback,
    setProgress,
    setSessionStats,
    currentItem,
    setCurrentItem,
    currentItemStartRef,
  } = useGameContext();

  const {
    setCurrentVocabularyWords,
    setSessionFavoritesVocabulary,
    wordsCache,
    setWordsCache,
  } = useGameContextVocabulary();

  const { vocabularyMode, soundMode, setSoundModeValue, language } = usePreferences();


  const initializeVocabularyGame = async (selectedListKeys) => {
    if (!selectedListKeys || selectedListKeys.length === 0) return;

    if (vocabularyMode === VOCABULARY_MODES.SOUND_ONLY && soundMode === SOUND_MODES.NONE) {
      setSoundModeValue(SOUND_MODES.SPEECH_ONLY);
    }

    // Load actual word data from API for all selected lists in one request
    let rawWords = [];
    const isFavoritesIncluded = selectedListKeys.includes('favorites');
    const cacheKey = `${[...selectedListKeys].sort().join(',')}_${language}`;

    // Check cache first
    if (wordsCache[cacheKey]) {
      rawWords = wordsCache[cacheKey];
    } else {
      try {
        const listData = await vocabularyAPI.getWords(selectedListKeys, language);
        rawWords = listData.words || [];
        // Store in cache
        setWordsCache(prev => ({ ...prev, [cacheKey]: rawWords }));
      } catch (error) {
        console.error(`Failed to load vocabulary lists:`, error);
      }
    }

    const words = rawWords.map(word => {
      try {
        return {
          ...parseVocabularyEntry(word, language),
          id: word.id
        };
      } catch (error) {
        console.error('Failed to parse word:', word, error);
        // Return a fallback parsed word
        return {
          id: word.id,
          jp: word.jp || '',
          cleanedJp: word.jp || '',
          speechText: word.jp || '',
          translation: word.translation || '',
          infoText: word.note || null,
          parts: [{ type: 'text', text: word.jp || '' }]
        };
      }
    });

    // Initialize session favorites using isFavorite field
    if (isFavoritesIncluded) {
      const favoritesMap = new Map();
      rawWords.forEach(word => {
        if (word.isFavorite) {
          favoritesMap.set(word.id, true);
        }
      });
      setSessionFavoritesVocabulary(favoritesMap);
    } else {
      setSessionFavoritesVocabulary(new Map());
    }

    if (words.length === 0) return;

    setCurrentVocabularyWords(words);

    const setters = { setGameMode, setGameState, setUserInput, setStartTime, setFeedback };
    initializeGameState(setters, GAME_MODES.VOCABULARY);

    const { initialProgress, initialStats } = initializeVocabularyData(words, vocabularyMode);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextVocabularyWord(words, initialProgress);
  };

  const selectNextVocabularyWord = (allWords, currentProgress, forceRepeatWord = null) => {
    const availableWords = allWords.filter(word => !currentProgress[word.jp].mastered);

    if (availableWords.length === 0) return null;

    let nextWord;

    // Check if we need to force repeat a word (loop mode)
    if (forceRepeatWord) {
      nextWord = allWords.find(w => w.jp === forceRepeatWord);
    } else {
      nextWord = selectNextItem(availableWords, currentProgress, currentItem?.key);
    }

    if (!nextWord) return null;

    const isSoundOnlyMode = vocabularyMode === VOCABULARY_MODES.SOUND_ONLY;
    const isToJapaneseMode = vocabularyMode === VOCABULARY_MODES.TO_JAPANESE;

    const newItem = {
      id: nextWord.id,
      key: nextWord.jp,
      question: isToJapaneseMode
        ? nextWord.translation
        : nextWord.cleanedJp,
      answer: isToJapaneseMode
        ? nextWord.cleanedJp
        : nextWord.translation,
      cleanedJp: nextWord.cleanedJp,
      parts: nextWord.parts,
      infoText: nextWord.infoText,
      speechText: nextWord.speechText,
      isSoundOnly: isSoundOnlyMode,
    };

    const setters = { setCurrentItem, setUserInput, setFeedback, setProgress };
    const refs = { currentItemStartRef };
    finalizeItemSelection(newItem, nextWord.jp, setters, refs);

    // Speak word when showing Japanese (from Japanese mode or sound only mode)
    if ((soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) &&
      (vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE || vocabularyMode === VOCABULARY_MODES.SOUND_ONLY)) {
      setTimeout(() => speakReading(nextWord.speechText, 1), 100);
    }

    return newItem;
  };

  return {
    initializeVocabularyGame,
    selectNextVocabularyWord,
  };
};
