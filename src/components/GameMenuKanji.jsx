import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicKanji } from '../hooks';
import { KANJI_MODES } from '../constants';
import { GameMenu, MenuControls, MultiSelection, SegmentedControl } from '.';


export const GameMenuKanji = () => {
  const { initializeKanjiGame } = useGameLogicKanji();

  const {
    appMode,
    setAppMode,
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


  const listOptions = Object.entries(kanjiLists).map(([key, list]) => ({
    value: key,
    label: list.name,
    count: list.kanji.length
  }));

  const modeOptions = [
    {
      value: KANJI_MODES.ALL,
      label: 'All',
      tooltip: 'Find readings & meanings'
    },
    {
      value: KANJI_MODES.MEANINGS_ONLY,
      label: 'Meanings',
      tooltip: 'Find meanings only, for each given reading group'
    }
  ];

  const totalKanji = kanjiSelectedLists.reduce((sum, listKey) => {
    return sum + (kanjiLists[listKey]?.kanji.length || 0);
  }, 0);


  return (
    <GameMenu
      theme={theme}
      title="漢字学習"
      subtitle="Kanji Learning"
      onPrevious={switchToKana}
      previousTooltip="Switch to Kana Learning"
      onNext={switchToVocabulary}
      nextTooltip="Switch to Vocabulary Learning"
      currentMode={appMode}
      onModeChange={setAppMode}
    >
      <div className="space-y-4">
        <MultiSelection
          options={listOptions}
          selectedValues={kanjiSelectedLists}
          onChange={setKanjiSelectedLists}
          placeholder="Select kanji lists..."
          theme={theme}
          optionLabel="list"
          subItemsLabel="kanji"
          py={3}
        />

        {kanjiSelectedLists.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => openReviewKanji()}
              className={`w-full ${theme.sectionBg} ${theme.text} font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Review selected kanji</span>
              </div>
            </button>

            <button
              onClick={() => initializeKanjiGame(kanjiSelectedLists)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col text-left mb-1">
                  <span className="text-lg">Start Learning</span>
                  <div className="text-xs opacity-80">
                    {totalKanji} kanji selected
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Advanced options */}
      <div className={`mt-8 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-1`}>
        <div className={`${theme.cardBg} rounded-lg shadow-inner`}>
          <div className={`px-4 divide-y ${theme.divider}`}>
            <SegmentedControl
              value={kanjiMode}
              onChange={handleKanjiModeChange}
              options={modeOptions}
              label="Find from Kanji"
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
