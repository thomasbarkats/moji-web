export const SegmentedControl = ({ value, onChange, options, label, theme, helpIcon }) => {
  return (
    <div className="flex items-center justify-between py-3">
      {label && (
        <div className={`flex items-center gap-2 text-sm font-medium ${theme.text}`}>
          <span>{label}</span>
          {helpIcon}
        </div>
      )}
      <div className={`inline-flex rounded-lg ${theme.darkMode ? 'bg-gray-700' : 'bg-gray-200'} p-1`}>
        {options.map((option) => (
          <button
            key={option.value}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`
              relative px-3.5 py-1 rounded-md text-sm font-medium transition-all duration-200
              ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${value === option.value
                ? `${theme.darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'} shadow-sm`
                : `${theme.darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }
            `}
            title={option.tooltip}
          >
            {option.label}
            {value === option.value && (
              <div className="absolute inset-0 rounded-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
