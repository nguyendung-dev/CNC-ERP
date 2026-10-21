'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth, QUICK_ACCOUNTS } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, token, isLoading, login, register, quickLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && user && token) {
      router.replace('/');
    }
  }, [user, token, isLoading, router]);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'sales',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginForm.identifier, loginForm.password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(registerForm);
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/'), 800);
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(email);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập bằng tài khoản mẫu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* LEFT PANEL - CNC INDUSTRIAL HERO (Chữ to, rõ ràng, không thanh cuộn) */}
      <div className="w-full lg:w-[58%] h-full bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#0f1d38] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Content Area */}
        <div className="relative z-10 max-w-2xl">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-400 text-xs sm:text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            HỆ THỐNG ĐIỀU HÀNH ERP CƠ KHÍ TOÀN DIỆN
          </div>

          {/* Big Bold Headline (To rõ, ấn tượng) */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.18] mb-6">
            Quản Trị Chuỗi Sản Xuất & Gia Công Cơ Khí CNC
          </h1>

          {/* Description Paragraph (To rõ ràng) */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 font-normal">
            Hệ thống số hóa toàn diện quy trình nhà xưởng: từ lập báo giá chi tiết, 
            hoạch định tồn kho phôi & dao cụ (MRP), lập lệnh sản xuất (LSX), theo dõi 
            luân chuyển BTP các tổ máy phay/tiện/cắt dây đến quản lý gia công ngoài và kiểm soát dòng tiền.
          </p>

          {/* 4 Feature Pillars (Chữ to, icon rõ ràng) */}
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

      {/* RIGHT PANEL - LOGIN / REGISTER FORM (Vừa vặn trên màn hình, không kéo lên xuống) */}
      <div className="w-full lg:w-[42%] h-full bg-[#fafbfc] text-slate-800 px-6 sm:px-10 lg:px-12 py-6 flex flex-col justify-center items-center overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-md my-auto">
          {/* Header */}
          <div className="mb-5">
            <span className="text-xs font-semibold text-blue-600 block mb-1">
              Chào mừng trở lại
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sử dụng email công việc hoặc tài khoản nhân viên được cấp.
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email hoặc mã nhân viên
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="admin@cnc.com hoặc admin"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên nhân viên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={registerForm.full_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
                    <input
                      type="text"
                      placeholder="nguyenvana"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="a@cnc.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sales">Kinh doanh & Bán hàng</option>
                    <option value="production">Quản đốc Sản xuất CNC</option>
                    <option value="warehouse">Thủ kho Phôi & Dao cụ</option>
                    <option value="accountant">Kế toán Trưởng</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Accounts Accordion */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition py-0.5"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Tài khoản thử nghiệm (1–Click Demo)
                </span>
                {showDemoAccounts ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showDemoAccounts && (
                <div className="mt-2.5 space-y-1 animate-in fade-in duration-150">
                  {QUICK_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickLogin(acc.email)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition active:scale-[0.99] disabled:opacity-50"
                    >
                      <span className="font-medium text-slate-800">{acc.label}</span>
                      <span className="font-mono text-slate-400 text-[11px]">123456</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Assistance */}
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Liên hệ quản trị viên xưởng nếu bạn không thể truy cập.
          </p>
        </div>
      </div>
    </div>
  );
}
