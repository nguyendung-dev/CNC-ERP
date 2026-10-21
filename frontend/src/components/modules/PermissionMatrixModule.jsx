'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Workflow,
  Users,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Package,
  Factory,
  CreditCard,
  BarChart3,
  SlidersHorizontal,
  ArrowRight,
  FileText,
  DollarSign,
  Truck,
  Trash2,
  Check,
  Minus,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Pencil,
  Save,
  RotateCcw
} from 'lucide-react';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';

// Role Badge definition helper
export const ROLE_DEFINITIONS = {
  admin: { label: 'Quản trị viên (Admin)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  sales: { label: 'Kinh doanh (Sales)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  production: { label: 'Sản xuất (Production)', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  warehouse: { label: 'Thủ kho (Warehouse)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  accountant: { label: 'Kế toán (Accountant)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

// Permission Level Badges
function PermBadge({ level, isEditable = false, onClick, title }) {
  const content = (() => {
    switch (level) {
      case 'FULL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            Toàn quyền
          </span>
        );
      case 'ACTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <Check className="w-3 h-3 text-blue-600 stroke-[2.5]" />
            Thực hiện
          </span>
        );
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Eye className="w-3 h-3 text-amber-600" />
            Chỉ xem
          </span>
        );
      case 'NONE':
      default:
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
            <Minus className="w-3 h-3 mr-0.5" />
            Không quyền
          </span>
        );
    }
  })();

  if (!isEditable) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title || "Bấm để chuyển đổi quyền"}
      className="inline-flex items-center justify-center transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400/40 relative group"
    >
      {content}
    </button>
  );
}

// Master Role & Permission Matrix Data
const MATRIX_SECTIONS = [
  {
    module: 'Bán Hàng & Đơn Hàng (Sales & SO)',
    icon: ShoppingCart,
    items: [
      {
        feature: 'Danh bạ Khách hàng & Đối tác',
        desc: 'Xem, thêm mới, sửa thông tin doanh nghiệp, mã số thuế, liên hệ',
        roles: { admin: 'FULL', sales: 'FULL', production: 'VIEW', warehouse: 'VIEW', accountant: 'VIEW' },
      },
      {
        feature: 'Lập & Bóc tách Báo giá CNC',
        desc: 'Tính giá giờ máy CNC, tiền phôi, dao cụ, xử lý bề mặt và lợi nhuận',
        roles: { admin: 'FULL', sales: 'FULL', production: 'VIEW', warehouse: 'NONE', accountant: 'VIEW' },
      },
      {
        feature: 'Chuyển Báo giá thành Đơn hàng (SO)',
        desc: 'Chốt đơn hàng chính thức từ báo giá đã được khách hàng duyệt',
        roles: { admin: 'FULL', sales: 'FULL', production: 'NONE', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Quản lý Đơn hàng & Tiến độ SO',
        desc: 'Theo dõi số lượng đã gia công xong, số lượng còn trong chuyền WIP',
        roles: { admin: 'FULL', sales: 'FULL', production: 'ACTION', warehouse: 'VIEW', accountant: 'VIEW' },
      },
      {
        feature: 'Lập & Xuất Phiếu Giao Hàng',
        desc: 'Xuất kho thành phẩm CNC giao tới địa chỉ khách hàng',
        roles: { admin: 'FULL', sales: 'ACTION', production: 'NONE', warehouse: 'FULL', accountant: 'VIEW' },
      },
    ],
  },
  {
    module: 'Kho Phôi & Dao Cụ (Warehouse)',
    icon: Package,
    items: [
      {
        feature: 'Quản lý Tồn kho Phôi & Dao cụ',
        desc: 'Theo dõi số lượng tồn thực tế, đơn giá bình quân, vị trí lưu kho',
        roles: { admin: 'FULL', sales: 'VIEW', production: 'VIEW', warehouse: 'FULL', accountant: 'VIEW' },
      },
      {
        feature: 'Nhập kho Vật tư & Phôi mới',
        desc: 'Nhập phôi thép SKD11, nhôm 6061, dao phay ngón, chíp tiện',
        roles: { admin: 'FULL', sales: 'NONE', production: 'NONE', warehouse: 'FULL', accountant: 'ACTION' },
      },
      {
        feature: 'Xuất kho Phôi cho Sản xuất (LSX)',
        desc: 'Xuất phôi thanh, phôi tấm cho xưởng cắt phôi theo lệnh sản xuất',
        roles: { admin: 'FULL', sales: 'NONE', production: 'ACTION', warehouse: 'FULL', accountant: 'NONE' },
      },
      {
        feature: 'Cảnh báo Tồn kho Tối thiểu (Min-Stock)',
        desc: 'Hệ thống tự động phát cảnh báo khi phôi/dao chạm ngưỡng an toàn',
        roles: { admin: 'FULL', sales: 'VIEW', production: 'VIEW', warehouse: 'FULL', accountant: 'VIEW' },
      },
    ],
  },
  {
    module: 'Sản Xuất & Điều Độ Máy CNC (Production)',
    icon: Factory,
    items: [
      {
        feature: 'Phát Lệnh Sản Xuất CNC (LSX)',
        desc: 'Lập kế hoạch số lượng, gắn mã bản vẽ kỹ thuật, quy định công đoạn',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Luân Chuyển BTP & Kiểm Tra Lỗi NG',
        desc: 'Ghi nhận số lượng đạt, máy gia công, thợ máy và phân loại phế phẩm NG',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Chuyển Công Đoạn Nhanh (Step Transition)',
        desc: 'Chuyển phôi sang công đoạn kế tiếp (Cắt ➔ Phay ➔ Tiện ➔ QC)',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Gia Công Ngoài (Xi mạ / Nhiệt luyện)',
        desc: 'Lập phiếu gửi đối tác vệ tinh xử lý bề mặt, theo dõi ngày trả hàng',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'NONE', accountant: 'VIEW' },
      },
      {
        feature: 'Nhận Hàng Gia Công Ngoài & Kiểm Tra QC',
        desc: 'Ghi nhận số lượng nhận về, kiểm tra độ bóng, độ cứng lớp mạ',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'NONE', accountant: 'ACTION' },
      },
      {
        feature: 'Nghiệm Thu QC & Bàn Giao Nhập Kho',
        desc: 'Nghiệm thu đạt chuẩn 100%, bàn giao thành phẩm sang cho Thủ kho',
        roles: { admin: 'FULL', sales: 'NONE', production: 'FULL', warehouse: 'ACTION', accountant: 'NONE' },
      },
    ],
  },
  {
    module: 'Tài Chính & Dòng Tiền (Finance)',
    icon: CreditCard,
    items: [
      {
        feature: 'Lập Đề Nghị Tạm Ứng',
        desc: 'Tạm ứng mua phôi gấp, mua dao cụ đặc biệt hoặc thanh toán ngoài',
        roles: { admin: 'FULL', sales: 'ACTION', production: 'ACTION', warehouse: 'ACTION', accountant: 'ACTION' },
      },
      {
        feature: 'Phê Duyệt / Từ Chối Đề Nghị Tạm Ứng',
        desc: 'Kiểm soát hạn mức và duyệt giải ngân tạm ứng cho các bộ phận',
        roles: { admin: 'FULL', sales: 'NONE', production: 'NONE', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Lập Phiếu Chi NCC & Cấn Trừ Tạm Ứng',
        desc: 'Thanh toán tiền đối tác phôi/nhiệt luyện, cấn trừ số dư tạm ứng',
        roles: { admin: 'FULL', sales: 'NONE', production: 'NONE', warehouse: 'NONE', accountant: 'FULL' },
      },
      {
        feature: 'Sổ Theo Dõi Công Nợ Khách Hàng & NCC',
        desc: 'Ghi nhận doanh thu, tiền cọc, hạn nợ và thu hồi nợ tồn đọng',
        roles: { admin: 'FULL', sales: 'ACTION', production: 'NONE', warehouse: 'NONE', accountant: 'FULL' },
      },
    ],
  },
  {
    module: 'Báo Cáo & Quản Trị Hệ Thống (RBAC)',
    icon: SlidersHorizontal,
    items: [
      {
        feature: 'Báo Cáo Tổng Hợp & Lợi Nhuận',
        desc: 'Xem báo cáo doanh số, chi phí phôi máy, tỷ lệ phế phẩm NG xưởng',
        roles: { admin: 'FULL', sales: 'VIEW', production: 'VIEW', warehouse: 'VIEW', accountant: 'FULL' },
      },
      {
        feature: 'Đăng Ký & Phân Quyền Tài Khoản Nhân Viên',
        desc: 'Tạo tài khoản mới, cấp quyền vai trò (Admin, Sales, Prod, Kho, KT)',
        roles: { admin: 'FULL', sales: 'NONE', production: 'NONE', warehouse: 'NONE', accountant: 'NONE' },
      },
      {
        feature: 'Xóa & Thu Hồi Tài Khoản Nhân Sự',
        desc: 'Xóa tài khoản nhân viên đã nghỉ việc khỏi hệ thống MySQL',
        roles: { admin: 'FULL', sales: 'NONE', production: 'NONE', warehouse: 'NONE', accountant: 'NONE' },
      },
    ],
  },
];

// End-to-End Workflow Steps
const WORKFLOW_STEPS = [
  {
    step: 1,
    title: 'Tiếp nhận Bản vẽ & Lập Báo giá CNC',
    icon: FileText,
    primaryRole: 'Kinh doanh (Sales)',
    assistRole: 'Kỹ thuật sản xuất (Production)',
    moduleName: 'Bán hàng ➔ Báo giá CNC',
    desc: 'Nhận bản vẽ kỹ thuật 2D (DWG/PDF) & 3D (STEP/IGES) từ khách hàng. Bóc tách nguyên công gia công, tính toán giờ máy phay/tiện CNC, chi phí phôi vật liệu, dao cụ, xử lý bề mặt và hệ số lợi nhuận.',
    output: 'Bản Báo giá chi tiết có chữ ký/mộc gửi khách hàng.',
    tagColor: 'blue',
  },
  {
    step: 2,
    title: 'Xác nhận Đơn hàng (SO) & Tạm ứng',
    icon: CheckCircle2,
    primaryRole: 'Kinh doanh (Sales)',
    assistRole: 'Kế toán (Accountant)',
    moduleName: 'Bán hàng ➔ Đơn hàng (SO) & Tài chính',
    desc: 'Khách hàng chốt duyệt giá và gửi PO. Nhân viên kinh doanh chuyển Báo giá thành Đơn hàng SO chính thức trên hệ thống. Kế toán xác nhận khách thanh toán tiền cọc tạm ứng (thông thường 30% - 50%).',
    output: 'Mã Đơn hàng SO chính thức và kế hoạch giao hàng.',
    tagColor: 'blue',
  },
  {
    step: 3,
    title: 'Chuẩn bị Vật tư Phôi & Dao cụ',
    icon: Package,
    primaryRole: 'Thủ kho (Warehouse)',
    assistRole: 'Kỹ thuật xưởng (Production)',
    moduleName: 'Kho vật tư ➔ Tồn kho phôi & dao',
    desc: 'Thủ kho kiểm tra lượng phôi thanh nhôm 6061, thép SKD11, chíp tiện, dao phay ngón theo quy cách SO. Nếu đủ, xuất phôi cho tổ cắt. Nếu thiếu, thủ kho/quản đốc lập đề nghị tạm ứng mua phôi bổ sung ngay.',
    output: 'Phiếu xuất kho phôi & phôi thô sẵn sàng cho sản xuất.',
    tagColor: 'amber',
  },
  {
    step: 4,
    title: 'Phát Lệnh Sản Xuất (LSX) & Cắt phôi',
    icon: Factory,
    primaryRole: 'Quản đốc / Điều độ (Production)',
    assistRole: 'Kỹ thuật phôi (Production)',
    moduleName: 'Sản xuất ➔ Lệnh Sản Xuất (LSX)',
    desc: 'Phát Lệnh sản xuất LSX liên kết trực tiếp với mã SO. Thợ cắt phôi nhận phôi từ kho, tiến hành cắt theo kích thước định mức cộng lượng dư gia công, đánh dấu mã chi tiết lên phôi.',
    output: 'Lệnh sản xuất LSX ở trạng thái Đang gia công.',
    tagColor: 'cyan',
  },
  {
    step: 5,
    title: 'Gia công Phay CNC & Tiện CNC (Luân chuyển BTP)',
    icon: Workflow,
    primaryRole: 'Thợ máy CNC (Production)',
    assistRole: 'Kỹ thuật lập trình CAM (Production)',
    moduleName: 'Sản xuất ➔ Luân Chuyển BTP & NG',
    desc: 'Gá đặt đồ gá, set phôi Z0/X0, truyền file G-code và chạy máy. Sau mỗi nguyên công (Phay mặt chuẩn, Tiện chi tiết, Mài phẳng), thợ máy lập Phiếu chuyển công đoạn, ghi nhận số lượng Đạt và phế phẩm NG (nếu có lỗi).',
    output: 'BTP đạt chuẩn qua từng công đoạn, cột Tiến độ & Công đoạn cập nhật tự động.',
    tagColor: 'indigo',
  },
  {
    step: 6,
    title: 'Gia công ngoài (Nhiệt luyện / Xi mạ / Anode)',
    icon: Truck,
    primaryRole: 'Quản đốc xưởng (Production)',
    assistRole: 'Kế toán đối tác (Accountant)',
    moduleName: 'Sản xuất ➔ Gia Công Ngoài',
    desc: 'Với các chi tiết cần tôi cao tần, tôi chân không, thấm carbon, mạ crom hoặc anode nhôm đen: Lập phiếu gửi đối tác gia công ngoài. Khi nhận hàng về, đo kiểm tra độ cứng (HRC) và độ dày lớp mạ trước khi nhận kho.',
    output: 'Phiếu giao nhận gia công ngoài đã hoàn thành & đạt chuẩn bề mặt.',
    tagColor: 'purple',
  },
  {
    step: 7,
    title: 'Kiểm tra KCS / Đo kiểm QC & Nghiệm thu',
    icon: ShieldCheck,
    primaryRole: 'Kỹ sư QC / KCS (Production)',
    assistRole: 'Thủ kho (Warehouse)',
    moduleName: 'Sản xuất ➔ Nghiệm thu & Bàn giao kho',
    desc: 'KCS đo kiểm kích thước 100% hoặc theo tiêu chuẩn dung sai bản vẽ bằng máy đo 2D/3D CMM, thước panme điện tử, dưỡng ren. Xác nhận đủ số lượng đạt chuẩn, bấm "Bàn giao kho" để nhập kho thành phẩm.',
    output: 'Biên bản nghiệm thu QC & Thành phẩm lưu kho chờ xuất hàng.',
    tagColor: 'emerald',
  },
  {
    step: 8,
    title: 'Xuất Giao Hàng & Quyết toán Công nợ',
    icon: DollarSign,
    primaryRole: 'Thủ kho & Kinh doanh',
    assistRole: 'Kế toán (Accountant)',
    moduleName: 'Bán hàng ➔ Phiếu Giao Hàng & Tài chính',
    desc: 'Thủ kho và Kinh doanh lập Phiếu Giao Hàng (Delivery Note), đóng gói chống sốc màng PE/hộp xốp và giao đến nhà máy khách hàng. Kế toán phát hành hóa đơn VAT, ghi nhận doanh thu và thu hồi nợ còn lại của SO.',
    output: 'Đơn hàng hoàn tất 100% tiến độ gia công & dòng tiền thu đủ.',
    tagColor: 'emerald',
  },
];

export default function PermissionMatrixModule({
  initialSubTab = 'matrix',
  user,
  usersList = [],
  usersLoading = false,
  fetchUsers,
  regForm,
  setRegForm,
  regSubmitting = false,
  regMessage = { type: '', text: '' },
  handleRegisterUser,
  handleDeleteUser,
  editingUser,
  setEditingUser,
  editUserForm,
  setEditUserForm,
  editUserSaving,
  handleOpenEditUser,
  handleSaveEditUser,
  showEditPassword,
  setShowEditPassword,
}) {
  const { showSuccess, confirmDelete } = useToast();
  const [subTab, setSubTab] = useState(initialSubTab || 'matrix');
  const [moduleFilter, setModuleFilter] = useState('all');
  const isAdmin = user?.role === 'admin';

  // Customizable Permission Matrix State (Persisted in localStorage)
  const [matrixData, setMatrixData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cnc_erp_permission_matrix');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading saved permission matrix:', e);
        }
      }
    }
    return MATRIX_SECTIONS;
  });

  const PERM_CYCLE = ['FULL', 'ACTION', 'VIEW', 'NONE'];
  const PERM_LABELS = {
    FULL: 'Toàn quyền',
    ACTION: 'Thực hiện',
    VIEW: 'Chỉ xem',
    NONE: 'Không có quyền',
  };

  const handleCyclePermission = (moduleName, featureName, roleKey) => {
    if (!isAdmin) return;
    const next = JSON.parse(JSON.stringify(matrixData));
    const targetSec = next.find((s) => s.module === moduleName);
    if (!targetSec) return;
    const targetItem = targetSec.items.find((i) => i.feature === featureName);
    if (!targetItem) return;

    const current = targetItem.roles[roleKey] || 'NONE';
    const nextIdx = (PERM_CYCLE.indexOf(current) + 1) % PERM_CYCLE.length;
    const nextLevel = PERM_CYCLE[nextIdx];
    targetItem.roles[roleKey] = nextLevel;

    setMatrixData(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cnc_erp_permission_matrix', JSON.stringify(next));
    }
  };

  const handleResetDefault = () => {
    confirmDelete({
      title: 'Khôi Phục Phân Quyền Mặc Định',
      itemName: 'Bảng Ma Trận Phân Quyền',
      message: 'Bạn có chắc chắn muốn đặt lại toàn bộ ma trận phân quyền về cấu hình tiêu chuẩn ban đầu không?',
      confirmText: 'Đặt lại mặc định',
      onConfirm: () => {
        setMatrixData(MATRIX_SECTIONS);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cnc_erp_permission_matrix');
        }
        showSuccess('Đã khôi phục mặc định!', 'Ma trận phân quyền đã được đưa về cấu hình gốc.');
      },
    });
  };

  const handleSaveMatrix = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cnc_erp_permission_matrix', JSON.stringify(matrixData));
    }
    showSuccess('Đã lưu cấu hình!', 'Cấu hình ma trận phân quyền đã được lưu thành công.');
  };

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const filteredSections = moduleFilter === 'all'
    ? matrixData
    : matrixData.filter((sec) => sec.module.toLowerCase().includes(moduleFilter.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'matrix'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Ma Trận Phân Quyền Vai Trò</span>
          </button>

          <button
            onClick={() => setSubTab('workflow')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'workflow'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Workflow className="w-4 h-4 text-indigo-600" />
            <span>Quy Trình 8 Bước Khép Kín</span>
          </button>

          <button
            onClick={() => setSubTab('users')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'users'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Tài Khoản & Cấp Quyền</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'users' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
              {usersList.length}
            </span>
          </button>
        </div>

        {subTab === 'users' && (
          <button
            onClick={fetchUsers}
            disabled={usersLoading}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            Làm mới danh sách
          </button>
        )}
      </div>

      {/* ===================== TAB 1: MA TRẬN PHÂN QUYỀN ===================== */}
      {subTab === 'matrix' && (
        <div className="space-y-6">
          {/* Header Summary & Legend */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Ma Trận Phân Quyền Chức Năng Theo 5 Vai Trò CNC-ERP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đảm bảo nguyên tắc bảo mật và đúng nhiệm vụ: Mỗi vai trò chỉ thao tác đúng các phân hệ & nghiệp vụ được ủy quyền.
                </p>
              </div>

              {/* Quick Legend */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Quy ước quyền:</span>
                <PermBadge level="FULL" />
                <PermBadge level="ACTION" />
                <PermBadge level="VIEW" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                  <Minus className="w-3 h-3" />
                  Không quyền
                </span>
              </div>
            </div>

            {/* Filter buttons by module */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-600 mr-1">Lọc phân hệ:</span>
              {[
                { id: 'all', label: 'Tất cả phân hệ' },
                { id: 'bán hàng', label: 'Bán hàng (Sales)' },
                { id: 'kho', label: 'Kho vật tư (Warehouse)' },
                { id: 'sản xuất', label: 'Sản xuất CNC (Production)' },
                { id: 'tài chính', label: 'Tài chính (Finance)' },
                { id: 'báo cáo', label: 'Báo cáo & Hệ thống' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setModuleFilter(btn.id)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    moduleFilter === btn.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Admin action bar */}
            {isAdmin && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold shrink-0">💡 Chế độ Quản trị (Admin):</span>
                  <span>Bấm trực tiếp vào bất kỳ ô phân quyền nào để đổi quyền: <strong>[Toàn quyền ➔ Thực hiện ➔ Chỉ xem ➔ Không quyền]</strong>.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleResetDefault}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                    title="Khôi phục phân quyền mặc định"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Đặt lại mặc định
                  </button>
                  <button
                    onClick={handleSaveMatrix}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    title="Lưu cấu hình phân quyền"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Matrix Tables */}
          <div className="space-y-6">
            {filteredSections.map((sec, secIdx) => {
              const SecIcon = sec.icon;
              return (
                <div key={secIdx} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <SecIcon className="w-4 h-4 text-blue-600" />
                      <span>{sec.module}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      {sec.items.length} chức năng
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[950px]">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-white">
                          <th className="py-3 px-4 w-1/3">Chức Năng & Nghiệp Vụ</th>
                          <th className="py-3 px-3 text-center w-28 text-rose-700 bg-rose-50/30">
                            Admin (Quản trị)
                          </th>
                          <th className="py-3 px-3 text-center w-28 text-blue-700 bg-blue-50/30">
                            Sales (Kinh doanh)
                          </th>
                          <th className="py-3 px-3 text-center w-32 text-cyan-700 bg-cyan-50/30">
                            Production (Sản xuất)
                          </th>
                          <th className="py-3 px-3 text-center w-28 text-amber-700 bg-amber-50/30">
                            Warehouse (Thủ kho)
                          </th>
                          <th className="py-3 px-3 text-center w-28 text-emerald-700 bg-emerald-50/30">
                            Accountant (Kế toán)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {sec.items.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">{row.feature}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{row.desc}</div>
                            </td>
                            <td className="py-3 px-3 text-center bg-rose-50/10">
                              <PermBadge
                                level={row.roles.admin}
                                isEditable={isAdmin}
                                onClick={() => handleCyclePermission(sec.module, row.feature, 'admin')}
                                title="Admin (Quản trị): Bấm để thay đổi quyền"
                              />
                            </td>
                            <td className="py-3 px-3 text-center bg-blue-50/10">
                              <PermBadge
                                level={row.roles.sales}
                                isEditable={isAdmin}
                                onClick={() => handleCyclePermission(sec.module, row.feature, 'sales')}
                                title="Sales (Kinh doanh): Bấm để thay đổi quyền"
                              />
                            </td>
                            <td className="py-3 px-3 text-center bg-cyan-50/10">
                              <PermBadge
                                level={row.roles.production}
                                isEditable={isAdmin}
                                onClick={() => handleCyclePermission(sec.module, row.feature, 'production')}
                                title="Production (Sản xuất): Bấm để thay đổi quyền"
                              />
                            </td>
                            <td className="py-3 px-3 text-center bg-amber-50/10">
                              <PermBadge
                                level={row.roles.warehouse}
                                isEditable={isAdmin}
                                onClick={() => handleCyclePermission(sec.module, row.feature, 'warehouse')}
                                title="Warehouse (Thủ kho): Bấm để thay đổi quyền"
                              />
                            </td>
                            <td className="py-3 px-3 text-center bg-emerald-50/10">
                              <PermBadge
                                level={row.roles.accountant}
                                isEditable={isAdmin}
                                onClick={() => handleCyclePermission(sec.module, row.feature, 'accountant')}
                                title="Accountant (Kế toán): Bấm để thay đổi quyền"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: QUY TRÌNH 8 BƯỚC KHÉP KÍN ===================== */}
      {subTab === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600" />
              Quy Trình 8 Bước Vận Hành Doanh Nghiệp Chế Tạo Cơ Khí Chính Xác CNC
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Luồng thông tin và sản phẩm khép kín từ khi khách gửi bản vẽ cho đến khi bàn giao kho, giao hàng và quyết toán dòng tiền.
            </p>
          </div>

          {/* Stepper Timeline Cards */}
          <div className="space-y-4">
            {WORKFLOW_STEPS.map((ws) => {
              const StepIcon = ws.icon;
              return (
                <div
                  key={ws.step}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition duration-150 flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden group"
                >
                  {/* Step Number Left Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-base border border-blue-200 shadow-xs group-hover:scale-105 transition">
                      #{ws.step}
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{ws.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {ws.moduleName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ws.desc}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-semibold">Chịu trách nhiệm chính:</span>
                        <strong className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                          {ws.primaryRole}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-semibold">Phối hợp:</span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {ws.assistRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Output Box Right */}
                  <div className="w-full md:w-64 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Kết quả đầu ra (Output):
                    </span>
                    <span className="font-semibold text-emerald-700 leading-normal block">
                      ✓ {ws.output}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: TÀI KHOẢN & CẤP QUYỀN ===================== */}
      {subTab === 'users' && (
        <div className="space-y-6">
          {/* Role Cards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(ROLE_DEFINITIONS).map(([rKey, rDef]) => (
              <div key={rKey} className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-xs">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mb-1.5 ${rDef.color}`}>
                  {rKey.toUpperCase()}
                </span>
                <h4 className="font-bold text-xs text-slate-900">{rDef.label}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {rKey === 'admin' && 'Toàn quyền 5 phân hệ, phê duyệt chi ngân sách và tạo tài khoản.'}
                  {rKey === 'sales' && 'Bóc tách bản vẽ, tính giờ máy, lập báo giá và theo dõi đơn hàng SO.'}
                  {rKey === 'production' && 'Phát LSX, điều độ máy CNC, ghi nhận lỗi NG, chuyển bước và giao kho.'}
                  {rKey === 'warehouse' && 'Quản lý kho phôi thép nhôm, xuất phôi gia công, xuất kho thành phẩm.'}
                  {rKey === 'accountant' && 'Duyệt tạm ứng, thanh toán NCC, đối soát dòng tiền và sổ công nợ.'}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Registration Form Card */}
            {isAdmin ? (
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      Đăng Ký & Cấp Quyền Tài Khoản Mới
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Tạo tài khoản phân quyền nhân sự xưởng CNC</p>
                  </div>
                </div>

                {regMessage?.text && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      regMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {regMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{regMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterUser} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên nhân viên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm?.full_name || ''}
                      onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                      placeholder="VD: Trần Văn Bình"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên đăng nhập <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm?.username || ''}
                        onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                        placeholder="VD: binhtv"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regForm?.password || ''}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm?.email || ''}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="VD: binhtv@cnc.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phân quyền vai trò (Role) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regForm?.role || 'sales'}
                      onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium"
                    >
                      <option value="sales">Kinh doanh (Sales) - Báo giá, đơn hàng SO</option>
                      <option value="production">Sản xuất (Production) - Lập LSX, điều độ máy CNC</option>
                      <option value="warehouse">Kho vật tư (Warehouse) - Quản lý phôi, dao cụ</option>
                      <option value="accountant">Kế toán (Accountant) - Tạm ứng, thanh toán, công nợ</option>
                      <option value="admin">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={regSubmitting}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      {regSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Phân Quyền'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center justify-center text-center">
                <Lock className="w-10 h-10 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">Chỉ Quản Trị Viên (Admin)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Bạn đang đăng nhập với vai trò <strong className="text-blue-600">{user?.role}</strong>. Chỉ tài khoản Admin mới có quyền tạo và chỉnh sửa phân quyền người dùng.
                </p>
              </div>
            )}

            {/* Users List Table Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
              <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh Sách Tài Khoản Trong Hệ Thống ({usersList.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dữ liệu nhân viên lưu trữ thực tế từ MySQL Database</p>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <Table
                  isLoading={usersLoading}
                  data={usersList}
                  emptyMessage="Chưa có dữ liệu người dùng."
                  columns={[
                    {
                      header: 'Nhân viên',
                      render: (row) => (
                        <div>
                          <div className="font-bold text-slate-800">{row.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{row.email}</div>
                        </div>
                      ),
                    },
                    {
                      header: 'Tên Đăng Nhập',
                      accessor: 'username',
                      cellClassName: 'font-mono font-semibold text-slate-700 text-xs',
                    },
                    {
                      header: 'Vai Trò (Role)',
                      render: (row) => {
                        const rDef = ROLE_DEFINITIONS[row.role] || { label: row.role, color: 'bg-slate-100 text-slate-700' };
                        return (
                          <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md border ${rDef.color}`}>
                            {rDef.label}
                          </span>
                        );
                      },
                    },
                    {
                      header: 'Thao Tác',
                      render: (row) => {
                        const isSelf = row.id === user?.id;
                        return (
                          <div className="flex items-center gap-1.5">
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenEditUser && handleOpenEditUser(row)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Chỉnh sửa tài khoản"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {isAdmin && !isSelf && (
                              <button
                                onClick={() => handleDeleteUser && handleDeleteUser(row)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Xóa tài khoản nhân viên"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {isSelf && (
                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                Đang đăng nhập
                              </span>
                            )}
                          </div>
                        );
                      },
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Chỉnh Sửa Tài Khoản: @${editingUser.username}`}
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEditUser}
                disabled={editUserSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {editUserSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveEditUser} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên nhân viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editUserForm?.full_name || ''}
                onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editUserForm?.phone || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  placeholder="VD: 0987654321"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email công việc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editUserForm?.email || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vai trò (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editUserForm?.role || 'sales'}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="sales">Kinh doanh (Sales)</option>
                  <option value="production">Sản xuất (Production)</option>
                  <option value="warehouse">Thủ kho (Warehouse)</option>
                  <option value="accountant">Kế toán (Accountant)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={editUserForm?.status || 'active'}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đặt lại mật khẩu mới (Reset Password)
              </label>
              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editUserForm?.password || ''}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Để trống nếu giữ nguyên mật khẩu cũ"
                  className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                  title={showEditPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Chỉ nhập khi cần cấp lại mật khẩu mới cho nhân viên.
              </p>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
