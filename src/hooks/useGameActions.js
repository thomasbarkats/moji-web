import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { useGameLogicKana } from './useGameLogicKana';
import { useGameLogicKanji } from './useGameLogicKanji';
import { useGameLogicVocabulary } from './useGameLogicVocabulary';
import { progressAPI } from '../services/apiService';
import {
  GAME_STATES,
  FEEDBACK_TYPES,
  TIMING,
  SOUND_MODES,
  GAME_MODES,
  KANJI_STEPS,
  ITEM_TYPES,
  KANJI_PROGRESS_TYPES,
  VOCABULARY_MODES,
} from '../constants';
import {
  getAllKanaForMode,
  speakReading,
  playFeedbackSound,
  triggerConfetti,
  checkVocabularyAnswer,
  validateKanjiAnswer,
  getExpectedAnswerForFeedback,
  getKunReadingsForAudio,
  getOnReadingsForAudio,
} from '../utils';


export const useGameActions = () => {
  const {
    kanaData,
    gameMode,
    currentItem,
    userInput,
    progress,
    sessionStats,
    currentItemStartRef,
    setGameState,
    setGameMode,
    setCurrentItem,
    setUserInput,
    setProgress,
    setSessionStats,
    setStartTime,
    setFeedback,
    setStoppedEarly,
  } = useGameContext();

  const {
    currentVocabularyWords,
    setCurrentVocabularyWords,
  } = useGameContextVocabulary();

  const {
    currentStep,
    currentKanjiList,
    proceedToNextStep,
    resetSteps,
  } = useGameContextKanji();

  const {
    requiredSuccesses,
    dakutenMode,
    combinationsMode,
    kanaLoopMode,
    vocabularyMode,
    vocabularyLoopMode,
    soundMode,
    kanjiLoopMode,
    kanjiMode,
  } = usePreferences();

  const { selectNextKana } = useGameLogicKana();
  const { selectNextVocabularyWord } = useGameLogicVocabulary();
  const { selectNextKanji } = useGameLogicKanji();

  const { isAuthenticated } = useAuth();

  // Helper to get progress type based on game mode and current step
  const getProgressType = (mode, step = null) => {
    switch (mode) {
      case GAME_MODES.KANJI:
        return KANJI_PROGRESS_TYPES[step] ?? null;
      case GAME_MODES.VOCABULARY:
        return vocabularyMode;
      default:
        return 'kana';
    }
  };

  // Helper to get item type based on game mode
  const getItemType = (mode) => {
    switch (mode) {
      case GAME_MODES.KANJI:
        return ITEM_TYPES.KANJI;
      case GAME_MODES.VOCABULARY:
        return ITEM_TYPES.VOCABULARY;
      default:
        return ITEM_TYPES.KANA;
    }
  };

  // Record progress to the API (fire-and-forget, no error handling needed)
  const recordProgress = (item, isCorrect, step = null) => {
    if (!isAuthenticated || !item) return;

    const itemType = getItemType(gameMode);
    const progressType = getProgressType(gameMode, step);

    if (!progressType) return;

    // Use item.id for all item types (kana now has id too)
    const itemId = item.id;
    const listId = item.listId ?? gameMode; // For kana, use the game mode as listId

    progressAPI.recordProgress({
      itemId: String(itemId),
      itemType,
      progressType,
      listId: String(listId),
      success: isCorrect,
    }).catch(() => {
      // Silent failure - progress tracking should not interrupt gameplay
    });
  };

  const calculateTimeSpent = () => {
    if (!currentItemStartRef.current) return 0;
    const deltaMs = Date.now() - currentItemStartRef.current;
    return Math.round(deltaMs / 1000);
  };

  const updateStats = (item, isCorrect, timeSpent) => {
    const newProgress = { ...progress };
    const newStats = { ...sessionStats };

    newProgress[item.key] = { ...newProgress[item.key] };

    if (isCorrect) {
      newProgress[item.key].successes += 1;
      if (newProgress[item.key].successes >= requiredSuccesses) {
        newProgress[item.key].mastered = true;
      }
    } else {
      newProgress[item.key].failures += 1;
    }

    if (isCorrect) {
      newStats[item.key].successes += 1;
    } else {
      newStats[item.key].failures += 1;
    }

    newStats[item.key].timeSpent = (newStats[item.key].timeSpent || 0) + timeSpent;

    return { newProgress, newStats };
  };

  const finishSession = () => {
    setStoppedEarly(false);
    setGameState(GAME_STATES.SUMMARY);
    setCurrentItem(null);
    currentItemStartRef.current = null;

    playFeedbackSound('summary', soundMode);
  };

  const proceedToNextItem = (newProgress, forceRepeatKanji = null, forceRestartStep = null, forceRepeatWord = null, forceRepeatKana = null) => {
    let nextItem;
    switch (gameMode) {
      case GAME_MODES.VOCABULARY:
        nextItem = selectNextVocabularyWord(currentVocabularyWords, newProgress, forceRepeatWord);
        break;
      case GAME_MODES.KANJI:
        nextItem = selectNextKanji(currentKanjiList, newProgress, forceRepeatKanji, forceRestartStep);
        break;
      default:
        const options = { dakutenMode, combinationsMode };
        const allKana = getAllKanaForMode(gameMode, kanaData, options);
        nextItem = selectNextKana(allKana, newProgress, forceRepeatKana);
    }

    // If no next item available, finish session
    if (!nextItem) {
      finishSession();
    }
  };

  const handleKanjiStepSubmit = () => {
    if (!currentItem) return;

    const isCorrect = validateKanjiAnswer(userInput, currentItem, currentStep);
    const expectedAnswers = getExpectedAnswerForFeedback(currentItem, currentStep);
    const correctAnswer = expectedAnswers.join(', ');
    const feedbackType = isCorrect ? FEEDBACK_TYPES.SUCCESS : FEEDBACK_TYPES.ERROR;

    playFeedbackSound(feedbackType, soundMode);

    setFeedback({
      type: feedbackType,
      correctAnswer,
      userAnswer: userInput.trim(),
    });

    const isLastStep = currentStep === KANJI_STEPS.MEANINGS;

    let newProgress = progress;
    let newStats = sessionStats;

    // Always record progress for each kanji step (kun, on, meanings)
    recordProgress(currentItem, isCorrect, currentStep);

    if (!isCorrect || isLastStep) {
      const timeSpent = calculateTimeSpent();
      const stats = updateStats(currentItem, isCorrect, timeSpent);
      newProgress = stats.newProgress;
      newStats = stats.newStats;
      setProgress(newProgress);
      setSessionStats(newStats);
      currentItemStartRef.current = null;
    }

    const shouldPlaySpeech = (soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) && !isLastStep;
    const nextDelay = isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : (TIMING.ERROR_FEEDBACK_DELAY + (correctAnswer.length * 40));

    const proceedToNext = () => {
      if (!isCorrect || isLastStep) {
        // Loop mode: repeat current step on failure
        if (!isCorrect && kanjiLoopMode) {
          setUserInput('');
          setFeedback(null);
          proceedToNextItem(newProgress, currentItem.key, currentStep);
          return;
        }

        proceedToNextItem(newProgress);
      } else {
        setUserInput('');
        setFeedback(null);
        proceedToNextStep(currentItem);
      }
    };

    if (shouldPlaySpeech) {
      const readingsToSpeak = currentStep === KANJI_STEPS.KUN_READINGS
        ? getKunReadingsForAudio(currentItem.readings)
        : getOnReadingsForAudio(currentItem.readings);
      const textToSpeak = readingsToSpeak.join(',').replace(/[()]/g, '');

      if (soundMode === SOUND_MODES.SPEECH_ONLY) {
        speakReading(textToSpeak, 1, proceedToNext);
      } else {
        const speechDelay = isCorrect ? 150 : 280;
        setTimeout(() => {
          speakReading(textToSpeak, 1, proceedToNext);
        }, speechDelay);
      }
    } else {
      setTimeout(proceedToNext, nextDelay);
    }
  };

  const handleSubmit = () => {
    if (!currentItem) return;

    if (gameMode === GAME_MODES.KANJI) {
      handleKanjiStepSubmit();
      return;
    }

    const timeSpent = calculateTimeSpent();
    const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;

    const correctAnswer = currentItem.answer;
    const isCorrect = isVocabularyMode
      ? checkVocabularyAnswer(userInput, correctAnswer)
      : userInput.toLowerCase().trim() === correctAnswer.toLowerCase();

    const feedbackType = isCorrect ? FEEDBACK_TYPES.SUCCESS : FEEDBACK_TYPES.ERROR;

    playFeedbackSound(feedbackType, soundMode);

    setFeedback({
      type: feedbackType,
      correctAnswer: correctAnswer,
      userAnswer: userInput.trim()
    });

    const { newProgress, newStats } = updateStats(currentItem, isCorrect, timeSpent);
    setProgress(newProgress);
    setSessionStats(newStats);

    currentItemStartRef.current = null;

    // Record progress to API for vocabulary and kana modes
    recordProgress(currentItem, isCorrect);

    const shouldPlaySpeech = (soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) &&
      !(isVocabularyMode && vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE);

    const hasInfoText = isVocabularyMode && currentItem.infoText;
    const infoTextDelay = hasInfoText ? 1500 : 0;
    const nextDelay = (isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY) + infoTextDelay;

    const proceedToNext = () => {
      // Loop mode for vocabulary: repeat same word on failure
      if (!isCorrect && isVocabularyMode && vocabularyLoopMode) {
        setTimeout(() => proceedToNextItem(newProgress, null, null, currentItem.key), infoTextDelay);
      }
      // Loop mode for kana: repeat same kana on failure
      else if (!isCorrect && !isVocabularyMode && kanaLoopMode) {
        setTimeout(() => proceedToNextItem(newProgress, null, null, null, currentItem.key), infoTextDelay);
      } else {
        setTimeout(() => proceedToNextItem(newProgress), infoTextDelay);
      }
    };

    if (shouldPlaySpeech) {
      const textToSpeak = (isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE)
        ? currentItem.speechText
        : currentItem.question;

      if (soundMode === SOUND_MODES.SPEECH_ONLY) {
        speakReading(textToSpeak, isVocabularyMode ? 1 : 0.5, proceedToNext);
      } else {
        const speechDelay = (isCorrect && !isVocabularyMode) ? 150 : 280;
        setTimeout(() => {
          speakReading(textToSpeak, isVocabularyMode ? 1 : 0.5, proceedToNext);
        }, speechDelay);
      }
    } else {
      setTimeout(proceedToNext, nextDelay);
    }
  };

  const resetGame = () => {
    // Show summary with stopped early flag
    setStoppedEarly(true);
    setGameState(GAME_STATES.SUMMARY);
    setFeedback(null);
  };

  const clearGameData = () => {
    // Clear all game data and return to menu
    setGameState(GAME_STATES.MENU);
    setGameMode('');
    setCurrentItem(null);
    setUserInput('');
    setProgress({});
    setSessionStats({});
    setStartTime(null);
    setFeedback(null);
    setCurrentVocabularyWords([]);
    resetSteps();
    currentItemStartRef.current = null;
    setStoppedEarly(false);
  };

  return {
    handleSubmit,
    resetGame,
    clearGameData,
    finishSession,
  };
};
