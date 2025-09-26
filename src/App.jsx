import { useState, useRef } from 'react';
import { MainMenu, GamePlay, Summary, VocabularyMenu, KeyboardHint } from './components';
import { useTheme, useKanaData, useVocabularyData, useSound, useUserPreferences } from './hooks';
import { getSortedStats } from './services/statsService';
import {
  getAllKanaForMode,
  initializeKanaData,
  initializeVocabularyData,
  speakKanaReading,
  playFeedbackSound,
  triggerConfetti,
} from './utils';
import {
  GAME_STATES,
  SORT_MODES,
  FEEDBACK_TYPES,
  TIMING,
  SOUND_MODES,
  REQUIRED_SUCCESSES_LIMITS,
  APP_MODES,
  VOCABULARY_MODES,
  GAME_MODES,
} from './constants';


function App() {
  const kanaData = useKanaData();
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const { soundMode, cycleSoundMode, getSoundModeIcon } = useSound();
  const { preferences, updatePreferences } = useUserPreferences();
  const { vocabularyLists, loading: vocabularyLoading } = useVocabularyData('fr');

  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [sortBy, setSortBy] = useState(SORT_MODES.FAILURES);
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const currentItemStartRef = useRef(null);
  const [appMode, setAppMode] = useState(APP_MODES.KANA);
  const [selectedLists, setSelectedLists] = useState([]);
  const [currentVocabularyWords, setCurrentVocabularyWords] = useState([]);

  // Use preferences directly instead of creating separate states
  const requiredSuccesses = preferences.requiredSuccesses;
  const dakutenMode = preferences.dakutenMode;
  const combinationsMode = preferences.combinationsMode;
  const vocabularyMode = preferences.vocabularyMode;


  const handleRequiredSuccessesChange = (e) => {
    const value = Math.max(
      REQUIRED_SUCCESSES_LIMITS.MIN,
      Math.min(REQUIRED_SUCCESSES_LIMITS.MAX, Number(e.target.value) || 1)
    );
    updatePreferences({ requiredSuccesses: value });
  };

  const handleDakutenModeChange = (value) => {
    updatePreferences({ dakutenMode: value });
  };

  const handleCombinationsModeChange = (value) => {
    updatePreferences({ combinationsMode: value });
  };

  const handleVocabularyModeChange = (value) => {
    updatePreferences({ vocabularyMode: value });
  };

  const switchToVocabulary = () => setAppMode(APP_MODES.VOCABULARY);
  const switchToKana = () => setAppMode(APP_MODES.KANA);

  const initializeGame = (mode) => {
    setGameMode(mode);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const options = { dakutenMode, combinationsMode };
    const allKana = getAllKanaForMode(mode, kanaData, options);
    const { initialProgress, initialStats } = initializeKanaData(allKana);

    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextKana(allKana, initialProgress);
  };

  const initializeVocabularyGame = (selectedListKeys) => {
    if (!selectedListKeys || selectedListKeys.length === 0) {
      return;
    }

    const words = selectedListKeys.flatMap(listKey =>
      vocabularyLists[listKey]?.words || []
    );

    if (words.length === 0) {
      return;
    }

    setCurrentVocabularyWords(words);
    setGameMode(GAME_MODES.VOCABULARY);
    setGameState(GAME_STATES.PLAYING);
    setUserInput('');
    setStartTime(Date.now());
    setFeedback(null);

    const { initialProgress, initialStats } = initializeVocabularyData(words, vocabularyMode);
    setProgress(initialProgress);
    setSessionStats(initialStats);

    selectNextVocabularyWord(words, initialProgress);
  };

  const selectNextKana = (allKana, currentProgress) => {
    const availableKana = allKana.filter(kana => !currentProgress[kana.char].mastered);

    if (availableKana.length === 0) {
      finishSession();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableKana.length);
    const nextKana = availableKana[randomIndex];
    const newItem = {
      key: nextKana.char,
      question: nextKana.char,
      answer: nextKana.reading,
    };

    setCurrentItem(newItem);
    setUserInput('');
    setFeedback(null);
    currentItemStartRef.current = Date.now();
  };

  const selectNextVocabularyWord = (allWords, currentProgress) => {
    const availableWords = allWords.filter(word => !currentProgress[word.japanese].mastered);

    if (availableWords.length === 0) {
      finishSession();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const nextWord = availableWords[randomIndex];
    const newItem = {
      key: nextWord.japanese,
      question: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.translation
        : nextWord.japanese,
      answer: vocabularyMode === VOCABULARY_MODES.TO_JAPANESE
        ? nextWord.japanese
        : nextWord.translation
    };

    setCurrentItem(newItem);
    setUserInput('');
    setFeedback(null);
    currentItemStartRef.current = Date.now();
  };

  const finishSession = () => {
    setGameState(GAME_STATES.SUMMARY);
    setCurrentItem(null);
    currentItemStartRef.current = null;

    playFeedbackSound('summary', soundMode);
    triggerConfetti();
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

    newStats[item.key] = { ...newStats[item.key] };
    if (isCorrect) {
      newStats[item.key].successes += 1;
    } else {
      newStats[item.key].failures += 1;
    }
    newStats[item.key].timeSpent = (newStats[item.key].timeSpent || 0) + timeSpent;

    return { newProgress, newStats };
  };

  const handleSubmit = () => {
    if (!currentItem || !userInput.trim()) return;

    const timeSpent = calculateTimeSpent();

    const correctAnswer = currentItem.answer;
    const isCorrect = userInput.toLowerCase().trim() === correctAnswer.toLowerCase();
    const feedbackType = isCorrect ? FEEDBACK_TYPES.SUCCESS : FEEDBACK_TYPES.ERROR;
    const isVocabularyMode = gameMode === GAME_MODES.VOCABULARY;

    playFeedbackSound(feedbackType, soundMode);

    if (soundMode === SOUND_MODES.BOTH || soundMode === SOUND_MODES.SPEECH_ONLY) {
      setTimeout(
        () => speakKanaReading(
          (isVocabularyMode && vocabularyMode === VOCABULARY_MODES.TO_JAPANESE) ? currentItem.answer : currentItem.question,
          isVocabularyMode ? 1 : 0.5,
        ),
        (isCorrect && !isVocabularyMode) ? 200 : 400
      );
    }

    setFeedback({
      type: feedbackType,
      correctAnswer: correctAnswer,
      userAnswer: userInput.trim()
    });

    const { newProgress, newStats } = updateStats(currentItem, isCorrect, timeSpent);
    setProgress(newProgress);
    setSessionStats(newStats);

    currentItemStartRef.current = null;

    setTimeout(() => {
      if (isVocabularyMode) {
        selectNextVocabularyWord(currentVocabularyWords, newProgress);
      } else {
        const options = { dakutenMode, combinationsMode };
        const allKana = getAllKanaForMode(gameMode, kanaData, options);
        selectNextKana(allKana, newProgress);
      }
    }, isCorrect ? TIMING.SUCCESS_FEEDBACK_DELAY : TIMING.ERROR_FEEDBACK_DELAY);
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


  switch (gameState) {
    case GAME_STATES.MENU:
      if (appMode === APP_MODES.VOCABULARY) {
        if (vocabularyLoading) {
          return <div>Loading vocabulary...</div>;
        }
        return (
          <>
            <VocabularyMenu
              theme={theme}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              soundMode={soundMode}
              cycleSoundMode={cycleSoundMode}
              getSoundModeIcon={getSoundModeIcon}
              requiredSuccesses={requiredSuccesses}
              onRequiredSuccessesChange={handleRequiredSuccessesChange}
              selectedLists={selectedLists}
              onSelectedListsChange={setSelectedLists}
              vocabularyMode={vocabularyMode}
              onVocabularyModeChange={handleVocabularyModeChange}
              vocabularyLists={vocabularyLists}
              onSwitchToKana={switchToKana}
              onStartGame={() => initializeVocabularyGame(selectedLists)}
            />
            <KeyboardHint theme={theme} />
          </>
        );
      } else {
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
            dakutenMode={dakutenMode}
            onDakutenModeChange={handleDakutenModeChange}
            combinationsMode={combinationsMode}
            onCombinationsModeChange={handleCombinationsModeChange}
            kanaData={kanaData}
            onSwitchToVocabulary={switchToVocabulary}
            onStartGame={initializeGame}
          />
        );
      }

    case GAME_STATES.PLAYING:
      return (
        <GamePlay
          gameMode={gameMode}
          theme={theme}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          soundMode={soundMode}
          cycleSoundMode={() => cycleSoundMode(false)}
          getSoundModeIcon={getSoundModeIcon}
          currentItem={currentItem}
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
          onRestartSameMode={() => gameMode === GAME_MODES.VOCABULARY ? initializeVocabularyGame(selectedLists) : initializeGame(gameMode)}
        />
      );

    default:
      return null;
  }
}

export default App;
