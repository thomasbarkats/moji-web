import { useTranslation } from '../../contexts/I18nContext';

export const ScoreProgressBar = ({ score = 0, maxScore = 5, theme, tooltipPrefix = '' }) => {
  const { t } = useTranslation();
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const percentage = (clampedScore / maxScore) * 100;

  // Color gradient from orange to green based on score
  const getBarColor = () => {
    if (clampedScore === 0) return 'transparent';
    if (clampedScore === 1) return '#f97316'; // orange-500
    if (clampedScore === 2) return '#eab308'; // yellow-500
    if (clampedScore === 3) return '#a3e635'; // lime-400
    if (clampedScore === 4) return '#84cc16'; // lime-500
    return '#22c55e'; // green-500
  };

  // Get status text based on score
  const getStatusText = () => {
    if (clampedScore === 0) return t('progress.notPracticed');
    if (clampedScore === maxScore) return t('progress.mastered');
    return t('progress.keepPracticing');
  };

  return (
    <div
      className={`${theme.progressBg} rounded-full h-1.5 w-16`}
      title={`${tooltipPrefix}${clampedScore}/${maxScore}${getStatusText()}`}
    >
      <div
        className="h-1.5 rounded-full transition-all duration-300"
        style={{
          width: `${percentage}%`,
          backgroundColor: getBarColor(),
        }}
      />
    </div>
  );
};
