export const Toggle = ({ checked, onChange, label, description, theme }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className={`text-sm font-medium ${theme.text}`}>{label}</div>
        {description && (
          <div className={`text-xs ${theme.textMuted} mt-0.5`}>{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer
          ${checked ? 'bg-blue-500' : theme.darkMode ? 'bg-gray-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};
