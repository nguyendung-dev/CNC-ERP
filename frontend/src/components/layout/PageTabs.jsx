'use client';

/**
 * PageTabs - Standardized Secondary Navigation Tabs Component
 * Sits directly below AppHeader on the same horizontal row.
 *
 * @param {Array} tabs - List of tabs: [{ id: string, label: string, count?: number|string }]
 * @param {string} activeTab - Identifier of the active tab
 * @param {function} onTabChange - Callback invoked when a tab is selected
 * @param {React.ReactNode} rightContent - Optional right-side controls (e.g. filter, search, action button)
 * @param {string} className - Additional CSS classes for custom styling
 */
export default function PageTabs({
  tabs = [],
  activeTab,
  onTabChange,
  rightContent = null,
  className = '',
}) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      className={`bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-16 z-30 shadow-2xs overflow-hidden ${className}`}
    >
      {/* Scrollable Tabs List */}
      <div className="flex items-center gap-5 md:gap-7 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`py-3 px-1 relative flex items-center gap-2 text-xs md:text-sm transition-all duration-150 cursor-pointer select-none border-b-2 -mb-[1px] ${
                isActive
                  ? 'text-blue-600 font-bold border-blue-600'
                  : 'text-slate-500 hover:text-slate-900 border-transparent font-medium'
              }`}
            >
              <span>{tab.label}</span>

              {/* Quantity badge with light background and rounded pill */}
              {tab.count !== undefined && tab.count !== null && (
                <span
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Right-side Actions / Filter */}
      {rightContent && (
        <div className="shrink-0 flex items-center gap-2 pl-4 py-2">
          {rightContent}
        </div>
      )}
    </div>
  );
}
