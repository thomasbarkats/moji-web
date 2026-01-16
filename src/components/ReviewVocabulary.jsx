import { useState, useEffect } from 'react';
import { Volume2, Bookmark } from 'lucide-react';
import { SORT_MODES } from '../constants';
import { useGameContextVocabulary } from '../contexts/GameContextVocabulary';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { speakReading, parseVocabularyEntry } from '../utils';
import { vocabularyAPI } from '../services/apiService';
import { ReviewLayout } from './';


export const ReviewVocabulary = () => {
  const { t } = useTranslation();
  const { theme, language, showFurigana } = usePreferences();
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

  const { isAuthenticated } = useAuth();
  const [rawWords, setRawWords] = useState([]);
  const [loading, setLoading] = useState(true);


  // Load data when selection changes
  useEffect(() => {
    const loadWordsData = async () => {
      if (wordsSelectedLists.length === 0) return;

      const cacheKey = `${[...wordsSelectedLists].sort().join(',')}_${language}`;
      const isFavoritesIncluded = wordsSelectedLists.includes('favorites');

      // Check cache first (synchronously to avoid loading flash)
      if (wordsCache[cacheKey]) {
        setRawWords(wordsCache[cacheKey]);
        if (isFavoritesIncluded) {
          const favoritesMap = new Map();
          wordsCache[cacheKey].forEach(word => {
            if (word.isFavorite) {
              favoritesMap.set(word.id, true);
            }
          });
          setSessionFavoritesVocabulary(favoritesMap);
        }
        setLoading(false);
        return;
      }

      // Data not in cache - show loading and fetch
      setRawWords([]);
      setLoading(true);

      try {
        const listData = await vocabularyAPI.getWords(wordsSelectedLists, language);
        const allWords = listData.words || [];

        // Store in cache
        setWordsCache(prev => ({ ...prev, [cacheKey]: allWords }));

        // Initialize session favorites using isFavorite field
        if (isFavoritesIncluded) {
          const favoritesMap = new Map();
          allWords.forEach(word => {
            if (word.isFavorite) {
              favoritesMap.set(word.id, true);
            }
          });
          setSessionFavoritesVocabulary(favoritesMap);
        }

        setRawWords(allWords);
      } catch (error) {
        console.error('Failed to load vocabulary lists:', error);
        setRawWords([]);
      }

      setLoading(false);
    };

    loadWordsData();
  }, [wordsSelectedLists, language]);

  const sortOptions = [
    { value: SORT_MODES.DEFAULT, label: 'sortModes.default' },
    { value: SORT_MODES.ALPHABETICAL, label: 'sortModes.alphabetical' }
  ];

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
    />
  );
};
