import React, { useState, useRef } from 'react';
import { MainMenu, GamePlay, Summary } from './components/game';
import { useTheme, useKanaData, useSound } from './hooks';
import { getSortedStats } from './services/statsService';
import {
  getAllKanaForMode,
  initializeKanaData,
  speakKanaReading,
  playFeedbackSound,
  triggerConfetti
} from './utils';
import {
  GAME_STATES,
  SORT_MODES,
  FEEDBACK_TYPES,
  TIMING,
  SOUND_MODES,
  REQUIRED_SUCCESSES_LIMITS
} from './constants';


function App() {
  // Hooks
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const kanaData = useKanaData();
  const { soundMode, cycleSoundMode, getSoundModeIcon } = useSound();


  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState('');
  const [currentKana, setCurrentKana] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [sortBy, setSortBy] = useState(SORT_MODES.FAILURES);
  const [startTime, setStartTime] = useState(null);
  const [requiredSuccesses, setRequiredSuccesses] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const currentKanaStartRef = useRef(null);


  // Initialize game
  const initializeGame = (mode) => {
    setGameMode(mode);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const allKana = getAllKanaForMode(mode, kanaData);
    const { initialProgress, initialStats } = initializeKanaData(allKana);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKana(allKana, initialProgress);
  };

  // Select next kana
  const selectNextKana = (allKana, currentProgress) => {
    const availableKana = allKana.filter(kana => !currentProgress[kana.char].mastered);

    if (availableKana.length === 0) {
      finishSession();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableKana.length);
    const next = availableKana[randomIndex];

    setCurrentKana(next);
    setUserInput('');
    setFeedback(null);
    currentKanaStartRef.current = Date.now();
  };

  // Finish session
  const finishSession = () => {
    setGameState(GAME_STATES.SUMMARY);
    setCurrentKana(null);
    currentKanaStartRef.current = null;

    playFeedbackSound('summary', soundMode);
    triggerConfetti();
  };

  // Calculate time spent
  const calculateTimeSpent = () => {
    if (!currentKanaStartRef.current) return 0;
    const deltaMs = Date.now() - currentKanaStartRef.current;
    return Math.round(deltaMs / 1000);
  };

  // Update stats
  const updateKanaStats = (kana, isCorrect, timeSpent) => {
    const newProgress = { ...progress };
    const newStats = { ...sessionStats };

    newProgress[kana.char] = { ...newProgress[kana.char] };
    if (isCorrect) {
      newProgress[kana.char].successes += 1;
      if (newProgress[kana.char].successes >= requiredSuccesses) {
        newProgress[kana.char].mastered = true;
      }
    } else {
      newProgress[kana.char].failures += 1;
    }

    newStats[kana.char] = { ...newStats[kana.char] };
    if (isCorrect) {
      newStats[kana.char].successes += 1;
    } else {
      newStats[kana.char].failures += 1;
    }
    newStats[kana.char].timeSpent = (newStats[kana.char].timeSpent || 0) + timeSpent;

    return { newProgress, newStats };
  };

  // Handle submit
  const handleSubmit = () => {
    if (!currentKana || !userInput.trim()) return;

    const timeSpent = calculateTimeSpent();
    const isCorrect = userInput.toLowerCase().trim() === currentKana.reading.toLowerCase();
    const feedbackType = isCorrect ? FEEDBACK_TYPES.SUCCESS : FEEDBACK_TYPES.ERROR;

    playFeedbackSound(feedbackType, soundMode);

    if (soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) {
      setTimeout(() => speakKanaReading(currentKana.char), isCorrect ? 200 : 400);
    }

    setFeedback({
      type: feedbackType,
      correctAnswer: currentKana.reading,
      userAnswer: userInput.trim()
    });

    const { newProgress, newStats } = updateKanaStats(currentKana, isCorrect, timeSpent);
    setProgress(newProgress);
    setSessionStats(newStats);

    currentKanaStartRef.current = null;

    setTimeout(() => {
      const allKana = getAllKanaForMode(gameMode, kanaData);
      selectNextKana(allKana, newProgress);
    }, isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY);
  };

  // Reset game
  const resetGame = () => {
    setGameState(GAME_STATES.MENU);
    setGameMode('');
    setCurrentKana(null);
    setUserInput('');
    setProgress({});
    setSessionStats({});
    setStartTime(null);
    setFeedback(null);
    currentKanaStartRef.current = null;
  };

  // Handle required successes change
  const handleRequiredSuccessesChange = (e) => {
    const value = Math.max(
      REQUIRED_SUCCESSES_LIMITS.MIN,
      Math.min(REQUIRED_SUCCESSES_LIMITS.MAX, Number(e.target.value) || 1)
    );
    setRequiredSuccesses(value);
  };

  // Render based on game state
  switch (gameState) {
    case GAME_STATES.MENU:
      return (
        <MainMenu
          theme={theme}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundMode={soundMode}
          cycleSoundMode={cycleSoundMode}
          getSoundModeIcon={getSoundModeIcon}
          requiredSuccesses={requiredSuccesses}
          onRequiredSuccessesChange={handleRequiredSuccessesChange}
          onStartGame={initializeGame}
        />
      );

    case GAME_STATES.PLAYING:
      return (
        <GamePlay
          theme={theme}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundMode={soundMode}
          cycleSoundMode={cycleSoundMode}
          getSoundModeIcon={getSoundModeIcon}
          currentKana={currentKana}
          userInput={userInput}
          setUserInput={setUserInput}
          feedback={feedback}
          progress={progress}
          requiredSuccesses={requiredSuccesses}
          sessionStats={sessionStats}
          startTime={startTime}
          onSubmit={handleSubmit}
          onReset={resetGame}
        />
      );

    case GAME_STATES.SUMMARY:
      return (
        <Summary
          theme={theme}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          gameMode={gameMode}
          sessionStats={sessionStats}
          progress={progress}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortedStats={getSortedStats(sessionStats, sortBy)}
          requiredSuccesses={requiredSuccesses}
          onNewSession={resetGame}
          onRestartSameMode={() => initializeGame(gameMode)}
        />
      );

    default:
      return null;
  }
}

export default App;
