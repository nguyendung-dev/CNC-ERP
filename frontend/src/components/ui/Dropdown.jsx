'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * Modern, accessible and responsive Dropdown / CustomSelect component
 * Supports flat options, grouped options (optgroup), smart upward/downward positioning,
 * live search filtering, custom badges and icons.
 *
 * @param {string} label - Top label for form field
 * @param {string} placeholder - Placeholder text when empty
 * @param {any} value - Currently selected value
 * @param {function} onChange - Triggered on selection (passes { target: { name, value }, value, option })
 * @param {Array} options - List of options [{ value, label, group?, description?, badge?, icon? }] or string[]
 * @param {Array} groups - Explicit list of groups [{ label, icon?, options: [...] }]
 * @param {boolean} searchable - Show search input (auto enabled if > 7 options)
 * @param {boolean} clearable - Allow clearing selection
 * @param {string} error - Error message string
 * @param {boolean} disabled - Disable interaction
 * @param {string} className - Additional CSS classes for trigger
 * @param {string} containerClassName - CSS classes for root container
 * @param {string} name - Form field name
 * @param {string} id - Form field ID
 * @param {React.ReactNode} leadingIcon - Icon to display on the left of trigger
 * @param {Array} customActions - Custom clickable options at the bottom (e.g. [{ label, value, icon, onClick }])
 * @param {string} size - 'sm' | 'md'
 */
export default function Dropdown({
  label,
  placeholder = '-- Chọn một mục --',
  value,
  onChange,
  options = [],
  groups = null,
  searchable,
  clearable = false,
  error,
  disabled = false,
  className = '',
  containerClassName = '',
  name,
  id,
  leadingIcon: LeadingIcon,
  customActions = [],
  size = 'md', // 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize all options into a unified structure
  const normalizedGroups = useMemo(() => {
    // Case 1: Explicit groups array provided
    if (groups && Array.isArray(groups) && groups.length > 0) {
      return groups.map((g) => ({
        label: g.label || '',
        icon: g.icon,
        options: (g.options || []).map((opt) =>
          typeof opt === 'object' && opt !== null
            ? { value: opt.value !== undefined ? opt.value : '', label: opt.label ?? String(opt.value ?? ''), ...opt }
            : { value: opt, label: String(opt) }
        ),
      }));
    }

    // Case 2: Flat options list, check if some have a `group` property
    const safeOptions = Array.isArray(options) ? options : [];
    const hasGroups = safeOptions.some((opt) => typeof opt === 'object' && opt?.group);

    if (hasGroups) {
      const groupMap = new Map();
      const defaultGroup = [];

      safeOptions.forEach((opt) => {
        const item =
          typeof opt === 'object' && opt !== null
            ? { value: opt.value !== undefined ? opt.value : '', label: opt.label ?? String(opt.value ?? ''), ...opt }
            : { value: opt, label: String(opt) };

        if (item.group) {
          if (!groupMap.has(item.group)) {
            groupMap.set(item.group, []);
          }
          groupMap.get(item.group).push(item);
        } else {
          defaultGroup.push(item);
        }
      });

      const result = [];
      if (defaultGroup.length > 0) {
        result.push({ label: '', options: defaultGroup });
      }
      groupMap.forEach((opts, grpLabel) => {
        result.push({ label: grpLabel, options: opts });
      });
      return result;
    }

    // Case 3: Flat options list without groups
    return [
      {
        label: '',
        options: safeOptions.map((opt) =>
          typeof opt === 'object' && opt !== null
            ? { value: opt.value !== undefined ? opt.value : '', label: opt.label ?? String(opt.value ?? ''), ...opt }
            : { value: opt, label: String(opt) }
        ),
      },
    ];
  }, [options, groups]);

  // Total count of options
  const totalOptionsCount = useMemo(() => {
    return normalizedGroups.reduce((acc, g) => acc + g.options.length, 0);
  }, [normalizedGroups]);

  // Auto-enable search if total options > 6 unless explicitly specified
  const shouldEnableSearch = searchable !== undefined ? searchable : totalOptionsCount > 6;

  // Filter groups by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return normalizedGroups;
    const term = searchTerm.toLowerCase();

    return normalizedGroups
      .map((g) => ({
        ...g,
        options: g.options.filter((opt) => {
          const matchLabel = opt.label?.toLowerCase().includes(term);
          const matchDesc = opt.description?.toLowerCase().includes(term);
          const matchVal = String(opt.value).toLowerCase().includes(term);
          const matchGroup = g.label?.toLowerCase().includes(term);
          return matchLabel || matchDesc || matchVal || matchGroup;
        }),
      }))
      .filter((g) => g.options.length > 0);
  }, [normalizedGroups, searchTerm]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null) return null;
    for (const g of normalizedGroups) {
      const found = g.options.find((opt) => String(opt.value) === String(value));
      if (found) return found;
    }
    // Check in custom actions
    const foundAction = customActions.find((a) => String(a.value) === String(value));
    if (foundAction) return foundAction;

    // Fallback: if value is non-empty string, show it
    if (value !== '') {
      return { value, label: String(value) };
    }
    return null;
  }, [normalizedGroups, customActions, value]);

  // Check upward vs downward positioning when opened
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Handle select option
  const handleSelect = (option) => {
    if (disabled) return;
    const val = option ? option.value : '';

    if (onChange) {
      onChange({
        target: {
          name: name || id || '',
          value: val,
        },
        value: val,
        option,
      });
    }

    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    handleSelect(null);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && shouldEnableSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, shouldEnableSearch]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs rounded-lg'
      : 'px-3 py-2 text-xs sm:text-sm rounded-xl';

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={id || name}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              setSearchTerm('');
            }
          }}
          className={`w-full flex items-center justify-between gap-2 bg-white border text-left transition-all shadow-2xs ${sizeClasses} ${
            error
              ? 'border-rose-400 focus:ring-rose-500/20'
              : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
              : 'border-slate-200 hover:border-slate-300'
          } ${
            disabled
              ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed border-slate-200'
              : 'cursor-pointer'
          } ${className}`}
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            {LeadingIcon && (
              <LeadingIcon className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            {selectedOption && selectedOption.value !== '' ? (
              <div className="flex items-center gap-2 truncate">
                {selectedOption.icon && (
                  <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
                )}
                <span className="font-semibold text-slate-800 truncate">
                  {selectedOption.label}
                </span>
                {selectedOption.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 shrink-0">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 truncate">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {clearable && selectedOption && selectedOption.value !== '' && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                title="Xóa lựa chọn"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </div>
        </button>

        {/* Floating Menu Popover */}
        {isOpen && (
          <div
            className={`absolute left-0 right-0 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-300/40 z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-72 ${
              openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
            style={{ minWidth: '100%' }}
          >
            {/* Search Filter Header */}
            {shouldEnableSearch && (
              <div className="p-2 border-b border-slate-100 bg-slate-50/60 sticky top-0 z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm nhanh..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable Options List */}
            <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100/60 flex-1">
              {filteredGroups.length === 0 && customActions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Không tìm thấy lựa chọn nào phù hợp.
                </div>
              ) : (
                filteredGroups.map((group, grpIdx) => (
                  <div key={group.label || grpIdx} className={grpIdx > 0 ? 'pt-1.5' : ''}>
                    {group.label && (
                      <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        {group.icon && <span>{group.icon}</span>}
                        <span>{group.label}</span>
                      </div>
                    )}
                    <div className="space-y-0.5 mt-0.5">
                      {group.options.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => handleSelect(opt)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-xl text-left transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-start gap-2 truncate flex-1 min-w-0">
                              {opt.icon && (
                                <span className="mt-0.5 shrink-0 text-slate-500">{opt.icon}</span>
                              )}
                              <div className="truncate">
                                <div className="truncate flex items-center gap-1.5">
                                  <span className="truncate">{opt.label}</span>
                                  {opt.badge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium shrink-0">
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                {opt.description && (
                                  <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                                    {opt.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {/* Custom Actions (e.g. "✏️ Nhập thiết bị khác...", "+ Thêm mới...") */}
              {customActions.length > 0 && (
                <div className="pt-1.5 border-t border-slate-100 mt-1">
                  {customActions.map((action, aIdx) => {
                    const isSelected = String(action.value) === String(value);
                    return (
                      <button
                        key={action.value || aIdx}
                        type="button"
                        onClick={() => {
                          if (action.onClick) action.onClick();
                          handleSelect(action);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-blue-600 hover:bg-blue-50/60'
                        }`}
                      >
                        {action.icon && <span>{action.icon}</span>}
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

export { Dropdown };
