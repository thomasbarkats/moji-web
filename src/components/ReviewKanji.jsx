import { useState } from 'react';
import { ArrowLeft, Volume2, ChevronDown } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { useGameContextKanji } from '../contexts/GameContextKanji';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from '../contexts/I18nContext';
import { formatKanjiForReview, speakReading } from '../utils';
import { GAME_STATES, SORT_MODES } from '../constants';


export const ReviewKanji = () => {
  const { t } = useTranslation();
  const { theme } = usePreferences();
  const { setGameState } = useGameContext();
  const { kanjiLists, kanjiSelectedLists } = useGameContextKanji();

  const [sortBy, setSortBy] = useState(SORT_MODES.DEFAULT);


  const allKanji = kanjiSelectedLists.flatMap(listKey =>
    kanjiLists[listKey]?.kanji || []
  );

  const formattedKanji = allKanji.map(formatKanjiForReview);

  const sortedKanji = [...formattedKanji].sort((a, b) => {
    if (sortBy === SORT_MODES.ALPHABETICAL) {
      return a.character.localeCompare(b.character, 'ja');
    }
    return 0;
  });

  const handlePlayAudio = (kanji) => {
    const allReadings = [
      ...kanji.kun.split(', ').filter(r => r),
      ...kanji.on.split(', ').filter(r => r)
    ];

    if (allReadings.length > 0) {
      speakReading(allReadings.join(','), 0.85);
    }
  };

  const kanjiByList = kanjiSelectedLists.map(listKey => ({
    name: kanjiLists[listKey]?.name || listKey,
    kanji: sortedKanji.filter(k =>
      kanjiLists[listKey]?.kanji.some(original => original.character === k.character)
    )
  }));

  return (
    <div className={`min-h-screen ${theme.bg} p-8`}>
      <div className={`max-w-5xl mx-auto ${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setGameState(GAME_STATES.MENU)}
            className={`flex items-center gap-2 ${theme.text} hover:${theme.textSecondary} transition-colors cursor-pointer`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.backToMenu')}</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`appearance-none ${theme.sectionBg} ${theme.border} ${theme.text} rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
            >
              <option value={SORT_MODES.DEFAULT}>{t('sortModes.default')}</option>
              <option value={SORT_MODES.ALPHABETICAL}>{t('sortModes.alphabetical')}</option>
            </select>
            <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
          </div>
        </div>

        {kanjiByList.map((list, listIdx) => (
          <div key={listIdx} className="mb-12">
            {kanjiSelectedLists.length > 1 && (
              <h3 className={`text-xl font-semibold ${theme.text} mb-4`}>{list.name}</h3>
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
                  {list.kanji.map((kanji, idx) => (
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
                              ({row.readings})
                            </div>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handlePlayAudio(kanji)}
                          className={`p-2 ${theme.buttonSecondary} rounded-full hover:opacity-70 transition-opacity`}
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
        ))}
      </div>
    </div>
  );
};
