import { ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_MODES } from '../constants';


export const GameMenu = ({
  theme,
  children,
  title,
  subtitle,
  onPrevious,
  onNext,
  previousTooltip,
  nextTooltip,
  currentMode,
  onModeChange
}) => {
  const modes = [
    { key: APP_MODES.KANA, labelJa: 'かな', labelEn: 'Kana', tooltip: 'Hiragana & Katakana' },
    { key: APP_MODES.KANJI, labelJa: '漢字', labelEn: 'Kanji', tooltip: 'Kanji characters' },
    { key: APP_MODES.VOCABULARY, labelJa: '語彙', labelEn: 'Vocab.', tooltip: 'Japanese vocabulary' }
  ];

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className="relative">
        {/* Tabs attached to the left of menu */}
        <div className="hidden md:flex absolute -left-18 top-10 flex flex-col gap-2">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              title={mode.tooltip}
              className={`
                px-3 py-6 rounded-l-xl font-medium
                transition-all duration-200 cursor-pointer
                flex items-center gap-1
                ${currentMode === mode.key
                  ? `${theme.cardBg} ${theme.text} shadow-lg`
                  : `${theme.buttonSecondary} ${theme.textSecondary} hover:shadow-md opacity-70 hover:opacity-90`
                }
              `}
            >
              {/* Japanese text - vertical but characters upright */}
              <span className="writing-mode-vertical-rl text-md" style={{ writingMode: 'vertical-rl' }}>
                {mode.labelJa}
              </span>
              {/* English text - vertical and rotated */}
              <span className="text-sm" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {mode.labelEn}
              </span>
            </button>
          ))}
        </div>

        {/* Menu card */}
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md`} style={{ minWidth: '28rem' }}>
          <div className="text-center mb-8 relative">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className={`absolute top-5 left-12 p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={previousTooltip}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className={`absolute top-5 right-12 p-2 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={nextTooltip}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <h1 className={`text-4xl font-bold ${theme.text} mb-2`}>{title}</h1>
            <p className={theme.textSecondary}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
