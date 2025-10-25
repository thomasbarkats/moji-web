import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { parseVocabularyEntry } from '../utils/vocabularyHelpers';
import { GAME_MODES, VOCABULARY_MODES, SOUND_MODES } from '../constants';
import {
  speakReading,
  selectNextItem,
  initializeGameState,
  finalizeItemSelection,
  initializeVocabularyData
} from '../utils';


export const useGameLogicVocabulary = () => {
  const {
    vocabularyLists,
    setGameMode,
    setGameState,
    setUserInput,
    setStartTime,
    setFeedback,
    setProgress,
    setSessionStats,
    currentItem,
    setCurrentItem,
    setCurrentVocabularyWords,
    currentItemStartRef,
  } = useGameContext();

  const { vocabularyMode, soundMode } = usePreferences();


  const initializeVocabularyGame = (selectedListKeys) => {
    if (!selectedListKeys || selectedListKeys.length === 0) return;

    const words = selectedListKeys.flatMap(listKey => {
      const rawWords = vocabularyLists[listKey]?.words || [];
      return rawWords.map(parseVocabularyEntry);
    });

    if (words.length === 0) return;

    setCurrentVocabularyWords(words);

    const setters = { setGameMode, setGameState, setUserInput, setStartTime, setFeedback };
    initializeGameState(setters, GAME_MODES.VOCABULARY);

    const { initialProgress, initialStats } = initializeVocabularyData(words, vocabularyMode);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextVocabularyWord(words, initialProgress);
  };

  const selectNextVocabularyWord = (allWords, currentProgress) => {
    const availableWords = allWords.filter(word => !currentProgress[word.jp].mastered);

    if (availableWords.length === 0) return null;

    const nextWord = selectNextItem(availableWords, currentProgress, currentItem?.key);

    if (!nextWord) return null;

    const newItem = {
      key: nextWord.jp,
      question: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.translation
        : nextWord.cleanedJp,
      answer: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.cleanedJp
        : nextWord.translation,
      cleanedJp: nextWord.cleanedJp,
      parts: nextWord.parts,
      infoText: nextWord.infoText,
      speechText: nextWord.speechText,
    };

    const setters = { setCurrentItem, setUserInput, setFeedback, setProgress };
    const refs = { currentItemStartRef };
    finalizeItemSelection(newItem, nextWord.jp, setters, refs);

    // Speak word when showing Japanese (from Japanese mode)
    if ((soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) &&
      vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE) {
      setTimeout(() => speakReading(nextWord.speechText, 1), 100);
    }

    return newItem;
  };

  return {
    initializeVocabularyGame,
    selectNextVocabularyWord,
  };
};
