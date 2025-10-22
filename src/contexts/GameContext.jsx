import { createContext, useContext, useState, useRef } from 'react';
import { useDataKana, useDataVocabulary, useDataKanji, useSound } from '../hooks';
import { GAME_STATES, APP_MODES, SORT_MODES, GAME_MODES } from '../constants';


const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const kanaData = useDataKana();
  const { vocabularyLists, loading: vocabularyLoading } = useDataVocabulary('fr');
  const { kanjiLists, loading: kanjiLoading } = useDataKanji();

  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState('');
  const [appMode, setAppMode] = useState(APP_MODES.KANA);

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
  const [selectedLists, setSelectedLists] = useState([]);
  const [currentVocabularyWords, setCurrentVocabularyWords] = useState([]);

  // Mode switching
  const switchToVocabulary = () => setAppMode(APP_MODES.VOCABULARY);
  const switchToKana = () => setAppMode(APP_MODES.KANA);
  const openReviewKana = () => setGameState(GAME_STATES.REVIEW);
  const switchToKanji = () => setAppMode(APP_MODES.KANJI);

  const openReviewVocabulary = (lists) => {
    setSelectedLists(lists);
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
    kanjiLists,
    kanjiLoading,

    // Game state
    gameState,
    setGameState,
    gameMode,
    setGameMode,
    appMode,
    setAppMode,

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
    selectedLists,
    setSelectedLists,
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
