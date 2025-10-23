import { Volume2, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import { useGameContext } from '../contexts/GameContext';
import { speakReading, parseVocabularyEntry } from '../utils';
import { GAME_STATES, SORT_MODES } from '../constants';


export const ReviewVocabulary = () => {
  const { theme } = usePreferences();
  const { vocabularyLists, wordsSelectedLists, setGameState } = useGameContext();
  const [sortBy, setSortBy] = useState(SORT_MODES.DEFAULT);


  const sortWords = (words, listKey) => {
    const wordsWithKey = words.map((w, idx) => ({
      original: w,
      listKey,
      originalIndex: idx,
      parsed: parseVocabularyEntry(w)
    }));

    if (sortBy === SORT_MODES.DEFAULT) {
      return wordsWithKey;
    }

    if (sortBy === SORT_MODES.ALPHABETICAL) {
      return [...wordsWithKey].sort((a, b) =>
        a.parsed.displayText.localeCompare(b.parsed.displayText, 'ja')
      );
    }

    return wordsWithKey;
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
              <span>Back to menu</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none ${theme.sectionBg} ${theme.border} ${theme.text} rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
              >
                <option value={SORT_MODES.DEFAULT}>Default order</option>
                <option value={SORT_MODES.ALPHABETICAL}>Alphabetical</option>
              </select>
              <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <div className="space-y-8">
            {wordsSelectedLists.map(listKey => {
              const list = vocabularyLists[listKey];
              if (!list) return null;

              const sortedWords = sortWords(list.words, listKey);

              return (
                <div key={listKey}>
                  {wordsSelectedLists.length > 1 && (
                    <h3 className={`text-sm font-medium ${theme.textMuted} mb-3 uppercase tracking-wide`}>
                      {list.name}
                    </h3>
                  )}

                  <table className="w-full">
                    <thead>
                      <tr className={`${theme.border} border-b-2`}>
                        <th className={`text-left p-4 ${theme.text} font-semibold`}>Japanese</th>
                        <th className={`text-left p-4 ${theme.text} font-semibold`}>Translation</th>
                        <th className={`text-left p-4 ${theme.text} font-semibold`}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedWords.map(renderWordRow)}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
