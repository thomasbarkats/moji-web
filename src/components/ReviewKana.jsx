import { Volume2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GAME_STATES, KANA_TYPES, ITEM_TYPES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useProgress } from '../hooks';
import { speakReading, organizeKanaByRows, initFilterSelection } from '../utils';
import { MultiSelection } from '.';
import { ReviewProgressHeader } from './ui/ReviewProgressHeader';

// Get background color based on score (transparent versions of progress bar colors)
const getScoreBackgroundColor = (score) => {
  if (score === 0) return 'transparent';
  if (score === 1) return 'rgba(249, 115, 22, 0.15)'; // orange-500
  if (score === 2) return 'rgba(234, 179, 8, 0.15)';  // yellow-500
  if (score === 3) return 'rgba(163, 230, 53, 0.15)'; // lime-400
  if (score === 4) return 'rgba(132, 204, 22, 0.15)'; // lime-500
  return 'rgba(34, 197, 94, 0.15)'; // green-500
};


export const ReviewKana = () => {
  const { t } = useTranslation();
  const { kanaData, setGameState } = useGameContext();
  const { dakutenMode, combinationsMode, theme, darkMode } = usePreferences();
  const { getProgress } = useProgress(ITEM_TYPES.KANA);
  const [selectedOptions, setSelectedOptions] = useState(initFilterSelection(dakutenMode, combinationsMode));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isModalOpen) {
        setGameState(GAME_STATES.MENU);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGameState, isModalOpen]);

  const filterOptions = [
    { value: KANA_TYPES.DAKUTEN, label: `${t('menu.include')} ${t('menu.dakutenMode')}`, count: null },
    { value: KANA_TYPES.COMBINATION, label: `${t('menu.include')} ${t('menu.combinationsMode')}`, count: null }
  ];

  const getFilteredKana = (base, dakuten, combinations) => {
    const includeCombinations = selectedOptions.includes(KANA_TYPES.COMBINATION);
    const includeDakuten = selectedOptions.includes(KANA_TYPES.DAKUTEN);

    return {
      base: base,
      dakuten: includeDakuten ? dakuten : [],
      combinations: includeCombinations ? combinations : []
    };
  };

  const renderKanaGrid = (type) => {
    const isHiragana = type === 'hiragana';
    const baseKey = isHiragana ? 'hiragana' : 'katakana';
    const dakutenKey = isHiragana ? 'hiraganaDakuten' : 'katakanaDakuten';
    const combinationKey = isHiragana ? 'hiraganaCombinations' : 'katakanaCombinations';

    const rawBase = kanaData[baseKey] || [];
    const rawDakuten = kanaData[dakutenKey] || [];
    const rawCombinations = kanaData[combinationKey] || [];

    const { base, dakuten, combinations } = getFilteredKana(rawBase, rawDakuten, rawCombinations);

    const rows = organizeKanaByRows(base, dakuten, combinations);

    return (
      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-5 gap-2"
          >
            {row.cells.map((kana, cellIdx) => {
              const progress = kana ? getProgress(kana.id, 'kana') : { score: 0 };
              const bgColor = getScoreBackgroundColor(progress.score);
              return (
                <div
                  key={cellIdx}
                  className={`
                    group rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]
                    ${kana ? 'cursor-pointer hover:scale-105 transition-transform' : 'invisible'}
                  `}
                  style={{ backgroundColor: bgColor }}
                  onClick={() => kana && speakReading(kana.char, 0.5)}
                >
                  {kana && (
                    <>
                      <span className={`text-4xl ${theme.text} mb-2`}>{kana.char}</span>
                      <span className={`text-sm ${theme.textMuted}`}>{kana.reading}</span>
                      <Volume2 className={`w-4 h-4 ${theme.textMuted} mt-2 opacity-50`} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderGlobalProgressHeader = () => {
    // Calculate global progress (free for kana)
    const includeCombinations = selectedOptions.includes(KANA_TYPES.COMBINATION);
    const includeDakuten = selectedOptions.includes(KANA_TYPES.DAKUTEN);

    // Collect all kana IDs
    const allKana = [
      ...(kanaData.hiragana || []),
      ...(kanaData.katakana || []),
      ...(includeDakuten ? (kanaData.hiraganaDakuten || []) : []),
      ...(includeDakuten ? (kanaData.katakanaDakuten || []) : []),
      ...(includeCombinations ? (kanaData.hiraganaCombinations || []) : []),
      ...(includeCombinations ? (kanaData.katakanaCombinations || []) : [])
    ];

    const totalKana = allKana.length;
    const masteredKana = allKana.filter(kana => {
      const progress = getProgress(kana.id, 'kana');
      return progress.score === 5;
    }).length;

    const progressPercentage = totalKana > 0 ? (masteredKana / totalKana) * 100 : 0;

    return (
      <ReviewProgressHeader
        theme={theme}
        darkMode={darkMode}
        progressPercentage={progressPercentage}
        haveAccess={true}
        onModalOpenChange={setIsModalOpen}
      >
        <span>{masteredKana} {t('common.kana')} / {totalKana} {t('review.mastered')}</span>
      </ReviewProgressHeader>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 flex items-center`}>
      <div className="w-full max-w-4xl mx-auto">
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setGameState(GAME_STATES.MENU)}
              className={`flex items-center gap-2 ${theme.text} hover:${theme.textSecondary} transition-colors cursor-pointer`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('common.backToMenu')}</span>
            </button>

            <div className="w-80">
              <MultiSelection
                options={filterOptions}
                selectedValues={selectedOptions}
                onChange={setSelectedOptions}
                placeholder={t('menu.filterOptions')}
                theme={theme}
                optionLabel={t('common.option')}
                subItemsLabel={t('common.kana')}
                py={2}
              />
            </div>
          </div>

          {renderGlobalProgressHeader()}

          <div className="mb-8">
            <h3 className={`text-xl font-semibold ${theme.text} mb-4`}>Hiragana</h3>
            {renderKanaGrid('hiragana')}
          </div>

          <div>
            <h3 className={`text-xl font-semibold ${theme.text} mb-4`}>Katakana</h3>
            {renderKanaGrid('katakana')}
          </div>
        </div>
      </div>
    </div>
  );
};
