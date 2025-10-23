import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameLogicKana } from '../hooks';
import { GAME_MODES, KANA_INCLUSION } from '../constants';
import { getAllKanaForMode } from '../utils';
import { GameMenu, MenuControls, SegmentedControl } from '.';


export const GameMenuKana = () => {
  const { initializeKanaGame } = useGameLogicKana();

  const {
    appMode,
    setAppMode,
    kanaData,
    switchToKanji,
    openReviewKana,
  } = useGameContext();

  const {
    requiredSuccesses,
    dakutenMode,
    combinationsMode,
    handleRequiredSuccessesChange,
    handleDakutenModeChange,
    handleCombinationsModeChange,
    cycleSoundMode,
    getSoundModeIcon,
    theme,
    darkMode,
    toggleDarkMode,
  } = usePreferences();

  const [dakutenOnDisabled, setDakutenOnDisabled] = useState(combinationsMode === KANA_INCLUSION.ONLY);
  const [combinationOnDisabled, setCombinationOnDisabled] = useState(dakutenMode === KANA_INCLUSION.ONLY);


  const getDakutenOptions = () => {
    return [
      { value: KANA_INCLUSION.OFF, label: 'Off', tooltip: 'No dakuten/handakuten' },
      { value: KANA_INCLUSION.ADD, label: 'On', tooltip: 'Add to selected kana', disabled: dakutenOnDisabled },
      { value: KANA_INCLUSION.ONLY, label: 'Only', tooltip: 'Dakuten/handakuten only' }
    ];
  };

  const getCombinationsOptions = () => {
    return [
      { value: KANA_INCLUSION.OFF, label: 'Off', tooltip: 'No combinations' },
      { value: KANA_INCLUSION.ADD, label: 'On', tooltip: 'Add to selected kana', disabled: combinationOnDisabled },
      { value: KANA_INCLUSION.ONLY, label: 'Only', tooltip: 'Combinations only' }
    ];
  };

  const handleLocalDakutenModeChange = (value) => {
    setCombinationOnDisabled(value === KANA_INCLUSION.ONLY);
    if (value === KANA_INCLUSION.ONLY && combinationsMode === KANA_INCLUSION.ADD) {
      handleCombinationsModeChange(KANA_INCLUSION.OFF);
    }
    handleDakutenModeChange(value);
  };

  const handleLocalCombinationsModeChange = (value) => {
    setDakutenOnDisabled(value === KANA_INCLUSION.ONLY);
    if (value === KANA_INCLUSION.ONLY && dakutenMode === KANA_INCLUSION.ADD) {
      handleDakutenModeChange(KANA_INCLUSION.OFF);
    }
    handleCombinationsModeChange(value);
  };

  const renderModeSection = (mode, icon, label, gradientClass) => {
    const kanaCount = getAllKanaForMode(mode, kanaData, { dakutenMode, combinationsMode })?.length;

    return (
      <button
        onClick={() => initializeKanaGame(mode)}
        className={`w-full ${gradientClass} text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
      >
        <div className="flex items-center justify-center">
          <span className="text-3xl mr-4 font-normal">{icon}</span>
          <div className="flex flex-col text-left mb-1">
            <span className="text-lg">{label}</span>
            <span className="text-xs opacity-80">
              {kanaCount} kana{requiredSuccesses > 1 && ` × ${requiredSuccesses}`}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <GameMenu
      theme={theme}
      title="学習カナ"
      subtitle="Kana Learning"
      onNext={switchToKanji}
      nextTooltip="Switch to Kanji Learning"
      currentMode={appMode}
      onModeChange={setAppMode}
    >
      <div className="space-y-4">
        <button
          onClick={openReviewKana}
          className={`w-full ${theme.sectionBg} ${theme.text} font-semibold py-3 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer`}
        >
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Review all Kana</span>
          </div>
        </button>

        <div className="flex gap-4">
          {renderModeSection(GAME_MODES.HIRAGANA, 'ひ', 'Hiragana', 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700')}
          {renderModeSection(GAME_MODES.KATAKANA, 'カ', 'Katakana', 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700')}
        </div>
        {renderModeSection(GAME_MODES.BOTH, 'ひカ', 'Hiragana + Katakana', 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700')}
      </div>

      {/* Advanced options */}
      <div className={`mt-8 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-1`}>
        <div className={`${theme.cardBg} rounded-lg shadow-inner`}>
          <div className={`px-4 divide-y ${theme.divider}`}>
            <SegmentedControl
              value={dakutenMode}
              onChange={handleLocalDakutenModeChange}
              options={getDakutenOptions()}
              label="Dakuten & Handakuten"
              theme={{ ...theme, darkMode }}
            />
            <SegmentedControl
              value={combinationsMode}
              onChange={handleLocalCombinationsModeChange}
              options={getCombinationsOptions()}
              label="Combinations"
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
