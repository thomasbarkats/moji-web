import { HelpCircle, Keyboard } from 'lucide-react';
import { GAME_STATES, APP_MODES, GAME_MODES } from './constants';
import { useGameContext } from './contexts/GameContext';
import { useGameContextVocabulary } from './contexts/GameContextVocabulary';
import { useGameContextKanji } from './contexts/GameContextKanji';
import { useTranslation } from './contexts/I18nContext';
import { usePreferences } from './contexts/PreferencesContext';
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
  SlowLoadingOverlay,
} from './components';
import {
  useGameActions,
  useGameLogicVocabulary,
  useGameLogicKana,
  useGameLogicKanji,
} from './hooks';


function App() {
  const { t } = useTranslation();
  const { theme } = usePreferences();
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
  const { resetGame } = useGameActions();


  const KeyboardButton = (
    <FloatingHelpButton
      icon={Keyboard}
      tooltip={t('tooltips.jpKeyboardHelp')}
      title={t('keyboardHelp.title')}
      theme={theme}
    >
      <div>
        <h4 className="font-medium mb-1">{t('keyboardHelp.windowsTitle')}</h4>
        <p className="text-sm" dangerouslySetInnerHTML={{
          __html:
            `1. ${t('keyboardHelp.windowsStep1')}<br/>` +
            `2. ${t('keyboardHelp.windowsStep2')}<br/>` +
            `3. ${t('keyboardHelp.windowsStep3')}<br/>` +
            `4. ${t('keyboardHelp.windowsStep4')}`
        }} />
      </div>

      <div>
        <h4 className="font-medium mb-1">{t('keyboardHelp.quickTipsTitle')}</h4>
        <ul className="text-sm space-y-1">
          <li>• {t('keyboardHelp.tip1')}</li>
          <li>• <span dangerouslySetInnerHTML={{ __html: t('keyboardHelp.tip2') }} /></li>
          <li>• <span dangerouslySetInnerHTML={{ __html: t('keyboardHelp.tip3') }} /></li>
          <li>• <span dangerouslySetInnerHTML={{ __html: t('keyboardHelp.tip4') }} /></li>
        </ul>
      </div>
    </FloatingHelpButton>
  );

  const renderContent = () => {
    switch (gameState) {
      case GAME_STATES.MENU:
        switch (appMode) {
          case APP_MODES.KANA:
            return (
              <>
                <GameMenuKana />
                <ProfileButton position="bottom-4 right-6" showLegalButton />
              </>
            );
          case APP_MODES.VOCABULARY:
            return (<>
              <GameMenuVocabulary />
              <ProfileButton position="bottom-32 right-6" />
              <FloatingHelpButton
                icon={HelpCircle}
                tooltip={t('tooltips.inputRulesHelp')}
                title={t('inputRulesHelp.vocabularyTitle')}
                theme={theme}
                position="bottom-18 right-6"
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
              ${KeyboardButton}
            </>);
          case APP_MODES.KANJI:
            return (<>
              <GameMenuKanji />
              <ProfileButton position="bottom-32 right-6" />
              <FloatingHelpButton
                icon={HelpCircle}
                tooltip={t('tooltips.inputRulesHelp')}
                title={t('inputRulesHelp.kanjiTitle')}
                theme={theme}
                position="bottom-18 right-6"
              >
                <div>
                  <h4 className="font-medium mb-2">{t('inputRulesHelp.kanjiReadingsTitle')}</h4>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: t('inputRulesHelp.kanjiReadingsDesc') }} />
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t('inputRulesHelp.kanjiMeaningsTitle')}</h4>
                  <p className="text-sm">{t('inputRulesHelp.kanjiMeaningsDesc')}</p>
                </div>
              </FloatingHelpButton>
              ${KeyboardButton}
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
  };

  return (
    <>
      <MobileWarning />
      {gameState === GAME_STATES.MENU && <SlowLoadingOverlay isLoading={isLoading} />}
      {renderContent()}
    </>
  );
}

export default App;
