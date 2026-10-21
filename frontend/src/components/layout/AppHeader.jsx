'use client';

import { t } from '../../i18n';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid,
  Menu,
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
  FileText,
  Pencil,
  Lock,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
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
  navItems = [],
  activeNav = 'home',
  onNavChange,
}) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { updateCurrentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);

  const handleOpenProfileModal = () => {
    setIsEditingProfile(false);
    setProfileForm({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
    setIsProfileModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      showError(t('auth.password_mismatch'));
      return;
    }
    setIsSavingProfile(true);
    try {
      const payload = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        email: profileForm.email,
      };
      if (profileForm.password && profileForm.password.trim() !== '') {
        payload.password = profileForm.password.trim();
      }
      const res = await api.put(`/auth/users/${user.id}`, payload);
      if (updateCurrentUser && res?.data) {
        updateCurrentUser(res.data);
      }
      showSuccess(t('auth.update_profile_success'));
      setIsEditingProfile(false);
      setProfileForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Cập nhật thất bại');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
            {/* Left: Hamburger on Mobile (< md), Logo on Desktop (>= md) */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMobileDrawerOpen(!isMobileDrawerOpen);
          } else if (onLogoClick) {
            onLogoClick();
          }
        }}
        className="w-14 sm:w-16 md:w-28 h-full flex items-center justify-center border-r border-slate-200 shrink-0 text-slate-500 hover:bg-blue-50/80 hover:text-blue-600 transition-colors duration-200 cursor-pointer group focus:outline-none"
        title="Menu điều hướng"
      >
        <span className="md:hidden">
          {isMobileDrawerOpen ? (
            <X className="w-5 h-5 text-slate-700" />
          ) : (
            <Menu className="w-5 h-5 text-slate-700" />
          )}
        </span>
        <span className="hidden md:inline-block">
          <LayoutGrid
            className="w-7 h-7 text-slate-600 group-hover:text-blue-600 transition-colors duration-200"
            strokeWidth={2}
          />
        </span>
      </button>

      {/* Center: Page Title (Prominent & Bolder) + Workspace Name */}
      <div className="flex-1 flex items-center justify-between px-4 md:px-6 gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Current Page Title: Bolder & Larger as specified */}
          <h1 className="text-xs sm:text-base md:text-lg font-extrabold text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-xs md:max-w-none">
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
                className="w-28 sm:w-52 md:w-72 pl-8 sm:pl-9 pr-6 sm:pr-8 py-1.5 text-xs rounded-xl bg-slate-50/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
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
                    <button
                      type="button"
                      onClick={handleOpenProfileModal}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Hồ sơ cá nhân
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (logout) logout();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      {t('auth.logout')}
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

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setIsEditingProfile(false);
        }}
        title={isEditingProfile ? 'Chỉnh Sửa Hồ Sơ Cá Nhân' : t('auth.profile_title')}
        maxWidth="max-w-md"
        footer={
          isEditingProfile ? (
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {isSavingProfile ? t('common.saving') : t('common.save')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                {t('auth.edit_profile_btn')}
              </button>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          )
        }
      >
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.full_name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.full_name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                value={profileForm.phone || ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="VD: 0987654321"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.work_email')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={profileForm.email || ''}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.new_password')}
              </label>
              <div className="relative">
                <input
                  type={showProfilePassword ? 'text' : 'password'}
                  value={profileForm.password || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  placeholder={t('auth.password_placeholder_leave_empty')}
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePassword(!showProfilePassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                  title={showProfilePassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {profileForm.password && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.confirm_password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showProfileConfirmPassword ? 'text' : 'password'}
                    required
                    value={profileForm.confirmPassword || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfileConfirmPassword(!showProfileConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                    title={showProfileConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showProfileConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{user?.full_name || 'Người Dùng'}</h4>
                <p className="text-xs text-slate-500 font-mono">@{user?.username || 'user'}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  {roleLabels[user?.role] || user?.role || 'Nhân viên'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('auth.work_email')}</span>
                <span className="font-semibold text-slate-800 font-mono">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('auth.phone')}</span>
                <span className="font-semibold text-slate-800 font-mono">{user?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('auth.staff_id')}</span>
                <span className="font-semibold text-slate-800 font-mono">#{user?.id || 1}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">{t('auth.account_status')}</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Đang hoạt động (Active)
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Mobile Navigation Drawer */}
      {isMobileDrawerOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[999998] md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Slide-out Panel */}
            <div className="relative z-10 w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                    CNC
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">CNC-ERP</h3>
                    <p className="text-[11px] text-slate-400">Workspace xưởng cơ khí</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-3 space-y-1.5 overflow-y-auto flex-1">
                {(navItems || []).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (onNavChange) onNavChange(item.id);
                        if (onSelectModule) onSelectModule(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User profile & Logout footer */}
              <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 space-y-2.5">
                <div
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    handleOpenProfileModal();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-300 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate">{user?.full_name || 'Người Dùng'}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">@{user?.username || 'user'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (logout) logout();
                    router.push('/login');
                  }}
                  className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-200/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('auth.logout', 'Đăng xuất')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
