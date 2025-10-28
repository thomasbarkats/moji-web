import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicKana } from './useGameLogicKana';
import { useGameLogicKanji } from './useGameLogicKanji';
import { useGameLogicVocabulary } from './useGameLogicVocabulary';
import {
  GAME_STATES,
  FEEDBACK_TYPES,
  TIMING,
  SOUND_MODES,
  GAME_MODES,
  VOCABULARY_MODES,
  KANJI_STEPS,
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
  getFirstStepForKanji,
} from '../utils';


export const useGameActions = () => {
  const {
    kanaData,
    gameMode,
    currentItem,
    userInput,
    progress,
    sessionStats,
    currentVocabularyWords,
    currentItemStartRef,
    setGameState,
    setGameMode,
    setCurrentItem,
    setUserInput,
    setProgress,
    setSessionStats,
    setStartTime,
    setFeedback,
    setCurrentVocabularyWords,
  } = useGameContext();

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
    vocabularyMode,
    soundMode,
    kanjiDiscoveryMode,
    kanjiMode,
  } = usePreferences();

  const { selectNextKana } = useGameLogicKana();
  const { selectNextVocabularyWord } = useGameLogicVocabulary();
  const { selectNextKanji } = useGameLogicKanji();


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
    setGameState(GAME_STATES.SUMMARY);
    setCurrentItem(null);
    currentItemStartRef.current = null;

    playFeedbackSound('summary', soundMode);
    triggerConfetti();
  };

  const proceedToNextItem = (newProgress, forceRepeatKanji = null, forceRestartStep = null) => {
    let nextItem;
    switch (gameMode) {
      case GAME_MODES.VOCABULARY:
        nextItem = selectNextVocabularyWord(currentVocabularyWords, newProgress);
        break;
      case GAME_MODES.KANJI:
        nextItem = selectNextKanji(currentKanjiList, newProgress, forceRepeatKanji, forceRestartStep);
        break;
      default:
        const options = { dakutenMode, combinationsMode };
        const allKana = getAllKanaForMode(gameMode, kanaData, options);
        nextItem = selectNextKana(allKana, newProgress);
    }

    // If no next item available, finish session
    if (!nextItem) {
      finishSession();
    }
  };

  const handleKanjiStepSubmit = () => {
    if (!currentItem || !userInput.trim()) return;

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
        // Check discovery mode logic on failure
        if (!isCorrect && kanjiDiscoveryMode) {
          const currentSuccesses = newProgress[currentItem.key].successes;

          // 1st success attempt: repeat from current step
          if (currentSuccesses === 0) {
            setUserInput('');
            setFeedback(null);
            proceedToNextItem(newProgress, currentItem.key, currentStep);
            return;
          }

          // 2nd success attempt: repeat from first step
          if (currentSuccesses === 1 && requiredSuccesses > 1) {
            setUserInput('');
            setFeedback(null);
            const firstStep = getFirstStepForKanji(currentItem.readings, kanjiMode);
            proceedToNextItem(newProgress, currentItem.key, firstStep);
            return;
          }

          // 3rd+ success or requiredSuccesses <= 2: normal behavior (proceed to next)
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
    if (!currentItem || !userInput.trim()) return;

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

    const shouldPlaySpeech = (soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) &&
      !(isVocabularyMode && vocabularyMode === VOCABULARY_MODES.FROM_JAPANESE);

    const hasInfoText = isVocabularyMode && currentItem.infoText;
    const infoTextDelay = hasInfoText ? 1500 : 0;
    const nextDelay = (isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY) + infoTextDelay;

    if (shouldPlaySpeech) {
      const textToSpeak = (isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE)
        ? currentItem.speechText
        : currentItem.question;

      if (soundMode === SOUND_MODES.SPEECH_ONLY) {
        speakReading(textToSpeak, isVocabularyMode ? 1 : 0.5, () => {
          setTimeout(() => proceedToNextItem(newProgress), infoTextDelay);
        });
      } else {
        const speechDelay = (isCorrect && !isVocabularyMode) ? 150 : 280;
        setTimeout(() => {
          speakReading(textToSpeak, isVocabularyMode ? 1 : 0.5, () => {
            setTimeout(() => proceedToNextItem(newProgress), infoTextDelay);
          });
        }, speechDelay);
      }
    } else {
      setTimeout(() => proceedToNextItem(newProgress), nextDelay);
    }
  };

  const resetGame = () => {
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
  };

  return {
    handleSubmit,
    resetGame,
    finishSession,
  };
};
