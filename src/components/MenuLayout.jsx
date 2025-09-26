import { ChevronLeft, ChevronRight } from 'lucide-react';


export const MenuLayout = ({
  theme,
  darkMode,
  children,
  title,
  subtitle,
  onPrevious,
  onNext,
  previousTooltip,
  nextTooltip
}) => {
  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4 -mb-8`}>
      <div className={`${theme.cardBg} backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md`}>
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
  );
};
