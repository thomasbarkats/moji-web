export const SkeletonButton = ({ theme }) => (
  <div className={`h-[72px] w-full rounded-xl ${theme?.sectionBg || 'bg-gray-200 dark:bg-gray-700'} animate-pulse`} />
);

export const SkeletonListItem = ({ theme }) => (
  <div className={`w-full px-4 py-3 flex items-center justify-between ${theme?.text || 'text-gray-900 dark:text-gray-100'}`}>
    <div className="flex-1">
      <div className={`h-4 w-32 rounded ${theme?.sectionBg || 'bg-gray-300 dark:bg-gray-600'} animate-pulse mb-2`} />
      <div className={`h-3 w-24 rounded ${theme?.sectionBg || 'bg-gray-300 dark:bg-gray-600'} animate-pulse`} />
    </div>
  </div>
);

export const SkeletonSelector = ({ theme, count = 3 }) => (
  <div className={`w-full px-4 py-3 rounded-xl border-2 ${theme?.inputBorder || 'border-gray-300 dark:border-gray-600'} ${theme?.inputBg || 'bg-white dark:bg-gray-800'}`}>
    <div className={`h-5 w-48 rounded ${theme?.sectionBg || 'bg-gray-300 dark:bg-gray-600'} animate-pulse`} />
  </div>
);

export const SkeletonTableRow = ({ theme, columns = 3 }) => (
  <tr className={`${theme?.border || 'border-gray-200 dark:border-gray-700'} border-b`}>
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="p-4">
        <div className={`h-4 rounded ${theme?.sectionBg || 'bg-gray-300 dark:bg-gray-600'} animate-pulse`} style={{ width: `${60 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ theme, rows = 5, columns = 3, showHeader = true }) => (
  <table className="w-full">
    {showHeader && (
      <thead>
        <tr className={`${theme?.border || 'border-gray-200 dark:border-gray-700'} border-b-2`}>
          {[...Array(columns)].map((_, i) => (
            <th key={i} className="text-left p-4">
              <div className={`h-4 w-24 rounded ${theme?.sectionBg || 'bg-gray-300 dark:bg-gray-600'} animate-pulse`} />
            </th>
          ))}
        </tr>
      </thead>
    )}
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <SkeletonTableRow key={i} theme={theme} columns={columns} />
      ))}
    </tbody>
  </table>
);
