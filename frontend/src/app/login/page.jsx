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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fafbfc] text-slate-800 font-sans">
      {/* LEFT PANEL - CNC INDUSTRIAL HERO */}
      <div className="w-full lg:w-1/2 min-h-screen bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#0f1d38] text-slate-100 p-6 sm:p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 shrink-0">
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
      <div className="w-full lg:w-1/2 min-h-screen flex-1 bg-[#fafbfc] text-slate-800 px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-center items-center">
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

            {/* Quick Login Dropdown Select (Hộp chọn sổ ra) for Testing */}
            <div className="pt-3.5 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Đăng nhập nhanh để test
                </label>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Pass: 123456
                </span>
              </div>

              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleQuickLoginClick(e.target.value);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-2.5 px-3.5 pr-9 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition appearance-none shadow-xs"
                >
                  <option value="" disabled>
                    ⚡ Bấm vào đây để sổ ra danh sách tài khoản test (5 vai trò)...
                  </option>
                  <option value="admin@cnc.com">👑 Quản trị viên (Toàn quyền) — admin@cnc.com</option>
                  <option value="sales@cnc.com">💼 Kinh doanh (Bán hàng & Báo giá) — sales@cnc.com</option>
                  <option value="prod@cnc.com">⚙️ Sản xuất CNC (Lệnh SX & WIP) — prod@cnc.com</option>
                  <option value="kho@cnc.com">📦 Thủ kho (Phôi kim loại & Dao cụ) — kho@cnc.com</option>
                  <option value="ketoan@cnc.com">💰 Kế toán (Tài chính & Công nợ) — ketoan@cnc.com</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
