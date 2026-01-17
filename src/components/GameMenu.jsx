import { ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_MODES } from '../constants';
import { useTranslation } from '../contexts/I18nContext';


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
  const { t } = useTranslation();

  const modes = [
    { key: APP_MODES.KANA, labelJa: 'かな', labelEn: t('modes.kana') },
    { key: APP_MODES.KANJI, labelJa: '漢字', labelEn: t('modes.kanji') },
    { key: APP_MODES.VOCABULARY, labelJa: '語彙', labelEn: t('modes.vocabulary') }
  ];

  const currentIndex = modes.findIndex(mode => mode.key === currentMode);
  const otherModes = [
    modes[(currentIndex + 1) % modes.length],
    modes[(currentIndex + 2) % modes.length]
  ];

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className="relative flex flex-col items-center gap-4">
        {/* Menu card */}
        <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full z-10`} style={{ width: '28rem' }}>
          <div className="text-center mb-8 relative">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className={`absolute top-4 left-6 p-3 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
                title={previousTooltip}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className={`absolute top-4 right-6 p-3 ${theme.buttonSecondary} rounded-full transition-colors cursor-pointer`}
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

        {/* Other mode tabs below */}
        <div className="flex gap-3 z-0" style={{ width: '28rem' }}>
          {otherModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className={`${theme.cardBg} backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:opacity-100 opacity-80 flex-1`}
            >
              <div className="text-center">
                <div className={`text-lg font-bold ${theme.text}`}>
                  {mode.labelJa}
                </div>
                <div className={`text-md ${theme.textSecondary}`}>
                  {mode.labelEn}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
