import { Volume2, Bookmark, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SORT_MODES, ITEM_TYPES, VOCABULARY_MODES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useDataLoader, useProgress } from '../hooks';
import { vocabularyAPI } from '../services/apiService';
import { speakReading, parseVocabularyEntry } from '../utils';
import { ReviewLayout, ScoreProgressBar } from './';
import { ReviewProgressHeader } from './ui/ReviewProgressHeader';


export const ReviewVocabulary = () => {
  const { t } = useTranslation();
  const { theme, language, showFurigana, vocabularyMode, darkMode } = usePreferences();
  const {
    vocabularyLists,
    wordsSelectedLists,
    sessionFavoritesVocabulary,
    setSessionFavoritesVocabulary,
    addVocabularyToFavorites,
    removeVocabularyFromFavorites,
    wordsCache,
    setWordsCache,
    reviewExpectedCount,
  } = useGameContextVocabulary();

  const { isAuthenticated, hasActiveSubscription, hasLifetimeAccess } = useAuth();
  const haveAccess = hasActiveSubscription || hasLifetimeAccess;
  const [rawWords, setRawWords] = useState([]);
  const [reviewVocabMode, setReviewVocabMode] = useState(vocabularyMode);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch progress data for authenticated users
  const { getProgress } = useProgress(ITEM_TYPES.VOCABULARY);

  const { loading, loadData } = useDataLoader({
    cache: wordsCache,
    setCache: setWordsCache,
    setSessionFavorites: setSessionFavoritesVocabulary,
    language,
  });

  // Load data when selection changes
  useEffect(() => {
    const loadWordsData = async () => {
      const data = await loadData({
        selectedLists: wordsSelectedLists,
        fetchFn: vocabularyAPI.getWords,
        dataKey: 'words',
      });
      setRawWords(data);
    };

    loadWordsData();
  }, [wordsSelectedLists, loadData]);

  const sortOptions = [
    { value: SORT_MODES.DEFAULT, label: 'sortModes.default' },
    { value: SORT_MODES.ALPHABETICAL, label: 'sortModes.alphabetical' }
  ];

  const vocabModeOptions = [
    { value: VOCABULARY_MODES.FROM_JAPANESE, label: 'vocabularyModesLong.fromJapanese' },
    { value: VOCABULARY_MODES.TO_JAPANESE, label: 'vocabularyModesLong.toJapanese' },
    { value: VOCABULARY_MODES.SOUND_ONLY, label: 'vocabularyModesLong.soundOnly' },
  ];

  // Render mode selector for premium users
  const renderControls = () => {
    if (!haveAccess) return null;

    return (
      <div className="relative">
        <select
          value={reviewVocabMode}
          onChange={(e) => setReviewVocabMode(e.target.value)}
          className={`appearance-none ${theme.sectionBg} ${theme.border} ${theme.text} rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
        >
          {vocabModeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
        <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
      </div>
    );
  };

  const isMergedSort = (sortBy) => sortBy === SORT_MODES.ALPHABETICAL;

  const handleToggleFavorite = (wordId) => {
    if (!wordId) return;

    if (sessionFavoritesVocabulary.has(wordId)) {
      removeVocabularyFromFavorites(wordId);
    } else {
      addVocabularyToFavorites(wordId);
    }
  };

  const getAllWords = (sortBy) => {
    if (loading || rawWords.length === 0) return [];

    // Merged view: alphabetical sort without duplicates
    if (sortBy === SORT_MODES.ALPHABETICAL) {
      return rawWords.map((w, idx) => ({
        original: w,
        listKey: w.isFavorite ? 'favorites' : w.listId,
        listName: w.isFavorite ? vocabularyLists['favorites']?.name : vocabularyLists[w.listId]?.name,
        originalIndex: idx,
        parsed: parseVocabularyEntry(w, language)
      })).sort((a, b) =>
        a.parsed.cleanedJp.localeCompare(b.parsed.cleanedJp, 'ja')
      );
    }

    // Grouped view: duplicate favorites to show them in both sections
    // Sort by ID (ascending) for stable ordering
    const seenListKeys = new Set();
    const orderedListKeys = [];

    // Extract unique list keys from rawWords
    rawWords.forEach(w => {
      const listId = w.listId;
      if (!seenListKeys.has(listId) && wordsSelectedLists.includes(listId)) {
        seenListKeys.add(listId);
        orderedListKeys.push(listId);
      }
    });

    // Sort by ID (ascending)
    orderedListKeys.sort();

    // Add favorites at the beginning if selected and has items
    const hasFavorites = wordsSelectedLists.includes('favorites') && rawWords.some(w => w.isFavorite);
    if (hasFavorites) {
      orderedListKeys.unshift('favorites');
    }

    return orderedListKeys.flatMap(listKey => {
      const wordsForList = (listKey === 'favorites'
        ? rawWords.filter(w => w.isFavorite)
        : rawWords.filter(w => w.listId === listKey)
      ).sort((a, b) => {
        // Sort by ID (ascending)
        if (typeof a.id === 'number' && typeof b.id === 'number') {
          return a.id - b.id;
        }
        return String(a.id).localeCompare(String(b.id));
      });

      return wordsForList.map((w, idx) => ({
        original: w,
        listKey,
        listName: vocabularyLists[listKey]?.name || listKey,
        originalIndex: idx,
        parsed: parseVocabularyEntry(w, language)
      }));
    });
  };

  const renderWordRow = (wordData) => {
    const { parsed } = wordData;
    const progress = haveAccess ? getProgress(wordData.original.id, reviewVocabMode) : { score: 0 };

    return (
      <tr key={`${wordData.listKey}-${wordData.originalIndex}`} className={`${theme.border} border-b ${theme.selectorHover} transition-colors`}>
        <td className="p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => speakReading(parsed.speechText, 1)}
              className={`${theme.textMuted} hover:${theme.text} transition-colors flex-shrink-0 cursor-pointer`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <span className={`${theme.text} text-lg`}>
              {parsed.parts.map((part, idx) => {
                if (part.type === 'kanji') {
                  return (
                    <span
                      key={idx}
                      className={showFurigana ? "underline decoration-dotted cursor-help" : ""}
                      title={showFurigana ? part.reading : undefined}
                    >
                      {part.text}
                    </span>
                  );
                }
                if (part.type === 'optional') {
                  return (
                    <span key={idx} className={theme.textMuted}>
                      {part.text}
                    </span>
                  );
                }
                return <span key={idx}>{part.text}</span>;
              })}
            </span>
          </div>
        </td>
        <td className={`p-4 ${theme.text}`}>{parsed.translation}</td>
        <td className={`p-4 ${theme.textMuted} text-sm`}>{parsed.infoText || ''}</td>
        {haveAccess && (
          <td className="p-4">
            <div className="flex items-center justify-center">
              <ScoreProgressBar score={progress.score} theme={theme} />
            </div>
          </td>
        )}
        {isAuthenticated && (
          <td className="p-4 text-center">
            <button
              onClick={() => handleToggleFavorite(wordData.original.id)}
              className={`${theme.textMuted} hover:${theme.text} transition-colors cursor-pointer`}
              title={sessionFavoritesVocabulary.has(wordData.original.id) ? t('tooltips.removeFromFavorites') : t('tooltips.addToFavorites')}
            >
              <Bookmark
                className={`w-5 h-5 ${sessionFavoritesVocabulary.has(wordData.original.id) ? theme.bookmarkColor : ''}`}
                fill={sessionFavoritesVocabulary.has(wordData.original.id) ? "currentColor" : "none"}
              />
            </button>
          </td>
        )}
      </tr>
    );
  };

  const renderGlobalProgressHeader = () => {
    // Calculate global progress for premium users
    const allItems = getAllWords(SORT_MODES.DEFAULT);
    const totalWords = allItems.length;
    const masteredWords = allItems.filter(wordData => {
      const progress = getProgress(wordData.original.id, reviewVocabMode);
      return progress.score === 5;
    }).length;

    const progressPercentage = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;

    // Get full mode label for display
    const modeLabelLong = reviewVocabMode === VOCABULARY_MODES.TO_JAPANESE
      ? t('vocabularyModesLong.toJapanese')
      : reviewVocabMode === VOCABULARY_MODES.SOUND_ONLY
        ? t('vocabularyModesLong.soundOnly')
        : t('vocabularyModesLong.fromJapanese');

    return (
      <ReviewProgressHeader
        theme={theme}
        darkMode={darkMode}
        progressPercentage={progressPercentage}
        onModalOpenChange={setIsModalOpen}
      >
        <span>{masteredWords} {t('common.words')} / {totalWords} {t('review.mastered')}</span>
        <span className={theme.textMuted}>|</span>
        <span className={theme.textSecondary}>{modeLabelLong}</span>
      </ReviewProgressHeader>
    );
  };

  const renderTable = (words, listName, key) => (
    <div key={key}>
      {listName && (
        <h3 className={`text-sm font-medium ${theme.textMuted} mb-3 uppercase tracking-wide`}>
          {listName}
        </h3>
      )}

      <table className="w-full">
        <thead>
          <tr className={`${theme.border} border-b-2`}>
            <th className={`text-left p-4 ${theme.text} font-semibold`}>{t('titles.japanese')}</th>
            <th className={`text-left p-4 ${theme.text} font-semibold`}>{t('titles.translation')}</th>
            <th className={`text-left p-4 ${theme.text} font-semibold`}>{t('titles.notes')}</th>
            {haveAccess && (
              <th className={`text-center p-4 ${theme.text} font-semibold`}>{t('titles.progression')}</th>
            )}
            {isAuthenticated && (<th></th>)}
          </tr>
        </thead>
        <tbody>
          {words.map(renderWordRow)}
        </tbody>
      </table>
    </div>
  );

  return (
    <ReviewLayout
      sortOptions={sortOptions}
      getAllItems={getAllWords}
      renderTable={renderTable}
      isMergedSort={isMergedSort}
      loading={loading}
      expectedCount={reviewExpectedCount}
      renderControls={renderControls}
      renderGlobalProgress={renderGlobalProgressHeader}
      isModalOpen={isModalOpen}
    />
  );
};
