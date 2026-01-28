import { HelpCircle, Keyboard } from 'lucide-react';
import { GAME_STATES, APP_MODES, GAME_MODES } from './constants';
import { useGameContext } from './contexts/GameContext';
import { useGameContextKanji } from './contexts/GameContextKanji';
import { useGameContextVocabulary } from './contexts/GameContextVocabulary';
import { useTranslation } from './contexts/I18nContext';
import { useKeyboardNavigation } from './hooks';
import { getSortedStats } from './services/statsService';
import {
  GameMenuKana,
  GamePlay,
  Summary,
  GameMenuVocabulary,
  GameMenuKanji,
  FloatingHelpButton,
  ReviewVocabulary,
  ReviewKana,
  ReviewKanji,
  ProfileButton,
  MobileWarning,
  ServerErrorModal,
  SlowLoadingOverlay,
  FloatingButtonsContainer,
  BuyMeACoffeeButton,
} from './components';
import {
  useGameActions,
  useGameLogicVocabulary,
  useGameLogicKana,
  useGameLogicKanji,
} from './hooks';


function App() {
  const { t } = useTranslation();
  const { kanjiSelectedLists, kanjiLoading } = useGameContextKanji();
  const { wordsSelectedLists, currentVocabularyWords, vocabularyLoading } = useGameContextVocabulary();
  const {
    gameState,
    appMode,
    gameMode,
    sessionStats,
    sortBy,
    kanaLoading,
  } = useGameContext();

  const isLoading = kanaLoading || vocabularyLoading || kanjiLoading;

  useKeyboardNavigation();

  const { initializeKanaGame } = useGameLogicKana();
  const { initializeVocabularyGame } = useGameLogicVocabulary();
  const { initializeKanjiGame } = useGameLogicKanji();
  const { clearGameData } = useGameActions();


  const KeyboardButton = (
    <FloatingHelpButton
      icon={Keyboard}
      tooltip={t('tooltips.jpKeyboardHelp')}
      title={t('keyboardHelp.title')}
    >
      <div>
        <h4 className="font-medium mb-1">{t('keyboardHelp.windowsTitle')}</h4>
        <ol className="text-sm list-decimal list-inside space-y-0.5">
          <li>{t('keyboardHelp.windowsStep1')}</li>
          <li>{t('keyboardHelp.windowsStep2')}</li>
          <li>{t('keyboardHelp.windowsStep3')}</li>
          <li>{t('keyboardHelp.windowsStep4')}</li>
        </ol>
      </div>

      <div>
        <h4 className="font-medium mb-1">{t('keyboardHelp.quickTipsTitle')}</h4>
        <ul className="text-sm space-y-1">
          <li>• {t('keyboardHelp.tip1')}</li>
          <li>• {t('keyboardHelp.tip2')}</li>
          <li>• {t('keyboardHelp.tip3')}</li>
          <li>• {t('keyboardHelp.tip4')}</li>
        </ul>
      </div>
    </FloatingHelpButton>
  );

  const renderContent = () => {
    switch (gameState) {
      case GAME_STATES.MENU:
        switch (appMode) {
          case APP_MODES.KANA:
            return (<>
              <GameMenuKana />
              <FloatingButtonsContainer>
                <BuyMeACoffeeButton />
                <ProfileButton showLegalButton />
              </FloatingButtonsContainer>
            </>);
          case APP_MODES.VOCABULARY:
            return (<>
              <GameMenuVocabulary />
              <FloatingButtonsContainer>
                <BuyMeACoffeeButton />
                {KeyboardButton}
                <FloatingHelpButton
                  icon={HelpCircle}
                  tooltip={t('tooltips.inputRulesHelp')}
                  title={t('inputRulesHelp.vocabularyTitle')}
                >
                  <div>
                    <h4 className="font-medium mb-2">{t('inputRulesHelp.vocabularyJapaneseTitle')}</h4>
                    <p className="text-sm">{t('inputRulesHelp.vocabularyJapaneseDesc')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t('inputRulesHelp.vocabularyTranslationsTitle')}</h4>
                    <p className="text-sm">{t('inputRulesHelp.vocabularyTranslationsDesc')}</p>
                  </div>
                </FloatingHelpButton>
                <ProfileButton />
              </FloatingButtonsContainer>
            </>);
          case APP_MODES.KANJI:
            return (<>
              <GameMenuKanji />
              <FloatingButtonsContainer>
                <BuyMeACoffeeButton />
                {KeyboardButton}
                <FloatingHelpButton
                  icon={HelpCircle}
                  tooltip={t('tooltips.inputRulesHelp')}
                  title={t('inputRulesHelp.kanjiTitle')}
                >
                  <div>
                    <h4 className="font-medium mb-2">{t('inputRulesHelp.kanjiReadingsTitle')}</h4>
                    <p className="text-sm">{t('inputRulesHelp.kanjiReadingsDesc')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t('inputRulesHelp.kanjiMeaningsTitle')}</h4>
                    <p className="text-sm">{t('inputRulesHelp.kanjiMeaningsDesc')}</p>
                  </div>
                </FloatingHelpButton>
                <ProfileButton />
              </FloatingButtonsContainer>
            </>);
          default:
            return null;
        }

      case GAME_STATES.PLAYING:
        return <GamePlay />;

      case GAME_STATES.SUMMARY:
        return (
          <Summary
            onNewSession={clearGameData}
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
  };

  return (
    <>
      <MobileWarning />
      <ServerErrorModal />
      {gameState === GAME_STATES.MENU && <SlowLoadingOverlay isLoading={isLoading} />}
      {renderContent()}
    </>
  );
}

export default App;
