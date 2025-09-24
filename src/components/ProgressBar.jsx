export const ProgressBar = ({ percentage, theme }) => (
  <div className={`${theme.progressBg} rounded-full h-3 mb-2`}>
    <div
      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
      style={{ width: `${percentage}%` }}
    />
  </div>
);
