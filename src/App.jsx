import { GAME_STATES, APP_MODES, GAME_MODES } from './constants';
import { useGameContext } from './contexts/GameContext';
import { useGameContextKanji } from './contexts/GameContextKanji';
import { usePreferences } from './contexts/PreferencesContext';
import { useKeyboardNavigation } from './hooks';
import { getSortedStats } from './services/statsService';
import {
  GameMenuKana,
  GamePlay,
  Summary,
  GameMenuVocabulary,
  GameMenuKanji,
  KeyboardHint,
  ReviewVocabulary,
  ReviewKana,
  ReviewKanji,
} from './components';
import {
  useGameActions,
  useGameLogicVocabulary,
  useGameLogicKana,
  useGameLogicKanji,
} from './hooks';


function App() {
  const { theme } = usePreferences();
  const { kanjiSelectedLists } = useGameContextKanji();
  const {
    gameState,
    appMode,
    gameMode,
    vocabularyLoading,
    kanjiLoading,
    wordsSelectedLists,
    sessionStats,
    sortBy,
    currentVocabularyWords,
  } = useGameContext();

  useKeyboardNavigation();

  const { initializeKanaGame } = useGameLogicKana();
  const { initializeVocabularyGame } = useGameLogicVocabulary();
  const { initializeKanjiGame } = useGameLogicKanji();
  const { resetGame } = useGameActions();


  switch (gameState) {
    case GAME_STATES.MENU:
      switch (appMode) {
        case APP_MODES.KANA:
          return <GameMenuKana />;
        case APP_MODES.VOCABULARY:
          if (vocabularyLoading) {
            return <div>Loading vocabulary...</div>;
          }
          return (<>
            <GameMenuVocabulary />
            <KeyboardHint theme={theme} />
          </>);
        case APP_MODES.KANJI:
          if (kanjiLoading) {
            return <div>Loading kanji...</div>;
          }
          return (<>
            <GameMenuKanji />
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
                initializeVocabularyGame(wordsSelectedLists);
                break;
              case GAME_MODES.KANJI:
                initializeKanjiGame(kanjiSelectedLists);
                break;
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
          return <ReviewKana />;
        case APP_MODES.VOCABULARY:
          return <ReviewVocabulary />;
        case APP_MODES.KANJI:
          return <ReviewKanji />;
        default:
          return null;
      }

    default:
      return null;
  }
}

export default App;
