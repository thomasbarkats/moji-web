import { usePreferences } from '../../contexts/PreferencesContext';

export const SkeletonButton = () => {
  const { theme } = usePreferences();
  return (
    <div className={`h-[72px] w-full rounded-xl ${theme.sectionBg} animate-pulse`} />
  );
};

export const SkeletonListItem = () => {
  const { theme } = usePreferences();
  return (
    <div className={`w-full px-4 py-3 flex items-center justify-between ${theme.text}`}>
      <div className="flex-1">
        <div className={`h-4 w-32 rounded ${theme.sectionBg} animate-pulse mb-2`} />
        <div className={`h-3 w-24 rounded ${theme.sectionBg} animate-pulse`} />
      </div>
    </div>
  );
};

export const SkeletonSelector = ({ count = 3 }) => {
  const { theme } = usePreferences();
  return (
    <div className={`w-full px-4 py-3 rounded-xl border-2 ${theme.inputBorder} ${theme.inputBg}`}>
      <div className={`h-5 w-48 rounded ${theme.sectionBg} animate-pulse`} />
    </div>
  );
};

export const SkeletonTableRow = ({ columns = 3 }) => {
  const { theme } = usePreferences();
  return (
    <tr className={`${theme.border} border-b`}>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-4">
          <div className={`h-4 rounded ${theme.sectionBg} animate-pulse`} style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 3, showHeader = true }) => {
  const { theme } = usePreferences();
  return (
    <table className="w-full">
      {showHeader && (
        <thead>
          <tr className={`${theme.border} border-b-2`}>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="text-left p-4">
                <div className={`h-4 w-24 rounded ${theme.sectionBg} animate-pulse`} />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {[...Array(rows)].map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  );
};
