import { Volume2, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SORT_MODES, ITEM_TYPES, KANJI_PROGRESS_TYPES, KANJI_STEPS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useDataLoader, useProgress } from '../hooks';
import { kanjiAPI } from '../services/apiService';
import { formatKanjiForReview, speakReading } from '../utils';
import { ReviewLayout, ScoreProgressBar } from './';
import { ReviewProgressHeader } from './ui/ReviewProgressHeader';


export const ReviewKanji = () => {
  const { t } = useTranslation();
  const { theme, language, darkMode } = usePreferences();
  const { reviewExpectedCountKanji } = useGameContext();
  const {
    kanjiLists,
    kanjiSelectedLists,
    sessionFavoritesKanji,
    setSessionFavoritesKanji,
    addKanjiToFavorites,
    removeKanjiFromFavorites,
    kanjiCache,
    setKanjiCache,
  } = useGameContextKanji();

  const { isAuthenticated, hasActiveSubscription, hasLifetimeAccess } = useAuth();
  const haveAccess = hasActiveSubscription || hasLifetimeAccess;
  const [rawKanji, setRawKanji] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch progress data for authenticated users
  const { getProgress } = useProgress(ITEM_TYPES.KANJI);

  const { loading, loadData } = useDataLoader({
    cache: kanjiCache,
    setCache: setKanjiCache,
    setSessionFavorites: setSessionFavoritesKanji,
    language,
  });

  // Load data when selection changes
  useEffect(() => {
    const loadKanjiData = async () => {
      const data = await loadData({
        selectedLists: kanjiSelectedLists,
        fetchFn: kanjiAPI.getKanji,
        dataKey: 'kanji',
      });
      setRawKanji(data);
    };

    loadKanjiData();
  }, [kanjiSelectedLists, loadData]);

  const sortOptions = [
    { value: SORT_MODES.DEFAULT, label: 'sortModes.default' },
    { value: SORT_MODES.ALPHABETICAL, label: 'sortModes.alphabetical' },
    { value: SORT_MODES.STROKES, label: 'sortModes.strokes' }
  ];

  const isMergedSort = (sortBy) =>
    sortBy === SORT_MODES.ALPHABETICAL || sortBy === SORT_MODES.STROKES;

  const handleToggleFavorite = (kanjiId) => {
    if (!kanjiId) return;

    if (sessionFavoritesKanji.has(kanjiId)) {
      removeKanjiFromFavorites(kanjiId);
    } else {
      addKanjiToFavorites(kanjiId);
    }
  };

  const getAllKanji = (sortBy) => {
    if (loading || rawKanji.length === 0) return [];

    // Merged views: sort without duplicates
    if (sortBy === SORT_MODES.ALPHABETICAL || sortBy === SORT_MODES.STROKES) {
      const kanjiData = rawKanji.map(k => ({
        ...formatKanjiForReview(k),
        listKey: k.isFavorite ? 'favorites' : k.listId,
        listName: k.isFavorite ? kanjiLists['favorites']?.name : kanjiLists[k.listId]?.name
      }));

      if (sortBy === SORT_MODES.ALPHABETICAL) {
        return kanjiData.sort((a, b) =>
          a.character.localeCompare(b.character, 'ja')
        );
      }

      if (sortBy === SORT_MODES.STROKES) {
        return kanjiData.sort((a, b) => {
          if (a.strokes !== b.strokes) {
            return (a.strokes || 999) - (b.strokes || 999);
          }
          return a.character.localeCompare(b.character, 'ja');
        });
      }
    }

    // Grouped view: duplicate favorites to show them in both sections
    // Sort by ID (ascending) for stable ordering
    const seenListKeys = new Set();
    const orderedListKeys = [];

    // Extract unique list keys from rawKanji
    rawKanji.forEach(k => {
      const listId = k.listId;
      if (!seenListKeys.has(listId) && kanjiSelectedLists.includes(listId)) {
        seenListKeys.add(listId);
        orderedListKeys.push(listId);
      }
    });

    // Sort by ID (ascending)
    orderedListKeys.sort();

    // Add favorites at the beginning if selected and has items
    const hasFavorites = kanjiSelectedLists.includes('favorites') && rawKanji.some(k => k.isFavorite);
    if (hasFavorites) {
      orderedListKeys.unshift('favorites');
    }

    return orderedListKeys.flatMap(listKey => {
      const kanjiForList = (listKey === 'favorites'
        ? rawKanji.filter(k => k.isFavorite)
        : rawKanji.filter(k => k.listId === listKey)
      ).sort((a, b) => {
        // Sort by ID (ascending)
        if (typeof a.id === 'number' && typeof b.id === 'number') {
          return a.id - b.id;
        }
        return String(a.id).localeCompare(String(b.id));
      });

      return kanjiForList.map(k => ({
        ...formatKanjiForReview(k),
        listKey,
        listName: kanjiLists[listKey]?.name || listKey
      }));
    });
  };

  const handlePlayAudio = (kanji) => {
    const allReadings = [
      ...kanji.kun.split(', ').filter(r => r),
      ...kanji.on.split(', ').filter(r => r)
    ];

    if (allReadings.length > 0) {
      speakReading(allReadings.join(','), 0.85);
    }
  };

  const renderGlobalProgressHeader = () => {
    // Calculate global progress for premium users
    const allItems = getAllKanji(SORT_MODES.DEFAULT);
    const totalKanji = allItems.length;

    let masteredKanji = 0;
    let totalKunMastered = 0;
    let totalOnMastered = 0;
    let totalMeaningsMastered = 0;

    allItems.forEach(kanji => {
      const kunProgress = getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.KUN_READINGS]);
      const onProgress = getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.ON_READINGS]);
      const meaningsProgress = getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.MEANINGS]);

      if (kunProgress.score === 5) totalKunMastered++;
      if (onProgress.score === 5) totalOnMastered++;
      if (meaningsProgress.score === 5) totalMeaningsMastered++;

      // A kanji is considered mastered if all reading types are at 5/5
      if (kunProgress.score === 5 && onProgress.score === 5 && meaningsProgress.score === 5) {
        masteredKanji++;
      }
    });

    const progressPercentage = totalKanji > 0 ? (masteredKanji / totalKanji) * 100 : 0;

    return (
      <ReviewProgressHeader
        theme={theme}
        darkMode={darkMode}
        progressPercentage={progressPercentage}
        onModalOpenChange={setIsModalOpen}
      >
        <span>{masteredKanji} {t('common.kanji')} / {totalKanji} {t('review.mastered')}</span>
        <span className={theme.textMuted}>|</span>
        <span className={theme.textSecondary}>{totalKunMastered} {t('review.kunReadings')}</span>
        <span className={theme.textMuted}>|</span>
        <span className={theme.textSecondary}>{totalOnMastered} {t('review.onReadings')}</span>
        <span className={theme.textMuted}>|</span>
        <span className={theme.textSecondary}>{totalMeaningsMastered} {t('review.meanings')}</span>
      </ReviewProgressHeader>
    );
  };

  const renderTable = (kanjiList, listName, key) => (
    <div key={key} className="mb-12">
      {listName && (
        <h3 className={`text-xl font-semibold ${theme.text} mb-4`}>{listName}</h3>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${theme.border} border-b-2`}>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold`}>{t('titles.kanji')}</th>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold min-w-12`}>{t('titles.kun')}</th>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold min-w-12`}>{t('titles.on')}</th>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold`}>{t('titles.meanings')}</th>
              <th className={`px-4 py-3 ${theme.text} font-semibold w-12`}></th>
              {isAuthenticated && (<th></th>)}
            </tr>
          </thead>
          <tbody>
            {kanjiList.map((kanji, idx) => {
              const kunProgress = haveAccess ? getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.KUN_READINGS]) : { score: 0 };
              const onProgress = haveAccess ? getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.ON_READINGS]) : { score: 0 };
              const meaningsProgress = haveAccess ? getProgress(kanji.id, KANJI_PROGRESS_TYPES[KANJI_STEPS.MEANINGS]) : { score: 0 };

              return (
                <tr key={idx} className={`${theme.border} border-b ${theme.selectorHover} transition-colors`}>
                  <td className={`px-4 py-4 text-4xl ${theme.text}`}>
                    {kanji.character}
                  </td>
                  <td className={`px-4 py-4 ${theme.text} whitespace-pre-line`}>
                    <div>{kanji.kun.split(', ').join('\n') || '-'}</div>
                    {haveAccess && (
                      <div className="mt-2">
                        <ScoreProgressBar score={kunProgress.score} theme={theme} tooltipPrefix="Progress score - " />
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-4 ${theme.text} whitespace-pre-line`}>
                    <div>{kanji.on.split(', ').join('\n') || '-'}</div>
                    {haveAccess && (
                      <div className="mt-2">
                        <ScoreProgressBar score={onProgress.score} theme={theme} tooltipPrefix="Progress score - " />
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-4 ${theme.text}`}>
                    <div>
                      {kanji.meaningRows.map((row, rowIdx) => (
                        <div key={rowIdx} className="mb-2 last:mb-0">
                          <div className={theme.textMuted}>
                            {row.meanings}
                          </div>
                          <div className={`text-xs ${theme.textMuted} opacity-70`}>
                            {row.readings}
                          </div>
                        </div>
                      ))}
                    </div>
                    {haveAccess && (
                      <div className="mt-2">
                        <ScoreProgressBar score={meaningsProgress.score} theme={theme} tooltipPrefix="Progress score - " />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handlePlayAudio(kanji)}
                      className={`p-2 ${theme.buttonSecondary} rounded-full hover:opacity-70 transition-opacity cursor-pointer`}
                      title={t('tooltips.playAudio')}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </td>
                  {isAuthenticated && (
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleFavorite(kanji.id)}
                        className={`${theme.textMuted} hover:${theme.text} transition-colors cursor-pointer`}
                        title={sessionFavoritesKanji.has(kanji.id) ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
                      >
                        <Bookmark
                          className={`w-5 h-5 ${sessionFavoritesKanji.has(kanji.id) ? theme.bookmarkColor : ''}`}
                          fill={sessionFavoritesKanji.has(kanji.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <ReviewLayout
      sortOptions={sortOptions}
      getAllItems={getAllKanji}
      renderTable={renderTable}
      isMergedSort={isMergedSort}
      loading={loading}
      expectedCount={reviewExpectedCountKanji}
      renderGlobalProgress={renderGlobalProgressHeader}
      isModalOpen={isModalOpen}
    />
  );
};
