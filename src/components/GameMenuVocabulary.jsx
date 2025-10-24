import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from '../contexts/I18nContext';
import { useGameLogicVocabulary } from '../hooks';
import { VOCABULARY_MODES } from '../constants';
import { GameMenu, MenuControls, MultiSelection, SegmentedControl } from '.';


export const GameMenuVocabulary = () => {
  const { t } = useTranslation();
  const { initializeVocabularyGame } = useGameLogicVocabulary();

  const {
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
      label: t('vocabularyModes.toJapanese'),
      tooltip: t('tooltips.typeJapanese')
    },
    {
      value: VOCABULARY_MODES.FROM_JAPANESE,
      label: t('vocabularyModes.fromJapanese'),
      tooltip: t('tooltips.typeTranslation')
    }
  ];

  const totalWords = wordsSelectedLists.reduce((sum, listKey) => {
    return sum + (vocabularyLists[listKey]?.words.length || 0);
  }, 0);

  return (
    <GameMenu
      theme={theme}
      title="語彙学習"
      subtitle={t('menu.vocabularyLearning')}
      onPrevious={switchToKanji}
      previousTooltip={t('modes.kanji')}
    >
      <div className="space-y-4">
        <MultiSelection
          options={listOptions}
          selectedValues={wordsSelectedLists}
          onChange={setWordsSelectedLists}
          theme={theme}
          optionLabel={t('common.list')}
          subItemsLabel={t('common.words')}
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
                <span className="text-sm">{t('common.reviewSelectedWords')}</span>
              </div>
            </button>

            <button
              onClick={() => initializeVocabularyGame(wordsSelectedLists)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-center">
                <div className="flex flex-col text-left mb-1">
                  <span className="text-lg">{t('common.startPractice')}</span>
                  <div className="text-xs opacity-80">
                    {totalWords} {t('common.wordsSelected')}
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
              label={t('menu.vocabularyMode')}
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
