'use client';

import { t } from '../../i18n';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ChevronDown
} from 'lucide-react';
import { useAuth, QUICK_ACCOUNTS } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, token, isLoading, login, quickLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && user && token) {
      router.replace('/');
    }
  }, [user, token, isLoading, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);

  // Clean form state: empty by default
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginForm.identifier, loginForm.password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginClick = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(email);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập nhanh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL - CNC INDUSTRIAL HERO */}
      <div className="w-full lg:w-[50%] shrink-0 lg:h-full bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#0f1d38] p-6 sm:p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-400 text-xs sm:text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            HỆ THỐNG ĐIỀU HÀNH ERP CƠ KHÍ TOÀN DIỆN
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.18] mb-6">
            Quản Trị Chuỗi Sản Xuất & Gia Công Cơ Khí CNC
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 font-normal">
            Hệ thống số hóa toàn diện quy trình nhà xưởng: từ lập báo giá chi tiết, 
            hoạch định tồn kho phôi & dao cụ (MRP), lập lệnh sản xuất (LSX), theo dõi 
            luân chuyển BTP các tổ máy phay/tiện/cắt dây đến quản lý gia công ngoài và kiểm soát dòng tiền.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-sm sm:text-base font-semibold text-slate-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Báo giá CNC & Đơn đặt hàng SO</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Kho phôi & Dao cụ hao hụt (MRP)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Lệnh sản xuất LSX & Tiến độ WIP</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Gia công ngoài & Quản lý công nợ</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - SECURE LOGIN FORM & QUICK TEST ACCOUNTS */}
      <div className="w-full lg:w-[50%] flex-1 lg:h-full bg-[#fafbfc] text-slate-800 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md my-auto py-2">
          {/* Header */}
          <div className="mb-5">
            <span className="text-xs font-semibold text-blue-600 block mb-1 uppercase tracking-wider">
              {t('auth.enterprise_portal')}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('auth.login_title')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('auth.login_subtitle')}
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.identifier_label')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('auth.identifier_placeholder')}
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('auth.password_label')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? t('auth.authenticating') : t('auth.login_btn')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Quick Login Collapsible Dropdown for Testing & Role Verification */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQuickOpen(!isQuickOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition block leading-tight">
                      Đăng nhập nhanh để test
                    </span>
                    <span className="text-[10px] text-slate-400">
                      5 vai trò mẫu • Mật khẩu: 123456
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-blue-600 font-semibold hidden sm:inline">
                    {isQuickOpen ? 'Thu gọn' : 'Sổ ra'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 ${
                      isQuickOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Content (Sổ ra) */}
              {isQuickOpen && (
                <div className="mt-2.5 pt-2 border-t border-slate-100/80 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(QUICK_ACCOUNTS || []).map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={loading}
                        onClick={() => handleQuickLoginClick(acc.email)}
                        className={`text-left p-2.5 rounded-xl border transition group cursor-pointer ${
                          acc.role === 'admin'
                            ? 'sm:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200 hover:border-blue-400 shadow-xs'
                            : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                            {acc.label}
                          </p>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{acc.email}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Policy Notice */}
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>{t('auth.admin_policy_title')}</strong> {t('auth.admin_policy_desc')}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            {t('auth.support_contact')}
          </p>
        </div>
      </div>
    </div>
  );
}
