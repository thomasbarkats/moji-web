import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useTranslation } from '../contexts/I18nContext';
import { GAME_STATES, SORT_MODES } from '../constants';


export const ReviewLayout = ({
  sortOptions,
  getAllItems,
  renderTable,
  isMergedSort
}) => {
  const { t } = useTranslation();
  const { theme } = usePreferences();
  const { setGameState } = useGameContext();

  const [sortBy, setSortBy] = useState(SORT_MODES.DEFAULT);

  const allItems = getAllItems(sortBy);
  const shouldMerge = isMergedSort(sortBy);

  return (
    <div className={`min-h-screen ${theme.bg} p-4 flex items-center`}>
      <div className="w-full max-w-5xl mx-auto">
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>

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
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <div className="space-y-8">
            {shouldMerge ? (
              // Merged view: single table with all items
              renderTable(allItems, null)
            ) : (
              // Grouped view: separate tables per list
              (() => {
                const uniqueListKeys = [...new Set(allItems.map(item => item.listKey))];
                return uniqueListKeys.map(listKey => {
                  const listItems = allItems.filter(item => item.listKey === listKey);
                  if (listItems.length === 0) return null;

                  const listName = listItems[0].listName;
                  const showTitle = uniqueListKeys.length > 1;

                  return renderTable(listItems, showTitle ? listName : null, listKey);
                });
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
