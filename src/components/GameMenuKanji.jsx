import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from '../contexts/I18nContext';
import { useGameLogicKanji } from '../hooks';
import { KANJI_MODES } from '../constants';
import { GameMenu, MenuControls, MultiSelection, SegmentedControl } from '.';


export const GameMenuKanji = () => {
  const { t } = useTranslation();
  const { initializeKanjiGame } = useGameLogicKanji();

  const {
    appMode,
    updateAppMode,
    switchToKana,
    switchToVocabulary,
    openReviewKanji,
  } = useGameContext();

  const {
    kanjiLists,
    kanjiSelectedLists,
    setKanjiSelectedLists,
  } = useGameContextKanji();

  const {
    requiredSuccesses,
    handleRequiredSuccessesChange,
    cycleSoundMode,
    getSoundModeIcon,
    theme,
    darkMode,
    toggleDarkMode,
    kanjiMode,
    handleKanjiModeChange,
  } = usePreferences();


  const listOptions = Object.entries(kanjiLists)
    .map(([key, list]) => ({
      value: key,
      label: list.name,
      count: list.kanji.length,
      description: list.kanji.map(k => k.character).join(' ')
    }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const modeOptions = [
    {
      value: KANJI_MODES.ALL,
      label: t('kanjiModes.all'),
      tooltip: t('kanjiModes.all')
    },
    {
      value: KANJI_MODES.MEANINGS_ONLY,
      label: t('kanjiModes.meaningsOnly'),
      tooltip: t('kanjiModes.meaningsOnly')
    }
  ];

  const totalKanji = kanjiSelectedLists.reduce((sum, listKey) => {
    return sum + (kanjiLists[listKey]?.kanji.length || 0);
  }, 0);


  return (
    <GameMenu
      theme={theme}
      title="漢字学習"
      subtitle={t('menu.kanjiLearning')}
      onPrevious={switchToKana}
      previousTooltip={t('menu.switchToKana')}
      onNext={switchToVocabulary}
      nextTooltip={t('menu.switchToVocabulary')}
      currentMode={appMode}
      onModeChange={updateAppMode}
    >
      <div className="space-y-4">
        <MultiSelection
          options={listOptions}
          selectedValues={kanjiSelectedLists}
          onChange={setKanjiSelectedLists}
          theme={theme}
          optionLabel={t('common.list')}
          subItemsLabel={t('common.kanji')}
          py={3}
        />

        <div className="space-y-4">
          <button
            onClick={() => kanjiSelectedLists.length > 0 && openReviewKanji()}
            disabled={kanjiSelectedLists.length === 0}
            className={`w-full ${theme.sectionBg} ${theme.text} font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
              kanjiSelectedLists.length > 0
                ? 'transform hover:scale-105 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{t('common.reviewSelectedKanji')}</span>
            </div>
          </button>

          <button
            onClick={() => kanjiSelectedLists.length > 0 && initializeKanjiGame(kanjiSelectedLists)}
            disabled={kanjiSelectedLists.length === 0}
            className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
              kanjiSelectedLists.length > 0
                ? 'hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col text-left mb-1">
                <span className="text-lg">{t('common.startPractice')}</span>
                <div className="text-xs opacity-80">
                  {totalKanji} {t('common.kanjiSelected')}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Advanced options */}
      <div className={`mt-8 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-1`}>
        <div className={`${theme.cardBg} rounded-lg shadow-inner`}>
          <div className={`px-4 divide-y ${theme.divider}`}>
            <SegmentedControl
              value={kanjiMode}
              onChange={handleKanjiModeChange}
              options={modeOptions}
              label={t('menu.kanjiMode')}
              theme={{ ...theme, darkMode }}
            />
          </div>
        </div>
      </div>

      <MenuControls
        theme={theme}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        cycleSoundMode={cycleSoundMode}
        getSoundModeIcon={getSoundModeIcon}
        requiredSuccesses={requiredSuccesses}
        onRequiredSuccessesChange={handleRequiredSuccessesChange}
      />
    </GameMenu>
  );
};
