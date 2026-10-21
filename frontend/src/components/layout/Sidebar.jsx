'use client';


/**
 * Sidebar - Standardized Left Navigation Component
 *
 * @param {Array} items - List of navigation items: [{ id, label, icon: IconComponent, badge?: number|string }]
 * @param {string} activeNav - Identifier of currently selected item
 * @param {function} onNavChange - Callback invoked when an item is clicked
 * @param {string} widthClass - Standard width matching header (default: "w-24 md:w-28")
 * @param {boolean} showSeparatorAfterFirst - Whether to render separator line after first item (e.g. Trang chủ)
 */
export default function Sidebar({
  items = [],
  activeNav,
  onNavChange,
  widthClass = 'w-24 md:w-28',
  showSeparatorAfterFirst = true,
}) {
  return (
    <aside
      className={`hidden md:flex ${widthClass} bg-white border-r border-slate-200 flex-col items-center py-4 shrink-0 z-20 select-none`}
    >
      {/* Navigation Items List */}
      <div className="flex flex-col items-center gap-2 w-full px-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <div key={item.id} className="w-full flex flex-col items-center">
              <button
                onClick={() => onNavChange && onNavChange(item.id)}
                className={`w-full py-3 px-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer relative group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200/90 shadow-xs font-bold'
                    : 'text-slate-500 bg-transparent border border-transparent hover:text-blue-600 hover:bg-blue-50/70 hover:border-blue-100 font-medium'
                }`}
                title={item.label}
              >
                {/* Centered Icon */}
                <div className="relative">
                  {Icon && (
                    <Icon
                      className={`w-6 h-6 transition-transform ${
                        isActive
                          ? 'text-blue-600 scale-105'
                          : 'text-slate-500 group-hover:text-blue-600'
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.75}
                    />
                  )}

                  {/* Optional Counter Badge on icon */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Centered Label */}
                <span
                  className={`text-xs mt-1.5 leading-tight text-center truncate max-w-full px-1 ${
                    isActive ? 'font-bold text-blue-600' : 'font-medium text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>

              {/* Separator line directly after first item if requested */}
              {showSeparatorAfterFirst && idx === 0 && (
                <div className="w-12 h-[1px] bg-slate-200 my-2" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
