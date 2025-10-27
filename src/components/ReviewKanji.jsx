import { Volume2 } from 'lucide-react';
import { SORT_MODES } from '../constants';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { useTranslation } from '../contexts/I18nContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { formatKanjiForReview, speakReading } from '../utils';
import { ReviewLayout } from './';


export const ReviewKanji = () => {
  const { t } = useTranslation();
  const { theme } = usePreferences();
  const { kanjiLists, kanjiSelectedLists } = useGameContextKanji();


  const sortOptions = [
    { value: SORT_MODES.DEFAULT, label: 'sortModes.default' },
    { value: SORT_MODES.ALPHABETICAL, label: 'sortModes.alphabetical' },
    { value: SORT_MODES.STROKES, label: 'sortModes.strokes' }
  ];

  const isMergedSort = (sortBy) =>
    sortBy === SORT_MODES.ALPHABETICAL || sortBy === SORT_MODES.STROKES;

  const getAllKanji = (sortBy) => {
    // Collect all kanji from all selected lists with their list info
    const allKanji = kanjiSelectedLists.flatMap(listKey => {
      const list = kanjiLists[listKey];
      if (!list) return [];

      return list.kanji.map(k => ({
        ...formatKanjiForReview(k),
        listKey,
        listName: list.name
      }));
    });

    // Apply sorting
    if (sortBy === SORT_MODES.ALPHABETICAL) {
      return allKanji.sort((a, b) =>
        a.character.localeCompare(b.character, 'ja')
      );
    }

    if (sortBy === SORT_MODES.STROKES) {
      return allKanji.sort((a, b) => {
        // Sort by strokes first, then alphabetically if strokes are equal
        if (a.strokes !== b.strokes) {
          return (a.strokes || 999) - (b.strokes || 999);
        }
        return a.character.localeCompare(b.character, 'ja');
      });
    }

    // Default: keep original order (grouped by list)
    return allKanji;
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
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold`}>{t('titles.kun')}</th>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold`}>{t('titles.on')}</th>
              <th className={`px-4 py-3 text-left ${theme.text} font-semibold`}>{t('titles.meanings')}</th>
              <th className={`px-4 py-3 ${theme.text} font-semibold w-12`}></th>
            </tr>
          </thead>
          <tbody>
            {kanjiList.map((kanji, idx) => (
              <tr key={idx} className={`${theme.border} border-b hover:${theme.hoverBg} transition-colors`}>
                <td className={`px-4 py-4 text-4xl ${theme.text}`}>
                  {kanji.character}
                </td>
                <td className={`px-4 py-4 ${theme.text} whitespace-pre-line`}>
                  {kanji.kun.split(', ').join('\n') || '-'}
                </td>
                <td className={`px-4 py-4 ${theme.text} whitespace-pre-line`}>
                  {kanji.on.split(', ').join('\n') || '-'}
                </td>
                <td className={`px-4 py-4 ${theme.text}`}>
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
              </tr>
            ))}
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
    />
  );
};
