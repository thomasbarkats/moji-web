import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useSound } from './useSound';
import { speakKanaReading } from '../utils';
import { parseVocabularyEntry } from '../utils/vocabularyHelpers';
import { GAME_STATES, GAME_MODES, VOCABULARY_MODES, SOUND_MODES } from '../constants';


export const useVocabularyGameLogic = () => {
  const {
    vocabularyLists,
    setGameMode,
    setGameState,
    setUserInput,
    setStartTime,
    setFeedback,
    setProgress,
    setSessionStats,
    setCurrentItem,
    setCurrentVocabularyWords,
    currentItemStartRef,
  } = useGameContext();

  const { vocabularyMode } = usePreferences();
  const { soundMode } = useSound();


  const initializeVocabularyGame = (selectedListKeys) => {
    if (!selectedListKeys || selectedListKeys.length === 0) {
      return;
    }

    const words = selectedListKeys.flatMap(listKey => {
      const rawWords = vocabularyLists[listKey]?.words || [];
      return rawWords.map(parseVocabularyEntry);
    });

    if (words.length === 0) {
      return;
    }

    setCurrentVocabularyWords(words);
    setGameMode(GAME_MODES.VOCABULARY);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const initialProgress = {};
    const initialStats = {};
    words.forEach(word => {
      initialProgress[word.japanese] = { successes: 0, failures: 0, mastered: false };
      initialStats[word.japanese] = {
        key: word.japanese,
        question: word.displayText,
        answer: word.translation,
        successes: 0,
        failures: 0,
        timeSpent: 0
      };
    });

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextVocabularyWord(words, initialProgress);
  };

  const selectNextVocabularyWord = (allWords, currentProgress) => {
    const availableWords = allWords.filter(word => !currentProgress[word.japanese].mastered);

    if (availableWords.length === 0) {
      return null; // Signal to finish session
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const nextWord = availableWords[randomIndex];

    const newItem = {
      key: nextWord.japanese,
      question: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.translation
        : nextWord.displayText,
      answer: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.japanese
        : nextWord.translation,
      displayText: nextWord.displayText,
      parts: nextWord.parts,
      infoText: nextWord.infoText,
      speechText: nextWord.speechText,
    };

    setCurrentItem(newItem);

    // Speak word when showing Japanese (from Japanese mode)
    if ((soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) &&
      vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE) {
      setTimeout(() => speakKanaReading(nextWord.speechText, 1), 100);
    }

    setUserInput('');
    setFeedback(null);
    currentItemStartRef.current = Date.now();

    return newItem;
  };

  return {
    initializeVocabularyGame,
    selectNextVocabularyWord,
  };
};
