import { createContext, useContext, useState, useRef } from 'react';
import { GAME_STATES, APP_MODES, SORT_MODES, GAME_MODES } from '../constants';
import { useDataKana } from '../hooks';
import { usePreferences } from './PreferencesContext';


const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { kanaData, loading: kanaLoading, error: kanaError } = useDataKana();
  const { updatePreferences, defaultAppMode } = usePreferences();

  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState('');
  const [appMode, setAppMode] = useState(defaultAppMode);

  // Current item & input
  const [currentItem, setCurrentItem] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const currentItemStartRef = useRef(null);

  // Progress & stats
  const [progress, setProgress] = useState({});
  const [sessionStats, setSessionStats] = useState({});
  const [sortBy, setSortBy] = useState(SORT_MODES.FAILURES);
  const [startTime, setStartTime] = useState(null);
  const [stoppedEarly, setStoppedEarly] = useState(false);

  // Expected count for review mode skeleton loading (kanji only - vocabulary uses its own context)
  const [reviewExpectedCountKanji, setReviewExpectedCountKanji] = useState(0);

  // Mode switching
  const updateAppMode = (appMode) => {
    setAppMode(appMode);
    updatePreferences({ defaultAppMode: appMode });
  };

  const switchToVocabulary = () => updateAppMode(APP_MODES.VOCABULARY);
  const switchToKana = () => updateAppMode(APP_MODES.KANA);
  const switchToKanji = () => updateAppMode(APP_MODES.KANJI);

  const openReviewKana = () => setGameState(GAME_STATES.REVIEW);
  const openReviewKanji = (expectedCount = 0) => {
    setReviewExpectedCountKanji(expectedCount);
    setGameMode(GAME_MODES.KANJI);
    setGameState(GAME_STATES.REVIEW);
  };

  const value = {
    // Data
    kanaData,
    kanaLoading,
    kanaError,

    // Game state
    gameState,
    setGameState,
    gameMode,
    setGameMode,
    appMode,
    updateAppMode,

    // Current item
    currentItem,
    setCurrentItem,
    userInput,
    setUserInput,
    feedback,
    setFeedback,
    currentItemStartRef,

    // Progress
    progress,
    setProgress,
    sessionStats,
    setSessionStats,
    sortBy,
    setSortBy,
    startTime,
    setStartTime,
    stoppedEarly,
    setStoppedEarly,

    // Review
    reviewExpectedCountKanji,

    // Actions
    switchToVocabulary,
    switchToKana,
    switchToKanji,
    openReviewKana,
    openReviewKanji,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};
