export const StatsCard = ({ icon, value, label, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl p-4 text-center`}>
    {icon}
    <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
    <div className={`text-sm ${textColor.replace('800', '600')}`}>{label}</div>
  </div>
);
