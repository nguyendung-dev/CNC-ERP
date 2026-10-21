'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  Home, 
  ShoppingCart, 
  Package, 
  Factory, 
  CreditCard, 
  BarChart3, 
  SlidersHorizontal, 
  Bell, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  UserPlus,
  Users,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Layers,
  Truck,
  FileText,
  DollarSign,
  Pencil,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Layout Shared Components
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

// Modules
import SalesModule from '../components/modules/SalesModule';
import InventoryModule from '../components/modules/InventoryModule';
import ProductionModule from '../components/modules/ProductionModule';
import FinanceModule from '../components/modules/FinanceModule';
import ReportsModule from '../components/modules/ReportsModule';
import CustomersModule from '../components/modules/CustomersModule';

export default function DashboardPage() {
  const { user, token, isLoading, logout, ROLE_LABELS } = useAuth();
  const { showSuccess, showError, confirmDelete } = useToast();
  const router = useRouter();

  // Authentication Guard: require login before entering dashboard
  useEffect(() => {
    if (!isLoading && (!user || !token)) {
      router.replace('/login');
    }
  }, [user, token, isLoading, router]);

  const [activeNav, setActiveNav] = useState('home'); // 'home' | 'sales' | 'inventory' | 'production' | 'finance' | 'reports' | 'settings'

  // CNC Operational Data from real MySQL
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [subcontracts, setSubcontracts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters for Pending Tasks on Dashboard
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all');
  const [taskModuleFilter, setTaskModuleFilter] = useState('all');

  // User Management & Registration States (Embedded in Settings / RBAC tab)
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [regForm, setRegForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regMessage, setRegMessage] = useState({ type: '', text: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resAdv, resQuotes, resOrders, resStock, resSub, resStats, resWorkshops, resDeliveries, resPayments] = await Promise.allSettled([
        api.get('/finance/advances'),
        api.get('/sales/quotations'),
        api.get('/sales/orders'),
        api.get('/inventory/materials/alerts/low-stock'),
        api.get('/production/subcontracting'),
        api.get('/reports/dashboard'),
        api.get('/workshops'),
        api.get('/sales/delivery-notes'),
        api.get('/finance/payments'),
      ]);

      const advances = resAdv.status === 'fulfilled' ? (resAdv.value.data || []) : [];
      const quotes = resQuotes.status === 'fulfilled' ? (resQuotes.value.data || []) : [];
      const orders = resOrders.status === 'fulfilled' ? (resOrders.value.data || []) : [];
      const lowStock = resStock.status === 'fulfilled' ? (resStock.value.data || []) : [];
      const subs = resSub.status === 'fulfilled' ? (resSub.value.data || []) : [];
      const wsList = resWorkshops.status === 'fulfilled' ? (resWorkshops.value.data || []) : [];
      const deliveries = resDeliveries.status === 'fulfilled' ? (resDeliveries.value.data || []) : [];
      const payments = resPayments.status === 'fulfilled' ? (resPayments.value.data || []) : [];

      setLowStockAlerts(lowStock);
      setSubcontracts(subs);
      setWorkshops(wsList);
      if (wsList.length > 0 && !selectedWorkshopId) {
        setSelectedWorkshopId(wsList[0].id);
      }
      setDashboardStats(resStats.status === 'fulfilled' ? resStats.value.data : null);

      // Pending action items specifically for CNC Shop
      const tasks = [];

      // Pending advances
      advances
        .filter((a) => a.status === 'pending')
        .forEach((a) => {
          tasks.push({
            id: a.id,
            category: 'Tạm ứng mua phôi / gia công',
            tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
            title: a.purpose,
            requester: a.requester,
            time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(a.created_at).toLocaleDateString('vi-VN'),
            amount: `${Number(a.amount).toLocaleString()} đ`,
            actionType: 'advance',
          });
        });

      // Draft Quotations awaiting customer confirmation
      quotes
        .filter((q) => q.status === 'draft')
        .forEach((q) => {
          tasks.push({
            id: q.id,
            category: 'Báo giá CNC chờ duyệt',
            tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
            title: `Báo giá chi tiết: ${q.part_name} - Khách: ${q.customer_name}`,
            requester: 'Bộ phận Kinh doanh CNC',
            time: new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(q.created_at).toLocaleDateString('vi-VN'),
            amount: `${Number(q.total_amount).toLocaleString()} đ`,
            actionType: 'quotation',
          });
        });

      // Subcontracts awaiting QC receipt
      subs
        .filter((s) => s.status === 'sent')
        .forEach((s) => {
          tasks.push({
            id: s.id,
            category: 'Gia công ngoài chờ nhận & QC',
            tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            title: `Nhận ${s.send_qty} chi tiết ${s.part_name} từ ${s.vendor_name} (${s.process_type})`,
            requester: 'Xưởng gia công ngoài',
            time: 'Hạn trả',
            date: s.promise_date ? new Date(s.promise_date).toLocaleDateString('vi-VN') : 'Sớm nhất',
            amount: `${Number(s.total_cost).toLocaleString()} đ`,
            actionType: 'subcontract',
          });
        });

      // Delivery Notes awaiting warehouse inspection & export
      deliveries
        .filter((d) => d.status === 'pending_warehouse')
        .forEach((d) => {
          tasks.push({
            id: d.id,
            category: 'Phiếu XK chờ kiểm hàng & xuất kho',
            tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
            title: `Xuất ${d.delivery_qty} chi tiết cho khách hàng ${d.customer_name}`,
            requester: d.created_by || 'Bộ phận Kinh doanh',
            time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(d.created_at).toLocaleDateString('vi-VN'),
            amount: `${d.delivery_qty} chi tiết`,
            actionType: 'delivery',
          });
        });

      // Payment Requests awaiting Admin approval
      payments
        .filter((p) => p.status === 'pending')
        .forEach((p) => {
          tasks.push({
            id: p.id,
            category: 'Đề nghị thanh toán chi tiền',
            tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
            title: `Chi tiền cho ${p.recipient} (${p.category})`,
            requester: 'Bộ phận Kế toán',
            time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(p.created_at).toLocaleDateString('vi-VN'),
            amount: `${Number(p.net_amount).toLocaleString()} đ`,
            actionType: 'payment',
          });
        });

      setPendingTasks(tasks);
      setActiveOrders(orders);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadData();
    }
  }, [user, token]);

  const handleApprove = async (task) => {
    if (task.actionType === 'advance') {
      try {
        await api.patch(`/finance/advances/${task.id}/approve`);
        showSuccess('Phê duyệt thành công', 'Phiếu đề nghị tạm ứng đã được phê duyệt hợp lệ.');
        loadData();
      } catch (err) {
        showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
      }
    } else if (task.actionType === 'quotation') {
      try {
        await api.post(`/sales/quotations/${task.id}/convert-to-so`);
        showSuccess('Duyệt báo giá thành công!', 'Đã tạo Đơn đặt hàng (SO) từ báo giá.');
        loadData();
      } catch (err) {
        showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
      }
    } else if (task.actionType === 'payment') {
      try {
        await api.patch(`/finance/payments/${task.id}/approve`);
        showSuccess('Duyệt chi thành công!', 'Phiếu thanh toán đã được phê duyệt chi tiền.');
        loadData();
      } catch (err) {
        showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
      }
    } else if (task.actionType === 'delivery') {
      try {
        await api.post(`/sales/delivery-notes/${task.id}/confirm-export`);
        showSuccess('Xuất kho thành công!', 'Đã xác nhận kiểm hàng và xuất kho thành công.');
        loadData();
      } catch (err) {
        showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
      }
    } else if (task.actionType === 'subcontract') {
      try {
        await api.patch(`/production/subcontracting/${task.id}`, {
          status: 'received',
          received_qty: 50,
          qc_passed_qty: 50,
        });
        showSuccess('Nghiệm thu thành công!', 'Đã nhận hàng gia công ngoài về kho.');
        loadData();
      } catch (err) {
        showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
      }
    } else {
      setPendingTasks(pendingTasks.filter((t) => t.id !== task.id));
      showSuccess('Xử lý thành công!', 'Đã hoàn thành công việc được giao.');
    }
  };

  const handleReject = async (task) => {
    try {
      if (task.actionType === 'advance') {
        await api.patch(`/finance/advances/${task.id}/reject`);
      } else if (task.actionType === 'quotation') {
        await api.post(`/sales/quotations/${task.id}/reject`);
      } else if (task.actionType === 'payment') {
        await api.patch(`/finance/payments/${task.id}/reject`);
      }
      showSuccess('Đã từ chối!', 'Yêu cầu đã được cập nhật trạng thái từ chối trong hệ thống.');
      loadData();
    } catch (err) {
      setPendingTasks(pendingTasks.filter((t) => t.id !== task.id));
      showSuccess('Từ chối công việc', 'Nhiệm vụ đã được cập nhật.');
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res && res.data) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch /auth/users from API, using default roles list:', err);
      // Fallback demo users list to prevent UI breakage
      setUsersList([
        { id: 1, full_name: 'Nguyễn Văn Quản Trị', username: 'admin', email: 'admin@cnc.com', role: 'admin' },
        { id: 2, full_name: 'Trần Thị Kinh Doanh', username: 'sales', email: 'sales@cnc.com', role: 'sales' },
        { id: 3, full_name: 'Lê Văn Sản Xuất', username: 'production', email: 'prod@cnc.com', role: 'production' },
        { id: 4, full_name: 'Hoàng Văn Thủ Kho', username: 'warehouse', email: 'kho@cnc.com', role: 'warehouse' },
        { id: 5, full_name: 'Phạm Thị Kế Toán', username: 'accountant', email: 'ketoan@cnc.com', role: 'accountant' },
      ]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'settings') {
      fetchUsers();
    }
  }, [activeNav]);

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      showError('Không có quyền', 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền tạo tài khoản nhân viên mới!');
      return;
    }
    setRegSubmitting(true);
    setRegMessage({ type: '', text: '' });
    try {
      await api.post('/auth/register', regForm);
      setRegMessage({
        type: 'success',
        text: `Đã tạo tài khoản thành công cho "${regForm.full_name}"!`,
      });
      setRegForm({
        full_name: '',
        username: '',
        email: '',
        password: '',
        role: 'sales',
      });
      fetchUsers();
    } catch (err) {
      setRegMessage({
        type: 'error',
        text: err.message || 'Lỗi khi đăng ký tài khoản.',
      });
    } finally {
      setRegSubmitting(false);
    }
  };

  // User Management Pagination & CRUD
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(5);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'sales',
    status: 'active',
    password: '',
  });
  const [editUserSaving, setEditUserSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setEditUserForm({
      full_name: u?.full_name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      role: u?.role || 'sales',
      status: u?.status || 'active',
      password: '',
    });
  };

  const handleSaveEditUser = async (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    setEditUserSaving(true);
    try {
      const payload = {
        full_name: editUserForm.full_name,
        email: editUserForm.email,
        phone: editUserForm.phone,
        role: editUserForm.role,
        status: editUserForm.status,
      };
      if (editUserForm.password && editUserForm.password.trim() !== '') {
        payload.password = editUserForm.password.trim();
      }
      await api.put('/auth/users/' + editingUser.id, payload);
      showSuccess('Cập nhật thành công!', 'Đã cập nhật thông tin tài khoản "' + editingUser.username + '".');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showError('Lỗi cập nhật', err.response?.data?.message || err.message);
    } finally {
      setEditUserSaving(false);
    }
  };

  const handleDeleteUser = (u) => {
    if (u.id === 1) {
      showError('Không thể xóa', 'Không thể xóa tài khoản Quản trị viên hệ thống mặc định!');
      return;
    }
    if (u.id === user?.id) {
      showError('Không thể xóa', 'Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập!');
      return;
    }
    confirmDelete({
      title: 'Xác Nhận Xóa Tài Khoản Nhân Viên',
      itemName: u.full_name + ' (@' + u.username + ')',
      message: 'Bạn có chắc chắn muốn xóa tài khoản "' + u.full_name + '" (@' + u.username + ') khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/auth/users/' + u.id);
          showSuccess('Đã xóa thành công!', 'Đã xóa tài khoản "' + u.full_name + '" khỏi hệ thống.');
          fetchUsers();
        } catch (err) {
          showError('Lỗi xóa tài khoản', err.response?.data?.message || err.message);
        }
      },
    });
  };

  // Role-based Nav Permissions Map: Only Admin sees all 7 modules!
  const ROLE_NAV_PERMISSIONS = {
    admin: ['home', 'sales', 'customers', 'inventory', 'production', 'finance', 'reports', 'settings'],
    sales: ['home', 'sales', 'customers', 'inventory'],
    production: ['home', 'production', 'inventory'],
    warehouse: ['home', 'inventory', 'production'],
    accountant: ['home', 'finance', 'sales', 'customers', 'reports'],
  };

  const allowedNavIds = (user && ROLE_NAV_PERMISSIONS[user.role]) || ['home'];

  const allNavItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'sales', label: 'Bán hàng', icon: ShoppingCart },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'inventory', label: 'Kho vật tư', icon: Package },
    { id: 'production', label: 'Sản xuất', icon: Factory },
    { id: 'finance', label: 'Tài chính', icon: CreditCard },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'settings', label: 'Phân quyền', icon: SlidersHorizontal },
  ];

  const navItems = allNavItems.filter((item) => allowedNavIds.includes(item.id));

  // Page Titles Map (passed as prop to AppHeader, prominent & bold)
  const pageTitles = {
    home: 'Trang chủ',
    sales: 'Quản lý Bán Hàng & Báo Giá',
    customers: 'Quản Lý Danh Mục Khách Hàng & Đối Tác',
    inventory: 'Quản lý Kho Phôi & Dao Cụ',
    production: 'Quản lý Sản Xuất & Điều Độ Máy',
    finance: 'Quản lý Tài Chính & Dòng Tiền',
    reports: 'Báo Cáo & Phân Tích Quản Trị',
    settings: 'Phân Quyền Vai Trò Người Dùng (RBAC)',
  };

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Đang kiểm tra quyền truy cập hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex flex-col font-sans text-slate-800">
      {/* 1. Standardized AppHeader Component */}
      <AppHeader
        pageTitle={pageTitles[activeNav] || 'Trang chủ'}
        workspaceName="CNC-ERP Workspace"
        sidebarWidthClass="w-24 md:w-28"
        onLogoClick={() => {
          setActiveNav('home');
        }}
        onSelectModule={(module) => {
          setActiveNav(module);
        }}
        user={user}
        logout={logout}
        roleLabels={ROLE_LABELS}
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={(id) => setActiveNav(id)}
      />

      {/* 2. Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Standardized Left Sidebar Component */}
        <Sidebar
          items={navItems}
          activeNav={activeNav}
          onNavChange={(id) => setActiveNav(id)}
          widthClass="w-24 md:w-28"
          showSeparatorAfterFirst={true}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
          {/* Permission Guard: Unauthorized Access Denied */}
          {!allowedNavIds.includes(activeNav) && (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Không Có Quyền Truy Cập</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tài khoản của bạn ({ROLE_LABELS[user?.role] || user?.role}) không được phân quyền truy cập phân hệ này. Chỉ Quản trị viên (Admin) mới có toàn quyền xem tất cả các mục.
                </p>
              </div>
              <button
                onClick={() => setActiveNav('home')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              >
                Quay về Trang chủ
              </button>
            </div>
          )}

          {/* Module Views (Guarded by permission) */}
          {activeNav === 'sales' && <SalesModule />}
          {activeNav === 'customers' && <CustomersModule />}
          {activeNav === 'inventory' && <InventoryModule />}
          {activeNav === 'production' && <ProductionModule />}
          {activeNav === 'finance' && <FinanceModule />}
          {activeNav === 'reports' && <ReportsModule />}

          {/* Settings / RBAC View with Integrated User Registration & User Accounts Table */}
          {activeNav === 'settings' && (
            <div className="space-y-6">
              {/* Header & Role Overview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      Phân Quyền Vai Trò Người Dùng (RBAC) & Quản Trị Nhân Viên
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phân quyền truy cập các module gia công cơ khí chính xác theo đúng chức danh & nhiệm vụ.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={fetchUsers}
                      disabled={usersLoading}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                      Làm mới dữ liệu
                    </button>
                  </div>
                </div>

                {/* 5 Standard CNC Roles Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 hover:border-blue-200 transition">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200 mb-1.5">
                      Admin
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Quản trị viên</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Toàn quyền 5 phân hệ, phê duyệt tạm ứng ngân sách, cấu hình hệ thống & phân quyền.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 hover:border-blue-200 transition">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                      Sales
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Kinh doanh</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Bóc tách chi tiết, lập Báo giá CNC (phôi, máy, ngoài), theo dõi đơn đặt hàng (SO).
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 hover:border-blue-200 transition">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-50 text-cyan-700 border border-cyan-200 mb-1.5">
                      Production
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Sản xuất</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Lập LSX, điều độ máy CNC, ghi nhận sản lượng & tỷ lệ lỗi NG, theo dõi gia công ngoài.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 hover:border-blue-200 transition">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 mb-1.5">
                      Warehouse
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Thủ kho</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Quản lý kho phôi kim loại, dao cụ phụ tùng, cảnh báo min-stock, xuất kho sản xuất.
                    </p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/70 hover:border-blue-200 transition">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                      Accountant
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Kế toán</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Duyệt tạm ứng phôi, lập đề nghị thanh toán NCC có cấn trừ, theo dõi sổ công nợ.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Section: Registration Form + Users Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Registration Form Card (approx 4.5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        Đăng Ký & Thêm Tài Khoản Mới
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Tạo tài khoản phân quyền nhân sự xưởng CNC</p>
                    </div>
                  </div>

                  {regMessage.text && (
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
                        value={regForm.full_name}
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
                          value={regForm.username}
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
                          value={regForm.password}
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
                        value={regForm.email}
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
                        value={regForm.role}
                        onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      >
                        <option value="sales">Kinh doanh (Sales) - Báo giá, đơn hàng SO</option>
                        <option value="production">Sản xuất (Production) - Lập LSX, điều độ máy</option>
                        <option value="warehouse">Kho vật tư (Warehouse) - Quản lý phôi, dao cụ</option>
                        <option value="accountant">Kế toán (Accountant) - Tạm ứng, thanh toán, công nợ</option>
                        <option value="admin">Quản trị viên (Admin) - Toàn quyền hệ thống</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={regSubmitting}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        {regSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản & Phân Quyền'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Users List Table Card (approx 7.5 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col">
                  <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Danh Sách Tài Khoản Trong Hệ Thống ({usersList.length})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Dữ liệu tài khoản lưu trữ thực tế từ MySQL Database</p>
                    </div>
                  </div>

                    <div className="flex-1 overflow-x-auto">
                      {usersLoading ? (
                        <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                          Đang tải danh sách tài khoản...
                        </div>
                      ) : usersList.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                          Chưa có dữ liệu người dùng. Vui lòng bấm &quot;Làm mới dữ liệu&quot;.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                              <th className="py-2.5 px-3">Nhân viên</th>
                              <th className="py-2.5 px-3">Email & Tên đăng nhập</th>
                              <th className="py-2.5 px-3">Phân quyền</th>
                              <th className="py-2.5 px-3 text-center">Trạng thái</th>
                              <th className="py-2.5 px-3 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {usersList
                              .slice((userPage - 1) * userPageSize, userPage * userPageSize)
                              .map((u) => {
                              const roleColor = {
                                admin: 'bg-rose-50 text-rose-700 border-rose-200',
                                sales: 'bg-blue-50 text-blue-700 border-blue-200',
                                production: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                                warehouse: 'bg-amber-50 text-amber-700 border-amber-200',
                                accountant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              }[u.role] || 'bg-slate-100 text-slate-700 border-slate-200';

                              return (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{u.full_name}</p>
                                        <span className="text-[10px] text-slate-400">ID #{u.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <p className="text-slate-700 font-medium">{u.email}</p>
                                    <p className="text-[10px] text-slate-400">@{u.username}</p>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleColor}`}>
                                      {ROLE_LABELS[u.role] || u.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <Badge status={u.status || "active"} />
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditUser(u)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Chỉnh sửa tài khoản"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      {u.id !== 1 && u.id !== user?.id && (
                                        <button
                                          onClick={() => handleDeleteUser(u)}
                                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                          title="Xóa tài khoản"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Pagination for Users List */}
                    {usersList.length > 0 && (
                      <Pagination
                        currentPage={userPage}
                        totalItems={usersList.length}
                        pageSize={userPageSize}
                        onPageChange={setUserPage}
                        onPageSizeChange={(newSize) => {
                          setUserPageSize(newSize);
                          setUserPage(1);
                        }}
                        pageSizeOptions={[5, 10, 20]}
                      />
                    )}
                  </div>
                </div>

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
                          value={editUserForm.full_name || ''}
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
                            value={editUserForm.phone || ''}
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
                            value={editUserForm.email || ''}
                            onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Phân quyền vai trò <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={editUserForm.role || 'sales'}
                            onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                          >
                            <option value="sales">Kinh doanh (Sales)</option>
                            <option value="production">Sản xuất (Production)</option>
                            <option value="warehouse">Kho vật tư (Warehouse)</option>
                            <option value="accountant">Kế toán (Accountant)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Trạng thái tài khoản <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={editUserForm.status || 'active'}
                            onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                          >
                            <option value="active">Hoạt động (Active)</option>
                            <option value="inactive">Tạm khóa (Inactive)</option>
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
                            value={editUserForm.password || ''}
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
          )}

          {/* HOME OVERVIEW - CNC MANUFACTURING DASHBOARD */}
          {activeNav === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Operations & Approvals (approx 65%) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Card 1: Việc cần xử lý & phê duyệt trong xưởng */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 shrink-0">
                      Việc cần xử lý & phê duyệt ({
                        pendingTasks.filter((task) => {
                          if (taskCategoryFilter !== 'all' && task.actionType !== taskCategoryFilter) return false;
                          if (taskModuleFilter !== 'all') {
                            if (taskModuleFilter === 'finance' && task.actionType !== 'advance') return false;
                            if (taskModuleFilter === 'sales' && task.actionType !== 'quotation') return false;
                          }
                          return true;
                        }).length
                      })
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <select
                        value={taskCategoryFilter}
                        onChange={(e) => setTaskCategoryFilter(e.target.value)}
                        className="text-xs border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
                      >
                        <option value="all">Tất cả việc</option>
                        <option value="advance">Đề nghị tạm ứng</option>
                        <option value="quotation">Chờ duyệt báo giá</option>
                      </select>

                      <select
                        value={taskModuleFilter}
                        onChange={(e) => setTaskModuleFilter(e.target.value)}
                        className="text-xs border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
                      >
                        <option value="all">Tất cả phân hệ</option>
                        <option value="finance">Tài chính - Kế toán</option>
                        <option value="sales">Kinh doanh & Báo giá</option>
                      </select>
                    </div>
                  </div>

                  {/* List of CNC pending tasks */}
                  <div className="divide-y divide-slate-100">
                    {pendingTasks.filter((task) => {
                      if (taskCategoryFilter !== 'all' && task.actionType !== taskCategoryFilter) return false;
                      if (taskModuleFilter !== 'all') {
                        if (taskModuleFilter === 'finance' && task.actionType !== 'advance') return false;
                        if (taskModuleFilter === 'sales' && task.actionType !== 'quotation') return false;
                      }
                      return true;
                    }).length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Không có công việc nào cần xử lý theo bộ lọc đã chọn.
                      </div>
                    ) : (
                      pendingTasks
                        .filter((task) => {
                          if (taskCategoryFilter !== 'all' && task.actionType !== taskCategoryFilter) return false;
                          if (taskModuleFilter !== 'all') {
                            if (taskModuleFilter === 'finance' && task.actionType !== 'advance') return false;
                            if (taskModuleFilter === 'sales' && task.actionType !== 'quotation') return false;
                          }
                          return true;
                        })
                        .map((task) => (
                      <div
                        key={task.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition"
                      >
                        {/* Task Information */}
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            CNC
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">
                                {task.requester}
                              </span>
                              <span className="text-[11px] font-mono text-blue-600 font-bold">
                                {task.amount}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{task.time} • {task.date}</span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1 font-medium">{task.title}</p>
                          </div>
                        </div>

                        {/* Category Tag & Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-50 sm:border-0">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${task.tagColor}`}>
                            {task.category}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {user?.role === 'admin' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(task)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Duyệt
                                </button>
                                <button
                                  onClick={() => handleReject(task)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-400 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Từ chối
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                Chờ Admin duyệt
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>

                {/* Card 2: Tiến độ Đơn hàng (SO) & Lệnh sản xuất (LSX) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Đơn hàng (SO) & Tiến độ gia công xưởng ({activeOrders.length})
                    </h2>
                    <button
                      onClick={() => setActiveNav('sales')}
                      className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1 self-start sm:self-auto"
                    >
                      Xem tất cả đơn hàng <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activeOrders.map((order) => {
                      const percent = Math.min(100, Math.round((order.delivered_qty / order.order_qty) * 100));
                      return (
                        <div
                          key={order.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-600">{order.code}</span>
                              <span className="font-semibold text-xs text-slate-900">{order.part_name}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Khách hàng: <strong className="text-slate-700">{order.customer_name}</strong> • Bản vẽ: <span className="font-mono">{order.drawing_code || '---'}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Hạn giao hàng: {order.delivery_deadline || 'Theo kế hoạch'} • Giá trị: {Number(order.total_price).toLocaleString()} đ
                            </p>
                          </div>

                          <div className="w-full sm:w-64 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600 font-medium">Đã giao: {order.delivered_qty}/{order.order_qty}</span>
                              <span className="font-bold text-blue-600">{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between gap-3">
                              <span>Dở dang WIP: <strong className="text-slate-700">{order.wip_qty}</strong></span>
                              <Badge status={order.status}>{order.status}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: CNC Workshop Status & MRP Alerts (approx 35%) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Widget 1: Tình trạng Vận hành Xưởng máy CNC */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="text-sm font-bold text-slate-900">
                      Tổ máy & Ca gia công CNC
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                      Hôm nay
                    </span>
                  </div>

                  <div className="py-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs text-slate-500 font-medium">Chọn phân xưởng CNC:</span>
                      <button
                        onClick={() => setActiveNav('production')}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        Quản lý xưởng ➔
                      </button>
                    </div>
                    <select
                      value={selectedWorkshopId || (workshops[0]?.id || '')}
                      onChange={(e) => setSelectedWorkshopId(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {workshops.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name} ({w.machine_count} máy | {w.operator_count} thợ)
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const currentWs = workshops.find(w => w.id === selectedWorkshopId) || workshops[0] || {
                      name: 'Xưởng A (Phay Mazak, Tiện Doosan)',
                      manager_name: 'Lê Văn Sản Xuất',
                      machine_count: 5,
                      operator_count: 8,
                      main_machines: '3 Máy Phay CNC Mazak VCN-530C, 2 Máy Tiện Doosan Lynx 220',
                      location: 'Khu xưởng 1 - Nhà A',
                      status: 'active'
                    };

                    return (
                      <>
                        <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 mb-2 border border-slate-100">
                          <div className="flex justify-between text-slate-600">
                            <span>Quản đốc: <strong className="text-slate-800">{currentWs.manager_name}</strong></span>
                            <span className="text-slate-400 font-mono">{currentWs.phone || ''}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate" title={currentWs.main_machines}>
                            Máy chính: {currentWs.main_machines}
                          </p>
                        </div>

                        {/* 3 Metrics Boxes */}
                        <div className="grid grid-cols-3 gap-2.5 my-3">
                          {/* Box 1: Máy chạy */}
                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 text-center">
                            <span className="text-[11px] text-emerald-700 font-semibold block">Máy chạy</span>
                            <span className="text-sm font-bold text-emerald-900 mt-0.5 block">
                              {dashboardStats ? dashboardStats.production.active_lsx_count : '2'} / {currentWs.machine_count} máy
                            </span>
                            <span className="text-[9px] text-emerald-600 mt-0.5 block">Đang gia công</span>
                          </div>

                          {/* Box 2: Tỷ lệ Lỗi NG */}
                          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5 text-center">
                            <span className="text-[11px] text-rose-700 font-semibold block">Tỷ lệ NG</span>
                            <span className="text-sm font-bold text-rose-900 mt-0.5 block">
                              {dashboardStats ? `${dashboardStats.production.ng_rate_percent}%` : '2%'}
                            </span>
                            <span className="text-[9px] text-rose-500 mt-0.5 block">
                              {dashboardStats ? `${dashboardStats.production.ng_qty} phế phẩm` : '3 lỗi'}
                            </span>
                          </div>

                          {/* Box 3: Nhân lực */}
                          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 text-center">
                            <span className="text-[11px] text-blue-700 font-semibold block">Thợ máy</span>
                            <span className="text-sm font-bold text-blue-900 mt-0.5 block">
                              {currentWs.operator_count} thợ
                            </span>
                            <span className="text-[9px] text-blue-600 mt-0.5 block">
                              {currentWs.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Fast Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => setActiveNav('production')}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Factory className="w-3.5 h-3.5" />
                      Lập LSX mới
                    </button>
                    <button
                      onClick={() => setActiveNav('inventory')}
                      className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Xuất phôi / Dao
                    </button>
                  </div>
                </div>

                {/* Widget 2: Cảnh báo Vật tư thiếu (MRP) & Gia công ngoài */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Cảnh báo Kho phôi & Dao cụ
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    {lowStockAlerts.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <span className="text-[11px] text-slate-400">
                            Tồn: <strong className="text-rose-600">{item.quantity} {item.unit}</strong> (Min: {item.min_stock})
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveNav('inventory')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Nhập bù
                        </button>
                      </div>
                    ))}

                    {subcontracts.slice(0, 2).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                        <div>
                          <p className="font-semibold text-slate-800">{sub.vendor_name} ({sub.process_type})</p>
                          <span className="text-[11px] text-slate-500">
                            Hẹn trả: {sub.promise_date ? new Date(sub.promise_date).toLocaleDateString('vi-VN') : 'Sắp tới'} • SL: {sub.send_qty}
                          </span>
                        </div>
                        <Badge status={sub.status}>{sub.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widget 3: Tóm tắt Công nợ & Dòng tiền */}
                {dashboardStats && (user?.role === 'admin' || user?.role === 'accountant') && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Cân đối Công nợ Doanh nghiệp
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 text-blue-900 font-medium">
                        <span>Phải thu khách hàng:</span>
                        <span className="font-bold">{dashboardStats.finance.total_receivable.toLocaleString()} đ</span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 text-amber-900 font-medium">
                        <span>Phải trả xưởng ngoài/NCC:</span>
                        <span className="font-bold">{dashboardStats.finance.total_payable.toLocaleString()} đ</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-1 px-1 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition cursor-pointer flex-1 max-w-[60px] ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[9px] sm:text-[10px] mt-0.5 leading-tight truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}