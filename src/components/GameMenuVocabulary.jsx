import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTheme, useGameLogicVocabulary } from '../hooks';
import { VOCABULARY_MODES } from '../constants';
import { GameMenu, MenuControls, MultiSelection, SegmentedControl } from '.';


export const GameMenuVocabulary = () => {
  const { initializeVocabularyGame } = useGameLogicVocabulary();

  const {
    appMode,
    setAppMode,
    vocabularyLists,
    wordsSelectedLists,
    setWordsSelectedLists,
    openReviewVocabulary,
    switchToKanji,
  } = useGameContext();

  const {
    requiredSuccesses,
    vocabularyMode,
    handleRequiredSuccessesChange,
    handleVocabularyModeChange,
    cycleSoundMode,
    getSoundModeIcon,
    theme,
    darkMode,
    toggleDarkMode,
  } = usePreferences();


  const listOptions = Object.entries(vocabularyLists).map(([key, list]) => ({
    value: key,
    label: list.name,
    count: list.words.length
  }));

  const modeOptions = [
    {
      value: VOCABULARY_MODES.TO_JAPANESE,
      label: 'FR → JP',
      tooltip: 'Type Japanese from French'
    },
    {
      value: VOCABULARY_MODES.FROM_JAPANESE,
      label: 'JP → FR',
      tooltip: 'Type French from Japanese'
    }
  ];

  const totalWords = wordsSelectedLists.reduce((sum, listKey) => {
    return sum + (vocabularyLists[listKey]?.words.length || 0);
  }, 0);

  return (
    <GameMenu
      theme={theme}
      title="語彙学習"
      subtitle="Vocabulary Learning"
      onPrevious={switchToKanji}
      previousTooltip="Switch to Kanji Learning"
      currentMode={appMode}
      onModeChange={setAppMode}
    >
      <div className="space-y-4">
        <MultiSelection
          options={listOptions}
          selectedValues={wordsSelectedLists}
          onChange={setWordsSelectedLists}
          placeholder="Select vocabulary lists..."
          theme={theme}
          optionLabel="list"
          subItemsLabel="words"
          py={3}
        />

        {wordsSelectedLists.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => openReviewVocabulary(wordsSelectedLists)}
              className={`w-full ${theme.sectionBg} ${theme.text} font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Review selected words</span>
              </div>
            </button>

            <button
              onClick={() => initializeVocabularyGame(wordsSelectedLists)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col text-left mb-1">
                  <span className="text-lg">Start Practice</span>
                  <div className="text-xs opacity-80">
                    {totalWords} words selected
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
              value={vocabularyMode}
              onChange={handleVocabularyModeChange}
              options={modeOptions}
              label="Reading and typing"
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
