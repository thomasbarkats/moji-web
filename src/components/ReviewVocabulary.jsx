import { Volume2 } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameContext } from '../contexts/GameContext';
import { useTranslation } from '../contexts/I18nContext';
import { speakReading, parseVocabularyEntry } from '../utils';
import { SORT_MODES } from '../constants';
import { ReviewLayout } from './';


export const ReviewVocabulary = () => {
  const { t } = useTranslation();
  const { theme } = usePreferences();
  const { vocabularyLists, wordsSelectedLists } = useGameContext();


  const sortOptions = [
    { value: SORT_MODES.DEFAULT, label: 'sortModes.default' },
    { value: SORT_MODES.ALPHABETICAL, label: 'sortModes.alphabetical' }
  ];

  const isMergedSort = (sortBy) => sortBy === SORT_MODES.ALPHABETICAL;

  const getAllWords = (sortBy) => {
    // Collect all words from all selected lists
    const allWords = wordsSelectedLists.flatMap(listKey => {
      const list = vocabularyLists[listKey];
      if (!list) return [];

      return list.words.map((w, idx) => ({
        original: w,
        listKey,
        listName: list.name,
        originalIndex: idx,
        parsed: parseVocabularyEntry(w)
      }));
    });

    // Apply sorting
    if (sortBy === SORT_MODES.ALPHABETICAL) {
      return allWords.sort((a, b) =>
        a.parsed.cleanedJp.localeCompare(b.parsed.cleanedJp, 'ja')
      );
    }

    // Default: keep original order (grouped by list)
    return allWords;
  };

  const renderWordRow = (wordData) => {
    const { parsed } = wordData;

    return (
      <tr key={`${wordData.listKey}-${wordData.originalIndex}`} className={`${theme.border} border-b hover:${theme.hoverBg} transition-colors`}>
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
                      className="underline decoration-dotted cursor-help"
                      title={part.reading}
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
    />
  );
};
