import { Trophy, Target, BarChart3, Clock, ChevronDown, Sun, Moon } from 'lucide-react';
import { Button, StatsCard } from '.';
import { formatTime } from '../utils';
import { calculateTintStyle } from '../services/statsService';
import { GAME_MODES } from '../constants';


export const Summary = ({
  theme,
  darkMode,
  toggleDarkMode,
  gameMode,
  sessionStats,
  sortBy,
  setSortBy,
  sortedStats,
  requiredSuccesses,
  onNewSession,
  onRestartSameMode
}) => {
  const total = Object.values(sessionStats).length;
  const totalFailures = Object.values(sessionStats).reduce((sum, s) => sum + (s.failures || 0), 0);
  const elapsedTime = Object.values(sessionStats).reduce((sum, s) => sum + (s.timeSpent || 0), 0);

  const getFinalSummaryText = () => {
    switch (gameMode) {
      case GAME_MODES.HIRAGANA:
        return 'You have mastered all the hiragana in this session';
      case GAME_MODES.KATAKANA:
        return 'You have mastered all the katakana in this session';
      case GAME_MODES.BOTH:
        return 'You have mastered all the kana in this session';
      default:
        return 'Session completed!';
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-4 flex items-center -mb-8`}>
      <div className="w-full max-w-4xl mx-auto">
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8`}>
          <div className="text-center mb-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <h2 className={`text-3xl font-bold ${theme.text} mb-2`}>Congratulations!</h2>
            <p className={theme.textSecondary}>{getFinalSummaryText()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatsCard
              icon={<Target className={`w-8 h-8 ${theme.statsText.blue} mx-auto mb-2`} />}
              value={total}
              label="Kana studied"
              bgColor={theme.statsBg.blue}
              textColor={theme.statsText.blue}
            />
            <StatsCard
              icon={<BarChart3 className={`w-8 h-8 ${theme.statsText.red} mx-auto mb-2`} />}
              value={totalFailures}
              label="Total errors"
              bgColor={theme.statsBg.red}
              textColor={theme.statsText.red}
            />
            <StatsCard
              icon={<Clock className={`w-8 h-8 ${theme.statsText.green} mx-auto mb-2`} />}
              value={formatTime(elapsedTime)}
              label="Total time"
              bgColor={theme.statsBg.green}
              textColor={theme.statsText.green}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${theme.text}`}>Breakdown by kana</h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none ${theme.inputBg} ${theme.border} ${theme.text} rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="failures">Sort by errors</option>
                <option value="alphabetical">Sort by kana</option>
                <option value="time">Sort by time</option>
              </select>
              <ChevronDown className={`w-5 h-5 ${theme.textMuted} absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sortedStats.map((kana) => {
              const bgStyle = calculateTintStyle(kana, Object.values(sessionStats), sortBy, requiredSuccesses);

              return (
                <div key={kana.char} className="rounded-lg p-4 transition-colors duration-200" style={bgStyle}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-3xl ${theme.text}`}>{kana.char}</span>
                    <span className={`text-lg ${theme.textSecondary}`}>{kana.reading}</span>
                  </div>
                  <div className={`flex justify-between items-center text-sm ${theme.textMuted}`}>
                    <span>{formatTime(kana.timeSpent || 0)}</span>
                    {(kana.failures || 0) > 0 ? <span>✗ {kana.failures}</span> : <span></span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onNewSession} variant="primary">
              New session
            </Button>
            <Button onClick={onRestartSameMode} variant="success">
              Restart same mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
