import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useSound } from './useSound';
import { useGameLogic } from './useGameLogic';
import { useVocabularyGameLogic } from './useVocabularyGameLogic';
import {
  getAllKanaForMode,
  speakKanaReading,
  playFeedbackSound,
  triggerConfetti,
} from '../utils';
import {
  GAME_STATES,
  FEEDBACK_TYPES,
  TIMING,
  SOUND_MODES,
  GAME_MODES,
  VOCABULARY_MODES,
  APP_MODES,
} from '../constants';


export const useGameActions = () => {
  const {
    kanaData,
    gameState,
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
    requiredSuccesses,
    dakutenMode,
    combinationsMode,
    vocabularyMode,
  } = usePreferences();

  const { soundMode } = useSound();
  const { selectNextKana } = useGameLogic();
  const { selectNextVocabularyWord } = useVocabularyGameLogic();


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

    newStats[item.key] = { ...newStats[item.key] };
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

  const proceedToNextItem = (newProgress) => {
    const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;
    
    let nextItem;
    if (isVocabularyMode) {
      nextItem = selectNextVocabularyWord(currentVocabularyWords, newProgress);
    } else {
      const options = { dakutenMode, combinationsMode };
      const allKana = getAllKanaForMode(gameMode, kanaData, options);
      nextItem = selectNextKana(allKana, newProgress);
    }

    // If no next item available, finish session
    if (!nextItem) {
      finishSession();
    }
  };

  const handleSubmit = () => {
    if (!currentItem || !userInput.trim()) return;

    const timeSpent = calculateTimeSpent();

    const correctAnswer = currentItem.answer;
    const isCorrect = userInput.toLowerCase().trim() === correctAnswer.toLowerCase();
    const feedbackType = isCorrect ? FEEDBACK_TYPES.SUCCESS : FEEDBACK_TYPES.ERROR;
    const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;

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

    if (shouldPlaySpeech) {
      const textToSpeak = (isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE) ? currentItem.answer : currentItem.question;
      const speechDelay = (isCorrect && !isVocabularyMode) ? 200 : 400;

      setTimeout(() => {
        speakKanaReading(textToSpeak, isVocabularyMode ? 1 : 0.5, () => {
          proceedToNextItem(newProgress);
        });
      }, speechDelay);
    } else {
      setTimeout(() => {
        proceedToNextItem(newProgress);
      }, isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY);
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
    currentItemStartRef.current = null;
  };

  return {
    handleSubmit,
    resetGame,
    finishSession,
  };
};
