import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../contexts/I18nContext';


export const MultiSelection = ({
  options,
  selectedValues,
  onChange,
  theme,
  py,
  optionLabel,
  subItemsLabel
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);


  const toggleOption = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-${py} rounded-xl border-2 
          ${theme.inputBorder} ${theme.inputBg} ${theme.text}
          flex items-center justify-between
          hover:border-blue-400 transition-colors
        `}
      >
        <span className={selectedLabels.length > 0 ? '' : theme.textMuted}>
          {selectedLabels.length > 0
            ? `${selectedLabels.length} ${optionLabel}${selectedLabels.length > 1 ? 's' : ''} ${t('menu.selected')}`
            : `${t('menu.selectListsOf')} ${subItemsLabel}...`}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute z-20 w-full mt-2 rounded-xl shadow-lg
            ${theme.selectorBg} border ${theme.border}
            max-h-60 overflow-y-auto
          `}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  ${theme.text} ${theme.selectorHover}
                  transition-colors text-left
                `}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.count > 0 && (
                    <div className={`text-xs ${theme.textMuted}`}>
                      {option.count} {subItemsLabel}
                      {option.description && (
                        <span className="opacity-70"> / {option.description}</span>
                      )}
                    </div>
                  )}
                </div>
                {selectedValues.includes(option.value) && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
