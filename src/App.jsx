import { useGameContext } from './contexts/GameContext';
import { usePreferences } from './contexts/PreferencesContext';
import { getSortedStats } from './services/statsService';
import { GAME_STATES, APP_MODES, GAME_MODES } from './constants';
import { useKeyboardNavigation } from './hooks';
import {
  useGameActions,
  useVocabularyGameLogic,
  useKanaGameLogic,
  useKanjiGameLogic,
} from './hooks';
import {
  KanaMenu,
  GamePlay,
  Summary,
  VocabularyMenu,
  KanjiMenu,
  KeyboardHint,
  VocabularyReview,
  KanaReview,
  KanjiReview,
} from './components';


function App() {
  const { theme } = usePreferences();
  const {
    gameState,
    appMode,
    gameMode,
    vocabularyLoading,
    kanjiLoading,
    selectedLists,
    sessionStats,
    sortBy,
    currentVocabularyWords,
  } = useGameContext();

  useKeyboardNavigation();

  const { initializeKanaGame } = useKanaGameLogic();
  const { initializeVocabularyGame } = useVocabularyGameLogic();
  const { initializeKanjiGame } = useKanjiGameLogic();
  const { resetGame } = useGameActions();


  switch (gameState) {
    case GAME_STATES.MENU:
      switch (appMode) {
        case APP_MODES.KANA:
          return <KanaMenu />;
        case APP_MODES.VOCABULARY:
          if (vocabularyLoading) {
            return <div>Loading vocabulary...</div>;
          }
          return (<>
            <VocabularyMenu />
            <KeyboardHint theme={theme} />
          </>);
        case APP_MODES.KANJI:
          if (kanjiLoading) {
            return <div>Loading kanji...</div>;
          }
          return (<>
            <KanjiMenu />
            <KeyboardHint theme={theme} />
          </>);
        default:
          return null;
      }

    case GAME_STATES.PLAYING:
      return <GamePlay />;

    case GAME_STATES.SUMMARY:
      return (
        <Summary
          onNewSession={resetGame}
          onRestartSameMode={() => {
            switch (gameMode) {
              case GAME_MODES.VOCABULARY:
                initializeVocabularyGame(selectedLists);
              case GAME_MODES.KANJI:
                initializeKanjiGame(selectedLists);
              default:
                initializeKanaGame(gameMode);
            }
          }}
          sortedStats={getSortedStats(sessionStats, sortBy, currentVocabularyWords)}
        />
      );

    case GAME_STATES.REVIEW:
      switch (appMode) {
        case APP_MODES.KANA:
          return <KanaReview />;
        case APP_MODES.VOCABULARY:
          return <VocabularyReview />;
        case APP_MODES.KANJI:
          return <KanjiReview />;
        default:
          return null;
      }

    default:
      return null;
  }
}

export default App;
