'use client';

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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, token, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && user && token) {
      router.replace('/');
    }
  }, [user, token, isLoading, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* LEFT PANEL - CNC INDUSTRIAL HERO */}
      <div className="w-full lg:w-[58%] h-full bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#0f1d38] p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
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

      {/* RIGHT PANEL - SECURE LOGIN FORM */}
      <div className="w-full lg:w-[42%] h-full bg-[#fafbfc] text-slate-800 px-6 sm:px-10 lg:px-12 py-6 flex flex-col justify-center items-center overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-md my-auto">
          {/* Header */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-blue-600 block mb-1 uppercase tracking-wider">
              Cổng Đăng Nhập Doanh Nghiệp
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Đăng nhập hệ thống
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sử dụng email công việc hoặc tên đăng nhập được quản trị viên cấp.
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email hoặc Tên đăng nhập
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="VD: admin@cnc.com hoặc tên đăng nhập"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
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
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Admin Policy Notice */}
            <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Chính sách nội bộ:</strong> Chỉ Quản trị viên (Admin) mới có quyền tạo và cấp mới tài khoản trong hệ thống.
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Liên hệ quản trị viên xưởng nếu bạn chưa có tài khoản hoặc cần hỗ trợ truy cập.
          </p>
        </div>
      </div>
    </div>
  );
}
