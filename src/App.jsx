import { MainMenu, GamePlay, Summary, VocabularyMenu, KeyboardHint } from './components';
import { useTheme } from './hooks';
import { useGameContext } from './contexts/GameContext';
import { useGameLogic } from './hooks/useGameLogic';
import { useVocabularyGameLogic } from './hooks/useVocabularyGameLogic';
import { useGameActions } from './hooks/useGameActions';
import { getSortedStats } from './services/statsService';
import { GAME_STATES, APP_MODES, GAME_MODES } from './constants';


function App() {
  const { theme } = useTheme();
  const {
    gameState,
    appMode,
    gameMode,
    vocabularyLoading,
    selectedLists,
    sessionStats,
    sortBy,
    currentVocabularyWords,
  } = useGameContext();

  const { initializeGame } = useGameLogic();
  const { initializeVocabularyGame } = useVocabularyGameLogic();
  const { resetGame } = useGameActions();


  switch (gameState) {
    case GAME_STATES.MENU:
      if (appMode === APP_MODES.VOCABULARY) {
        if (vocabularyLoading) {
          return (
            <div>Loading vocabulary...</div>
          );
        }
        return (
          <>
            <VocabularyMenu />
            <KeyboardHint theme={theme} />
          </>
        );
      } else {
        return <MainMenu />;
      }

    case GAME_STATES.PLAYING:
      return <GamePlay />;

    case GAME_STATES.SUMMARY:
      return (
        <Summary
          onNewSession={resetGame}
          onRestartSameMode={() =>
            gameMode === GAME_MODES.VOCABULARY
              ? initializeVocabularyGame(selectedLists)
              : initializeGame(gameMode)
          }
          sortedStats={getSortedStats(sessionStats, sortBy, currentVocabularyWords)}
        />
      );

    default:
      return null;
  }
}

export default App;
