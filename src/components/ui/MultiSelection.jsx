import { ChevronDown, Check, Lock, Bookmark, Eraser } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import { SkeletonListItem } from './SkeletonLoading';


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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const itemRefs = useRef([]);
  const isKeyboardNavigating = useRef(false);


  const toggleOption = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  // Reset focused and hovered index when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
      setHoveredIndex(-1);
      isKeyboardNavigating.current = false;
    }
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const enabledIndices = options.map((opt, idx) => ({ opt, idx }))
      .filter(({ opt }) => !opt.disabled)
      .map(({ idx }) => idx);

    if (enabledIndices.length === 0) return;

    const activeIndex = hoveredIndex >= 0 ? hoveredIndex : focusedIndex;
    const currentEnabledIndex = enabledIndices.indexOf(activeIndex);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        isKeyboardNavigating.current = true;
        setHoveredIndex(-1);
        if (currentEnabledIndex < 0) {
          // No focus yet, start at first enabled
          setFocusedIndex(enabledIndices[0]);
        } else if (currentEnabledIndex < enabledIndices.length - 1) {
          setFocusedIndex(enabledIndices[currentEnabledIndex + 1]);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        isKeyboardNavigating.current = true;
        setHoveredIndex(-1);
        if (currentEnabledIndex < 0) {
          // No focus yet, start at last enabled
          setFocusedIndex(enabledIndices[enabledIndices.length - 1]);
        } else if (currentEnabledIndex > 0) {
          setFocusedIndex(enabledIndices[currentEnabledIndex - 1]);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        const targetIndex = hoveredIndex >= 0 ? hoveredIndex : focusedIndex;
        if (targetIndex >= 0 && !options[targetIndex]?.disabled) {
          toggleOption(options[targetIndex].value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Add keyboard listener when dropdown is open
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click is on the trigger button
        const triggerButton = dropdownRef.current.parentElement?.querySelector('button');
        if (triggerButton && triggerButton.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full px-4 py-${py} rounded-xl border-2
          ${theme.inputBorder} ${theme.inputBg} ${theme.text}
          flex items-center justify-between
          hover:border-blue-400 transition-colors
        `}
      >
        <span className={selectedLabels.length > 0 ? 'pr-10 truncate' : theme.textMuted}>
          {selectedLabels.length === 0
            ? `${t('menu.selectListsOf')} ${subItemsLabel}...`
            : selectedLabels.length === 1
            ? selectedLabels[0]
            : `${selectedLabels.length} ${optionLabel}s ${t('menu.selected')}`}
        </span>
        {selectedValues.length > 0 && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer opacity-70"
          >
            <Eraser className="w-5 h-5" />
          </span>
        )}
        <ChevronDown className={`w-5 h-5 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={`
            absolute z-20 w-full mt-2 rounded-xl shadow-lg
            ${theme.selectorBg} border ${theme.border}
            max-h-60 overflow-y-auto outline-none
          `}
        >
            {options.length === 0 ? (
              <>
                <SkeletonListItem theme={theme} />
                <SkeletonListItem theme={theme} />
                <SkeletonListItem theme={theme} />
              </>
            ) : (
              options.map((option, index) => {
                const isHovered = hoveredIndex === index;
                const isFocused = focusedIndex === index && hoveredIndex < 0;
                const isHighlighted = (isHovered || isFocused) && !option.disabled;

                return (
                  <button
                    key={option.value}
                    ref={el => itemRefs.current[index] = el}
                    onClick={() => {
                      if (option.disabled) return;
                      // If option has onClick callback (CTA), call it instead of toggling
                      if (option.onClick) {
                        option.onClick();
                        setIsOpen(false);
                      } else {
                        toggleOption(option.value);
                      }
                    }}
                    onMouseMove={() => {
                      if (isKeyboardNavigating.current) {
                        isKeyboardNavigating.current = false;
                      }
                      if (hoveredIndex !== index) {
                        setHoveredIndex(index);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(-1);
                    }}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between
                      ${theme.text}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isHighlighted ? theme.selectorHover.replace('hover:', '') : ''}
                      transition-colors text-left
                    `}
                  >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {option.icon === 'bookmark' && (
                          <Bookmark className={`w-4 h-4 ${theme.bookmarkColor}`} />
                        )}
                        {option.label}
                        {option.isLocked && (
                          <Lock className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      {option.placeholder && (
                        <div className={`text-xs ${theme.textMuted}`}>
                          {option.placeholder}
                        </div>
                      )}
                      {!option.placeholder && option.count !== null && option.count !== undefined && (
                        <div className={`text-xs ${theme.textMuted}`}>
                          {`${option.count} ${subItemsLabel}`}
                          {option.description && (
                            <span className="opacity-70"> / {option.description}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {!option.onClick && selectedValues.includes(option.value) && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              );
              })
            )}
        </div>
      )}
    </div>
  );
};
