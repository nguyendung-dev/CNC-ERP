'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  User, 
  LogOut, 
  Search, 
  X, 
  ArrowRight,
  Package, 
  ShoppingCart, 
  Factory, 
  CreditCard,
  Loader2,
  FileText
} from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import api from '../../api';

/**
 * AppHeader - Standardized Header Component with Global Code Search
 *
 * @param {string} pageTitle - Name of current page/module (e.g. "Tổng quan", "Bán hàng & Báo giá")
 * @param {string} workspaceName - Name of current workspace (e.g. "HRM Workspace", "CNC-ERP Workspace")
 * @param {string} sidebarWidthClass - Width matching Sidebar for perfect vertical alignment (default: "w-24 md:w-28")
 * @param {function} onLogoClick - Action when clicking the app launcher icon
 * @param {function} onSelectModule - Callback when choosing a module from search / notifications
 * @param {object} user - Currently logged-in user
 * @param {function} logout - Logout callback
 * @param {object} roleLabels - Map of role codes to Vietnamese labels
 */
export default function AppHeader({
  pageTitle = 'Trang chủ',
  workspaceName = 'CNC-ERP Workspace',
  sidebarWidthClass = 'w-24 md:w-28',
  onLogoClick,
  onSelectModule,
  user,
  logout,
  roleLabels = {},
}) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Global Code Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Close search & user dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search bar
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live query to search API with debounce
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setSearchResults(res.data || []);
        setIsSearchOpen(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Navigate to target module when item is selected
  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    if (onSelectModule && item.module) {
      onSelectModule(item.module);
    }
  };

  // Handle direct Enter key on search input (smart prefix matching)
  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim().toUpperCase();

      if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
        return;
      }

      // Smart prefix recognition
      if (q.startsWith('SO-') || q.startsWith('BG-') || q.startsWith('XK-')) {
        setIsSearchOpen(false);
        if (onSelectModule) onSelectModule('sales');
      } else if (q.startsWith('LSX-') || q.startsWith('GC-')) {
        setIsSearchOpen(false);
        if (onSelectModule) onSelectModule('production');
      } else if (q.startsWith('PHOI-') || q.startsWith('DAO-') || q.startsWith('DAU-')) {
        setIsSearchOpen(false);
        if (onSelectModule) onSelectModule('inventory');
      } else if (q.startsWith('TU-') || q.startsWith('TT-')) {
        setIsSearchOpen(false);
        if (onSelectModule) onSelectModule('finance');
      } else if (q.startsWith('USER-') || q.includes('ADMIN') || q.includes('ROLE')) {
        setIsSearchOpen(false);
        if (onSelectModule) onSelectModule('settings');
      }
    }
  };

  const getModuleBadgeColor = (module) => {
    switch (module) {
      case 'sales':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'inventory':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'production':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'finance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getModuleIcon = (module) => {
    switch (module) {
      case 'sales':
        return <ShoppingCart className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'inventory':
        return <Package className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'production':
        return <Factory className="w-4 h-4 text-cyan-600 shrink-0" />;
      case 'finance':
        return <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-stretch justify-between z-40 sticky top-0 shadow-xs">
      {/* Left: Aligned exactly with Sidebar width - Full-cell hoverable & clickable */}
      <button
        onClick={onLogoClick}
        className={`${sidebarWidthClass} h-full flex items-center justify-center border-r border-slate-200 shrink-0 text-slate-500 hover:bg-blue-50/80 hover:text-blue-600 transition-colors duration-200 cursor-pointer group focus:outline-none`}
        title={`${workspaceName} - Về Trang chủ`}
      >
        <LayoutGrid
          className="w-7 h-7 text-slate-600 group-hover:text-blue-600 transition-colors duration-200"
          strokeWidth={2}
        />
      </button>

      {/* Center: Page Title (Prominent & Bolder) + Workspace Name */}
      <div className="flex-1 flex items-center justify-between px-4 md:px-6 gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Current Page Title: Bolder & Larger as specified */}
          <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
            {pageTitle}
          </h1>

          {/* Divider */}
          <span className="text-slate-300 font-light select-none">|</span>

          {/* Workspace Name: Muted & Smaller */}
          <span className="text-xs md:text-sm font-medium text-slate-500 hidden sm:inline whitespace-nowrap">
            {workspaceName}
          </span>
        </div>

        {/* Right Section: Search Bar + Notifications + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. Global Code Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                onKeyDown={handleKeyDownInput}
                placeholder="Tìm mã: SO-, LSX-, PHOI-, BG-..."
                className="w-44 sm:w-60 md:w-72 pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />

              {/* Clear button or Spinner */}
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-2.5" />
              ) : searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-1.5 rounded-full hover:bg-slate-200/60"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden md:inline-flex items-center absolute right-2.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded pointer-events-none">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Live Autocomplete Dropdown Popover */}
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-88 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
                <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>
                    Kết quả tìm thấy ({searchResults.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bấm để chuyển tới trang tương ứng
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-6 px-4 text-center text-xs text-slate-400">
                    Không tìm thấy dữ liệu khớp với mã &quot;{searchQuery}&quot;.<br />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Thử tìm: <strong>SO-</strong>, <strong>LSX-</strong>, <strong>PHOI-</strong>, <strong>BG-</strong>, <strong>TU-</strong>
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 py-1">
                    {searchResults.map((item, index) => (
                      <button
                        key={`${item.code}-${index}`}
                        onClick={() => handleSelectResult(item)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/60 transition flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className="mt-0.5 p-1 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-blue-200 transition">
                          {getModuleIcon(item.module)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-blue-600 group-hover:text-blue-700">
                              {item.code}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getModuleBadgeColor(
                                item.module
                              )}`}
                            >
                              {item.module_label}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {item.title}
                          </p>

                          {item.subtitle && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="self-center opacity-0 group-hover:opacity-100 text-blue-600 transition shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Notification Bell Dropdown */}
          <NotificationDropdown onSelectModule={onSelectModule} />

          {/* 3. User Profile Avatar with Initial & Direct Quick Logout */}
          <div className="flex items-center gap-1.5" ref={userMenuRef}>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                title={user?.full_name || 'Tài khoản người dùng'}
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">
                      {user?.full_name || 'Quản trị viên'}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email || 'admin@cnc.com'}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                      {roleLabels[user?.role] || 'Quản trị viên'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Đổi tài khoản / Đăng nhập
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (logout) logout();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất khỏi hệ thống
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Logout Button in Header Bar */}
            <button
              onClick={() => {
                if (logout) logout();
                router.push('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
