import { createContext, useContext, useState, useRef } from 'react';
import { useDataKana, useDataVocabulary } from '../hooks';
import { usePreferences } from './PreferencesContext';
import { GAME_STATES, APP_MODES, SORT_MODES, GAME_MODES } from '../constants';


const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const kanaData = useDataKana();
  const { language, updatePreferences, defaultAppMode } = usePreferences();
  const { vocabularyLists, loading: vocabularyLoading } = useDataVocabulary(language);

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

  // Vocabulary specific
  const [wordsSelectedLists, setWordsSelectedLists] = useState([]);
  const [currentVocabularyWords, setCurrentVocabularyWords] = useState([]);

  // Mode switching
  const updateAppMode = (appMode) => {
    setAppMode(appMode);
    updatePreferences({ defaultAppMode: appMode });
  };

  const switchToVocabulary = () => updateAppMode(APP_MODES.VOCABULARY);
  const switchToKana = () => updateAppMode(APP_MODES.KANA);
  const switchToKanji = () => updateAppMode(APP_MODES.KANJI);

  const openReviewKana = () => setGameState(GAME_STATES.REVIEW);
  const openReviewVocabulary = (lists) => {
    setWordsSelectedLists(lists);
    setGameMode(GAME_MODES.VOCABULARY);
    setGameState(GAME_STATES.REVIEW);
  };
  const openReviewKanji = () => {
    setGameMode(GAME_MODES.KANJI);
    setGameState(GAME_STATES.REVIEW);
  };

  const value = {
    // Data
    kanaData,
    vocabularyLists,
    vocabularyLoading,

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

    // Vocabulary
    wordsSelectedLists,
    setWordsSelectedLists,
    currentVocabularyWords,
    setCurrentVocabularyWords,

    // Actions
    switchToVocabulary,
    switchToKana,
    switchToKanji,
    openReviewKana,
    openReviewVocabulary,
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
