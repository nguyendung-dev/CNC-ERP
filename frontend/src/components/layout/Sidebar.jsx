'use client';

import React from 'react';

/**
 * Sidebar - Standardized Left Navigation Component with Clean Flyout Submenus
 *
 * @param {Array} items - List of navigation items: [{ id, label, icon: IconComponent, badge?: number|string, subItems?: Array }]
 * @param {string} activeNav - Identifier of currently selected item
 * @param {string} activeSubNav - Identifier of currently active sub-item
 * @param {function} onNavChange - Callback invoked when an item or sub-item is clicked: (navId, subId) => void
 * @param {string} widthClass - Standard width matching header (default: "w-24 md:w-28")
 * @param {boolean} showSeparatorAfterFirst - Whether to render separator line after first item (e.g. Trang chủ)
 */
export default function Sidebar({
  items = [],
  activeNav,
  activeSubNav,
  onNavChange,
  widthClass = 'w-24 md:w-28',
  showSeparatorAfterFirst = true,
}) {
  return (
    <aside
      className={`hidden md:flex ${widthClass} bg-white border-r border-slate-200 flex-col items-center py-4 shrink-0 z-30 select-none relative`}
    >
      {/* Navigation Items List */}
      <div className="flex flex-col items-center gap-2 w-full px-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const hasSub = Array.isArray(item.subItems) && item.subItems.length > 0;
          // Items near the bottom of viewport should open upwards to prevent clipping
          const isNearBottom = idx >= items.length - 2 || item.id === 'settings' || item.id === 'finance';

          return (
            <div key={item.id} className="w-full flex flex-col items-center relative group">
              <button
                onClick={() => onNavChange && onNavChange(item.id)}
                className={`w-full py-3 px-1 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200/90 shadow-xs font-bold'
                    : 'text-slate-500 bg-transparent border border-transparent hover:text-blue-600 hover:bg-blue-50/70 hover:border-blue-100 font-medium'
                }`}
                // Suppress browser native tooltip when flyout sub-menu exists to avoid ugly browser overlay
                {...(!hasSub && item.label ? { title: item.label } : {})}
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

              {/* Flyout Submenu on Hover - Dynamically opens upwards if near bottom */}
              {hasSub && (
                <div
                  className={`absolute left-full ${
                    isNearBottom ? 'bottom-0' : 'top-0'
                  } ml-2 z-50 w-64 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-2 opacity-0 pointer-events-none -translate-x-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-x-0 transition-all duration-150 ease-out before:absolute before:-left-3 before:top-0 before:w-3 before:h-full before:content-['']`}
                >
                  {/* Module Title Header */}
                  <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Submenu Items List */}
                  <div className="space-y-0.5">
                    {item.subItems.map((sub) => {
                      const isSubActive = isActive && activeSubNav === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavChange && onNavChange(item.id, sub.id);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex flex-col cursor-pointer ${
                            isSubActive
                              ? 'bg-blue-50/80 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{sub.label}</span>
                            {isSubActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            )}
                          </div>
                          {sub.desc && (
                            <span className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">
                              {sub.desc}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
