import { useState } from 'react';
import { KANJI_MODES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicKanji } from '../hooks';
import {
  GameMenu,
  LoginModal,
  MenuControls,
  MultiSelection,
  SegmentedControl,
  LockedContentSection,
} from '.';


export const GameMenuKanji = () => {
  const { t } = useTranslation();
  const { initializeKanjiGame } = useGameLogicKanji();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    kanjiListsOverrides,
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
    kanjiLoopMode,
    handleKanjiLoopModeChange,
  } = usePreferences();


  const listOptions = Object.entries(kanjiLists)
    .map(([key, list]) => {
      // Use override count if available, otherwise use list count
      const overrideCount = kanjiListsOverrides[key]?.count;
      const actualCount = overrideCount !== undefined ? overrideCount : (list.count || list.kanji?.length || 0);
      const count = list.isLocked ? null : actualCount;
      const isFavoritesEmpty = key === 'favorites' && count === 0;
      return {
        value: key,
        label: list.name,
        count,
        description: list.isLocked ? undefined : list.kanji?.map(k => k.character).join(' '),
        isLocked: list.isLocked,
        disabled: isFavoritesEmpty,
        icon: key === 'favorites' ? 'bookmark' : null,
        placeholder: isFavoritesEmpty ? t('common.bookmarkKanjiPlaceholder') : null
      };
    })
    .sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' }));

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
  const hasLockedSelection = kanjiSelectedLists.some(listKey =>
    kanjiLists[listKey]?.isLocked
  );

  const modeOptions = [
    {
      value: KANJI_MODES.ALL,
      label: t('kanjiModes.all'),
      tooltip: t('tooltips.kanjiModeAll')
    },
    {
      value: KANJI_MODES.MEANINGS_ONLY,
      label: t('kanjiModes.meaningsOnly'),
      tooltip: t('tooltips.kanjiModeMeanings')
    }
  ];

  const totalKanji = kanjiSelectedLists.reduce((sum, listKey) => {
    const list = kanjiLists[listKey];
    if (!list) return sum;

    // Use override count if available, otherwise use list count
    const overrideCount = kanjiListsOverrides[listKey]?.count;
    const count = overrideCount !== undefined ? overrideCount : (list.count || list.kanji?.length || 0);

    return sum + count;
  }, 0);


  return (
    <>
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
            optionLabel={t('common.list')}
            subItemsLabel={t('common.kanji')}
            py={3}
          />

          <LockedContentSection
            selectedLists={kanjiSelectedLists}
            hasLockedSelection={hasLockedSelection}
            onStartPractice={() => initializeKanjiGame(kanjiSelectedLists)}
            onReview={() => openReviewKanji(totalKanji)}
            totalCount={totalKanji}
            countLabel={t('common.kanjiSelected')}
            reviewLabel={t('common.reviewSelectedKanji')}
            startGradient="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        {/* Advanced options */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-1`}>
          <div className={`${theme.cardBg} rounded-lg`}>
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
          showLoopMode={true}
          loopMode={kanjiLoopMode}
          onLoopModeChange={handleKanjiLoopModeChange}
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
