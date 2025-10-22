import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicKanji } from '../hooks';
import { GameMenu, MenuControls, MultiSelection } from '.';


export const GameMenuKanji = () => {
  const { initializeKanjiGame } = useGameLogicKanji();

  const {
    kanjiLists,
    switchToKana,
    switchToVocabulary,
    openReviewKanji,
  } = useGameContext();

  const {
    selectedLists,
    setSelectedLists,
  } = useGameContextKanji();

  const {
    requiredSuccesses,
    handleRequiredSuccessesChange,
    cycleSoundMode,
    getSoundModeIcon,
    theme,
    darkMode,
    toggleDarkMode,
  } = usePreferences();


  const listOptions = Object.entries(kanjiLists).map(([key, list]) => ({
    value: key,
    label: list.name,
    count: list.kanji.length
  }));

  const totalKanji = selectedLists.reduce((sum, listKey) => {
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
    >
      <div className="space-y-4">
        <MultiSelection
          options={listOptions}
          selectedValues={selectedLists}
          onChange={setSelectedLists}
          placeholder="Select kanji lists..."
          theme={theme}
          optionLabel="list"
          subItemsLabel="kanji"
          py={3}
        />

        {selectedLists.length > 0 && (
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
              onClick={() => initializeKanjiGame(selectedLists)}
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
