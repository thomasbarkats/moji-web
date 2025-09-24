import { useState, useRef } from 'react';
import { MainMenu, GamePlay, Summary } from './components/game';
import { useTheme, useKanaData, useSound, useUserPreferences } from './hooks';
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
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const kanaData = useKanaData();
  const { soundMode, cycleSoundMode, getSoundModeIcon } = useSound();
  const { preferences, updatePreferences } = useUserPreferences();

  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState('');
  const [currentKana, setCurrentKana] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [sortBy, setSortBy] = useState(SORT_MODES.FAILURES);
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const currentKanaStartRef = useRef(null);

  // Use preferences directly instead of creating separate states
  const requiredSuccesses = preferences.requiredSuccesses;
  const includeDakuten = preferences.includeDakuten;
  const includeCombinations = preferences.includeCombinations;


  const handleRequiredSuccessesChange = (e) => {
    const value = Math.max(
      REQUIRED_SUCCESSES_LIMITS.MIN,
      Math.min(REQUIRED_SUCCESSES_LIMITS.MAX, Number(e.target.value) || 1)
    );
    updatePreferences({ requiredSuccesses: value });
  };

  const handleToggleDakuten = (value) => {
    updatePreferences({ includeDakuten: value });
  };

  const handleToggleCombinations = (value) => {
    updatePreferences({ includeCombinations: value });
  };

  const initializeGame = (mode) => {
    setGameMode(mode);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const options = { includeDakuten, includeCombinations };
    const allKana = getAllKanaForMode(mode, kanaData, options);
    const { initialProgress, initialStats } = initializeKanaData(allKana);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKana(allKana, initialProgress);
  };

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

  const finishSession = () => {
    setGameState(GAME_STATES.SUMMARY);
    setCurrentKana(null);
    currentKanaStartRef.current = null;

    playFeedbackSound('summary', soundMode);
    triggerConfetti();
  };

  const calculateTimeSpent = () => {
    if (!currentKanaStartRef.current) return 0;
    const deltaMs = Date.now() - currentKanaStartRef.current;
    return Math.round(deltaMs / 1000);
  };

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
      const options = { includeDakuten, includeCombinations };
      const allKana = getAllKanaForMode(gameMode, kanaData, options);
      selectNextKana(allKana, newProgress);
    }, isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY);
  };

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
          includeDakuten={includeDakuten}
          onToggleDakuten={handleToggleDakuten}
          includeCombinations={includeCombinations}
          onToggleCombinations={handleToggleCombinations}
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
