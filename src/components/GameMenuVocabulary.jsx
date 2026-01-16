import { useState } from 'react';
import { VOCABULARY_MODES, SOUND_MODES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicVocabulary } from '../hooks';
import {
  GameMenu,
  LoginModal,
  MenuControls,
  MultiSelection,
  SegmentedControl,
  LockedContentSection,
} from '.';


export const GameMenuVocabulary = () => {
  const { t } = useTranslation();
  const { initializeVocabularyGame } = useGameLogicVocabulary();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    appMode,
    updateAppMode,
    switchToKanji,
  } = useGameContext();

  const {
    vocabularyLists,
    wordsSelectedLists,
    setWordsSelectedLists,
    vocabularyListsOverrides,
    openReviewVocabulary,
  } = useGameContextVocabulary();

  const {
    requiredSuccesses,
    vocabularyMode,
    vocabularyLoopMode,
    handleRequiredSuccessesChange,
    handleVocabularyModeChange,
    handleVocabularyLoopModeChange,
    cycleSoundMode,
    getSoundModeIcon,
    soundMode,
    theme,
    darkMode,
    toggleDarkMode,
  } = usePreferences();


  const listOptions = Object.entries(vocabularyLists)
    .map(([key, list]) => {
      // Use override count if available, otherwise use list count
      const overrideCount = vocabularyListsOverrides[key]?.count;
      const actualCount = overrideCount !== undefined ? overrideCount : (list.count || list.words.length);
      const count = list.isLocked ? null : actualCount;
      const isFavoritesEmpty = key === 'favorites' && count === 0;
      return {
        value: key,
        label: list.name,
        count,
        isLocked: list.isLocked,
        disabled: isFavoritesEmpty,
        icon: key === 'favorites' ? 'bookmark' : null,
        placeholder: isFavoritesEmpty ? t('common.bookmarkWordsPlaceholder') : null
      };
    });

  // Add favorites CTA option when not authenticated
  const hasFavoritesOption = listOptions.some(opt => opt.value === 'favorites');
  if (!isAuthenticated && !hasFavoritesOption) {
    listOptions.unshift({
      value: 'favorites',
      label: t('common.favorites'),
      icon: 'bookmark',
      placeholder: t('common.signInForFavorites'),
      onClick: () => setShowLoginModal(true)
    });
  }

  // Check if any selected list is locked
  const hasLockedSelection = wordsSelectedLists.some(listKey =>
    vocabularyLists[listKey]?.isLocked
  );

  const modeOptions = [
    {
      value: VOCABULARY_MODES.TO_JAPANESE,
      label: t('vocabularyModes.toJapanese'),
      tooltip: t('tooltips.typeJapanese')
    },
    {
      value: VOCABULARY_MODES.SOUND_ONLY,
      label: t('vocabularyModes.soundOnly'),
      tooltip: t('tooltips.soundOnlyMode'),
      disabled: soundMode === SOUND_MODES.NONE
    },
    {
      value: VOCABULARY_MODES.FROM_JAPANESE,
      label: t('vocabularyModes.fromJapanese'),
      tooltip: t('tooltips.typeTranslation')
    }
  ];

  const totalWords = wordsSelectedLists.reduce((sum, listKey) => {
    const list = vocabularyLists[listKey];
    if (!list) return sum;

    // Use override count if available, otherwise use list count
    const overrideCount = vocabularyListsOverrides[listKey]?.count;
    const count = overrideCount !== undefined ? overrideCount : (list.count || list.words.length);

    return sum + count;
  }, 0);

  return (
    <>
      <GameMenu
        theme={theme}
        title="語彙学習"
        subtitle={t('menu.vocabularyLearning')}
        onPrevious={switchToKanji}
        previousTooltip={t('modes.kanji')}
        currentMode={appMode}
        onModeChange={updateAppMode}
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

          <LockedContentSection
            selectedLists={wordsSelectedLists}
            hasLockedSelection={hasLockedSelection}
            onStartPractice={() => initializeVocabularyGame(wordsSelectedLists)}
            onReview={() => openReviewVocabulary(wordsSelectedLists, totalWords)}
            totalCount={totalWords}
            countLabel={t('common.wordsSelected')}
            reviewLabel={t('common.reviewSelectedWords')}
            startGradient="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        {/* Advanced options */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-1`}>
          <div className={`${theme.cardBg} rounded-lg shadow-inner`}>
            <div className={`px-4`}>
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
          showLoopMode={true}
          loopMode={vocabularyLoopMode}
          onLoopModeChange={handleVocabularyLoopModeChange}
        />
      </GameMenu>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
        theme={theme}
        darkMode={darkMode}
      />
    </>
  );
};
