'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Workflow, 
  ArrowRight, 
  AlertOctagon, 
  Truck, 
  CheckCircle2, 
  Settings,
  Building2,
  Pencil, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import CurrencyInput from '../ui/CurrencyInput';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const STANDARD_CNC_STEPS = [
  { value: 'Cắt phôi', label: '1. Cắt phôi (Thợ xưởng / Kỹ thuật phôi)', role: 'Kỹ thuật phôi' },
  { value: 'Phay CNC mặt chuẩn', label: '2. Phay CNC mặt chuẩn (Thợ máy Phay CNC)', role: 'Thợ máy Phay CNC' },
  { value: 'Tiện CNC chi tiết', label: '3. Tiện CNC chi tiết (Thợ máy Tiện CNC)', role: 'Thợ máy Tiện CNC' },
  { value: 'Gia công ngoài (Xi mạ/Nhiệt luyện)', label: '4. Gia công ngoài (Nhiệt luyện/Xi mạ/Anode - Quản đốc)', role: 'Quản đốc xưởng' },
  { value: 'Mài phẳng / Sửa nguội', label: '5. Mài phẳng / Khử ba via (Thợ nguội)', role: 'Thợ nguội hoàn thiện' },
  { value: 'Kiểm tra KCS / QC', label: '6. Kiểm tra KCS / Đo CMM & Dung sai (Kỹ sư QC)', role: 'Kỹ sư KCS / QC' },
  { value: 'Đã QC nghiệm thu & Nhập kho thành phẩm', label: '7. Hoàn thành & Bàn giao kho (Thủ kho / QC)', role: 'Thủ kho & QC' },
];

export const getStepRoleLabel = (step) => {
  if (!step) return 'Bộ phận Sản xuất';
  if (step.includes('Cắt phôi')) return 'Kỹ thuật phôi';
  if (step.includes('Phay')) return 'Thợ máy Phay CNC';
  if (step.includes('Tiện')) return 'Thợ máy Tiện CNC';
  if (step.includes('Gia công ngoài') || step.includes('Anode') || step.includes('Nhiệt luyện') || step.includes('Xi mạ')) return 'Quản đốc xưởng';
  if (step.includes('Mài') || step.includes('nguội')) return 'Thợ nguội hoàn thiện';
  if (step.includes('QC') || step.includes('KCS')) return 'Kỹ sư KCS / QC';
  if (step.includes('kho') || step.includes('Hoàn thành') || step.includes('Bàn giao')) return 'Thủ kho & QC';
  return 'Bộ phận Sản xuất';
};

export default function ProductionModule({ initialSubTab }) {
  const { showSuccess, showError, confirmDelete } = useToast();
  const { user } = useAuth();
  const canManageProduction = user?.role === 'admin' || user?.role === 'production';
  const [subTab, setSubTab] = useState(initialSubTab || 'lsx');

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]); // 'lsx' | 'wip' | 'subcontract' | 'workshops'
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [subcontracts, setSubcontracts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Workshop modals & forms
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
  const [isEditWorkshopOpen, setIsEditWorkshopOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [workshopForm, setWorkshopForm] = useState({
    code: '',
    name: '',
    manager_name: '',
    phone: '',
    machine_count: 5,
    operator_count: 8,
    main_machines: '',
    location: '',
    status: 'active',
    description: '',
  });

  // Modals
  const [isLsxModalOpen, setIsLsxModalOpen] = useState(false);
  const [isWipModalOpen, setIsWipModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [selectedHandoverLsx, setSelectedHandoverLsx] = useState(null);
  const [handoverQty, setHandoverQty] = useState(1);
  const [handoverInspector, setHandoverInspector] = useState('');
  const [handoverNote, setHandoverNote] = useState('Đã đo kiểm kích thước dung sai đạt chuẩn kỹ thuật 100%');

  // Forms
  const [lsxForm, setLsxForm] = useState({
    code: '',
    so_id: '',
    part_name: '',
    drawing_code: '',
    target_qty: 50,
    current_step: 'Cắt phôi',
    workshop_name: 'Xưởng A (Phay Mazak, Tiện Doosan)',
  });

  const [wipForm, setWipForm] = useState({
    production_order_id: '',
    from_step: 'Phay CNC mặt chuẩn',
    to_step: 'Tiện CNC chi tiết',
    operator: '',
    machine_name: '',
    qty_passed: 10,
    qty_failed: 0,
    fail_reason: '',
  });

  const [subForm, setSubForm] = useState({
    production_order_id: '',
    vendor_name: '',
    process_type: 'Anode nhôm đen cứng',
    part_name: '',
    send_qty: 50,
    unit_cost: 35000,
    promise_date: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resLsx, resWip, resSub, resWs, resSo] = await Promise.all([
        api.get('/production/orders'),
        api.get('/production/wip-movements'),
        api.get('/production/subcontracting'),
        api.get('/workshops').catch(() => ({ data: [] })),
        api.get('/sales/orders').catch(() => ({ data: [] })),
      ]);
      setOrders(resLsx.data || []);
      setMovements(resWip.data || []);
      setSubcontracts(resSub.data || []);
      setWorkshops(resWs.data?.data || resWs.data || []);
      setSalesOrders(resSo?.data?.data || resSo?.data || []);
    } catch (err) {
      console.error('Failed to load production data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddWorkshop = () => {
    setSelectedWorkshop(null);
    const nextNum = (workshops.length + 1).toString().padStart(2, '0');
    setWorkshopForm({
      code: `X-${nextNum}`,
      name: '',
      manager_name: '',
      phone: '',
      machine_count: 4,
      operator_count: 6,
      main_machines: '',
      location: '',
      status: 'active',
      description: '',
    });
    setIsAddWorkshopOpen(true);
  };

  const handleOpenEditWorkshop = (ws) => {
    setSelectedWorkshop(ws);
    setWorkshopForm({
      code: ws.code || '',
      name: ws.name || '',
      manager_name: ws.manager_name || '',
      phone: ws.phone || '',
      machine_count: ws.machine_count || 1,
      operator_count: ws.operator_count || 1,
      main_machines: ws.main_machines || '',
      location: ws.location || '',
      status: ws.status || 'active',
      description: ws.description || '',
    });
    setIsEditWorkshopOpen(true);
  };

  const handleCreateWorkshop = async (e) => {
    if (e) e.preventDefault();
    if (!workshopForm.name.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập tên phân xưởng.');
      return;
    }
    try {
      await api.post('/workshops', workshopForm);
      setIsAddWorkshopOpen(false);
      loadData();
      showSuccess('Thêm xưởng thành công!', `Phân xưởng "${workshopForm.name}" đã được tạo.`);
    } catch (err) {
      showError('Lỗi thêm xưởng', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateWorkshop = async (e) => {
    if (e) e.preventDefault();
    if (!selectedWorkshop) return;
    try {
      await api.put(`/workshops/${selectedWorkshop.id}`, workshopForm);
      setIsEditWorkshopOpen(false);
      loadData();
      showSuccess('Cập nhật thành công!', `Đã lưu thay đổi cho "${workshopForm.name}".`);
    } catch (err) {
      showError('Lỗi cập nhật', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteWorkshop = (ws) => {
    confirmDelete({
      title: 'Xóa Phân Xưởng',
      itemName: `${ws.name} (${ws.code})`,
      message: 'Bạn có chắc chắn muốn xóa phân xưởng này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete(`/workshops/${ws.id}`);
          showSuccess('Đã xóa thành công!', `Phân xưởng "${ws.name}" đã được xóa khỏi hệ thống.`);
          loadData();
        } catch (err) {
          showError('Lỗi xóa phân xưởng', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleSelectSoForLsx = (soId) => {
    if (!soId) {
      setLsxForm((prev) => ({ ...prev, so_id: '' }));
      return;
    }
    const found = salesOrders.find((s) => String(s.id) === String(soId));
    if (found) {
      setLsxForm((prev) => ({
        ...prev,
        so_id: found.id,
        part_name: found.part_name || prev.part_name,
        drawing_code: found.drawing_code || prev.drawing_code,
        target_qty: Number(found.order_qty) || prev.target_qty,
      }));
    }
  };

  const handleSelectLsxForWip = (lsxId) => {
    if (!lsxId) {
      setWipForm((prev) => ({ ...prev, production_order_id: '' }));
      return;
    }
    const found = orders.find((o) => String(o.id) === String(lsxId));
    if (found) {
      const remaining = Math.max(1, (Number(found.target_qty) || 0) - (Number(found.completed_qty) || 0));
      const currentIndex = STANDARD_CNC_STEPS.findIndex((s) => s.value === found.current_step);
      const nextStep = currentIndex >= 0 && currentIndex < STANDARD_CNC_STEPS.length - 1
        ? STANDARD_CNC_STEPS[currentIndex + 1].value
        : 'Kiểm tra KCS / QC';
      setWipForm((prev) => ({
        ...prev,
        production_order_id: found.id,
        from_step: found.current_step || prev.from_step,
        to_step: nextStep,
        qty_passed: remaining,
      }));
    }
  };

  const handleQuickMoveStep = (order) => {
    const remaining = Math.max(1, (Number(order.target_qty) || 0) - (Number(order.completed_qty) || 0));
    const currentIndex = STANDARD_CNC_STEPS.findIndex((s) => s.value === order.current_step);
    const nextStep = currentIndex >= 0 && currentIndex < STANDARD_CNC_STEPS.length - 1
      ? STANDARD_CNC_STEPS[currentIndex + 1].value
      : (order.current_step === 'Kiểm tra KCS / QC' ? 'Đã QC nghiệm thu & Nhập kho thành phẩm' : 'Phay CNC mặt chuẩn');

    setWipForm({
      production_order_id: order.id,
      from_step: order.current_step || 'Cắt phôi',
      to_step: nextStep,
      operator: user?.full_name || '',
      machine_name: '',
      qty_passed: remaining,
      qty_failed: 0,
      fail_reason: '',
    });
    setIsWipModalOpen(true);
  };

  const handleSelectLsxForSub = (lsxId) => {
    if (!lsxId) {
      setSubForm((prev) => ({ ...prev, production_order_id: '' }));
      return;
    }
    const found = orders.find((o) => String(o.id) === String(lsxId));
    if (found) {
      const remaining = Math.max(1, (Number(found.target_qty) || 0) - (Number(found.ng_qty) || 0));
      setSubForm((prev) => ({
        ...prev,
        production_order_id: found.id,
        part_name: found.part_name || prev.part_name,
        send_qty: remaining,
      }));
    }
  };

  const handleCreateLsx = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/orders', lsxForm);
      setIsLsxModalOpen(false);
      setLsxForm({
        code: '',
        so_id: '',
        part_name: '',
        drawing_code: '',
        target_qty: 50,
        current_step: 'Cắt phôi',
      });
      loadData();
      showSuccess('Tạo LSX thành công', `Lệnh sản xuất ${lsxForm.code || ''} cho chi tiết ${lsxForm.part_name} đã được khởi tạo.`);
    } catch (err) {
      showError('Lỗi tạo LSX', err.message);
    }
  };

  const handleCreateWip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/wip-movements', wipForm);
      setIsWipModalOpen(false);
      loadData();
      showSuccess('Luân chuyển BTP thành công', 'Phiếu chuyển công đoạn và kiểm tra NG đã được lưu.');
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleCreateSubcontract = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/subcontracting', subForm);
      setIsSubModalOpen(false);
      loadData();
      showSuccess('Gửi gia công ngoài thành công', `Đã lập phiếu gửi gia công chi tiết ${subForm.part_name} tới ${subForm.vendor_name}.`);
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleReceiveSubcontract = async (subId) => {
    const qty = prompt('Nhập số lượng hàng nhận về từ xưởng gia công ngoài:');
    if (!qty) return;
    try {
      await api.patch(`/production/subcontracting/${subId}`, {
        status: 'received',
        received_qty: Number(qty),
        qc_passed_qty: Number(qty),
      });
      loadData();
      showSuccess('Nhận hàng gia công thành công', 'Đã cập nhật số lượng nhập kho QC đạt chuẩn.');
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleOpenHandover = (lsx) => {
    setSelectedHandoverLsx(lsx);
    const remain = Math.max(1, (Number(lsx.target_qty) || 0) - (Number(lsx.completed_qty) || 0));
    setHandoverQty(remain);
    setHandoverInspector(user?.full_name || 'Kỹ sư QC');
    setHandoverNote('Đã đo kiểm tra kích thước dung sai đạt chuẩn kỹ thuật 100%');
    setIsHandoverModalOpen(true);
  };

  const handleSubmitHandover = async (e) => {
    if (e) e.preventDefault();
    if (!selectedHandoverLsx) return;
    try {
      await api.post(`/production/orders/${selectedHandoverLsx.id}/handover-finished`, { qty: handoverQty });
      showSuccess(
        'Bàn giao thành phẩm thành công!',
        `Đã hoàn tất nghiệm thu & bàn giao ${handoverQty} chi tiết ${selectedHandoverLsx.part_name} vào kho thành phẩm.`
      );
      setIsHandoverModalOpen(false);
      loadData();
    } catch (err) {
      showError('Lỗi bàn giao', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteLsx = (lsxId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Lệnh Sản Xuất (LSX)',
      itemName: 'Lệnh sản xuất #' + lsxId,
      message: 'Bạn có chắc chắn muốn xóa Lệnh sản xuất (LSX) này không?',
      onConfirm: async () => {
        try {
          await api.delete('/production/orders/' + lsxId);
          showSuccess('Đã xóa thành công!', 'Lệnh sản xuất LSX đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa LSX', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeleteWip = (wipId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Phiếu Luân Chuyển BTP',
      itemName: 'Phiếu BTP #' + wipId,
      message: 'Bạn có chắc chắn muốn xóa Phiếu luân chuyển BTP này không?',
      onConfirm: async () => {
        try {
          await api.delete('/production/wip-movements/' + wipId);
          showSuccess('Đã xóa thành công!', 'Phiếu luân chuyển BTP đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa phiếu BTP', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeleteSubcontract = (subId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Phiếu Gia Công Ngoài',
      itemName: 'Phiếu gia công #' + subId,
      message: 'Bạn có chắc chắn muốn xóa Phiếu gia công ngoài này không?',
      onConfirm: async () => {
        try {
          await api.delete('/production/subcontracting/' + subId);
          showSuccess('Đã xóa thành công!', 'Phiếu gia công ngoài đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa phiếu gia công', err.response?.data?.message || err.message);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => setSubTab('lsx')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'lsx'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Lệnh Sản Xuất LSX</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'lsx' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setSubTab('wip')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'wip'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Luân Chuyển BTP & NG</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'wip' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {movements.length}
            </span>
          </button>
          <button
            onClick={() => setSubTab('subcontract')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'subcontract'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Gia Công Ngoài</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'subcontract' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {subcontracts.length}
            </span>
          </button>
          <button
            onClick={() => setSubTab('workshops')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'workshops'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Phân Xưởng CNC</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'workshops' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {workshops.length}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subTab === 'lsx' && canManageProduction && (
            <Button size="md" icon={Plus} onClick={() => setIsLsxModalOpen(true)}>
              Tạo LSX mới
            </Button>
          )}
          {subTab === 'wip' && canManageProduction && (
            <Button size="md" icon={Workflow} onClick={() => setIsWipModalOpen(true)}>
              Phiếu chuyển công đoạn
            </Button>
          )}
          {subTab === 'subcontract' && canManageProduction && (
            <Button size="md" icon={Truck} onClick={() => setIsSubModalOpen(true)}>
              Gửi gia công ngoài
            </Button>
          )}
          {subTab === 'workshops' && canManageProduction && (
            <Button size="md" icon={Plus} onClick={handleOpenAddWorkshop}>
              Thêm phân xưởng mới
            </Button>
          )}
        </div>
      </div>

      {/* LSX SubTab */}
      {subTab === 'lsx' && (
        <Table
          isLoading={loading}
          data={orders}
          columns={[
            { header: 'Mã LSX', accessor: 'code', cellClassName: 'font-mono font-medium text-blue-600' },
            {
              header: 'Chi tiết gia công & Phân xưởng',
              render: (row) => (
                <div>
                  <div className="font-bold text-slate-800">{row.part_name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                      <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                      {row.workshop_name || 'Xưởng A (Phay Mazak, Tiện Doosan)'}
                    </span>
                  </div>
                </div>
              ),
            },
            { header: 'Mã bản vẽ', accessor: 'drawing_code', cellClassName: 'font-mono' },
            { header: 'Kế hoạch', accessor: 'target_qty', cellClassName: 'font-bold' },
            {
              header: 'Tiến độ hoàn thành',
              render: (row) => {
                const percent = Math.min(100, Math.round((row.completed_qty / row.target_qty) * 100));
                return (
                  <div className="w-40">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Đạt: {row.completed_qty}/{row.target_qty}</span>
                      <span className="font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Phế phẩm (NG)',
              render: (row) => (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${row.ng_qty > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                  {row.ng_qty} NG
                </span>
              ),
            },
            {
              header: 'Công đoạn hiện tại',
              render: (row) => (
                <div className="flex flex-col gap-1 py-0.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
                    <Workflow className="w-3 h-3 text-indigo-500 shrink-0" />
                    {row.current_step}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Phụ trách: <strong className="text-slate-700">{getStepRoleLabel(row.current_step)}</strong></span>
                  </div>
                </div>
              ),
            },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => {
                const isFinished = Number(row.completed_qty) >= Number(row.target_qty);
                return (
                  <div className="flex items-center gap-1.5">
                    {!isFinished && canManageProduction && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ArrowRight}
                        onClick={() => handleQuickMoveStep(row)}
                        className="text-xs py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
                        title="Chuyển sang công đoạn tiếp theo và báo cáo số lượng Đạt/NG"
                      >
                        Chuyển bước
                      </Button>
                    )}
                    {!isFinished && canManageProduction && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={CheckCircle2}
                        onClick={() => handleOpenHandover(row)}
                        className="text-xs py-1 px-2 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        title="Nghiệm thu QC đạt và bàn giao thành phẩm nhập kho"
                      >
                        Bàn giao kho
                      </Button>
                    )}
                    {canManageProduction && (
                      <button
                        onClick={() => handleDeleteLsx(row.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa lệnh sản xuất LSX"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      )}

      {/* WIP SubTab */}
      {subTab === 'wip' && (
        <Table
          isLoading={loading}
          data={movements}
          columns={[
            { header: 'Mã Phiếu', accessor: 'code', cellClassName: 'font-mono font-medium' },
            {
              header: 'Công đoạn luân chuyển',
              render: (row) => (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{row.from_step}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">{row.to_step}</span>
                </div>
              ),
            },
            {
              header: 'Tổ máy / Kỹ sư phụ trách',
              render: (row) => (
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">{row.operator || 'Kỹ thuật viên'}</div>
                  <div className="text-slate-400">{row.machine_name || 'Máy CNC'}</div>
                </div>
              ),
            },
            { header: 'Đạt (Passed)', accessor: 'qty_passed', cellClassName: 'font-bold text-emerald-600' },
            {
              header: 'Lỗi phế phẩm (NG)',
              render: (row) => (
                <div>
                  <span className={`font-semibold ${row.qty_failed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {row.qty_failed} NG
                  </span>
                  {row.fail_reason && (
                    <div className="text-[11px] text-rose-500 italic mt-0.5">{row.fail_reason}</div>
                  )}
                </div>
              ),
            },
            { header: 'Thời gian', accessor: 'created_at', cellClassName: 'text-xs text-slate-400 font-mono' },
            {
              header: 'Thao tác',
              render: (row) => (
                <button
                  onClick={() => handleDeleteWip(row.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa phiếu luân chuyển BTP"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
        />
      )}

      {/* Subcontracting SubTab */}
      {subTab === 'subcontract' && (
        <Table
          isLoading={loading}
          data={subcontracts}
          columns={[
            { header: 'Mã GCN', accessor: 'code', cellClassName: 'font-mono font-medium text-indigo-600' },
            { header: 'Đối tác / Xưởng gia công ngoài', accessor: 'vendor_name', cellClassName: 'font-semibold' },
            {
              header: 'Nguyên công gửi ngoài',
              render: (row) => (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  {row.process_type}
                </span>
              ),
            },
            { header: 'Chi tiết', accessor: 'part_name' },
            {
              header: 'Số lượng (Gửi / Đã nhận)',
              render: (row) => `${row.received_qty} / ${row.send_qty}`,
            },
            {
              header: 'Chi phí đối soát',
              render: (row) => `${Number(row.total_cost).toLocaleString()} đ`,
            },
            { header: 'Hẹn trả', accessor: 'promise_date', cellClassName: 'text-xs font-mono' },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {row.status === 'sent' && canManageProduction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReceiveSubcontract(row.id)}
                    >
                      Nhận hàng & QC
                    </Button>
                  )}
                  <button
                    onClick={() => handleDeleteSubcontract(row.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa phiếu gia công ngoài"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Workshops SubTab */}
      {subTab === 'workshops' && (
        <Table
          isLoading={loading}
          data={workshops}
          emptyMessage="Chưa có phân xưởng nào. Bấm 'Thêm phân xưởng mới' để khởi tạo."
          columns={[
            {
              header: 'Mã Xưởng',
              accessor: 'code',
              cellClassName: 'font-mono font-bold text-blue-600',
            },
            {
              header: 'Tên Phân Xưởng',
              render: (row) => (
                <div>
                  <div className="font-bold text-slate-800">{row.name}</div>
                  {row.description && (
                    <div className="text-xs text-slate-400 mt-0.5">{row.description}</div>
                  )}
                </div>
              ),
            },
            {
              header: 'Quản Lý & Liên Hệ',
              render: (row) => (
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">{row.manager_name || 'Chưa chỉ định'}</div>
                  {row.phone && (
                    <div className="text-slate-500 font-mono mt-0.5">{row.phone}</div>
                  )}
                </div>
              ),
            },
            {
              header: 'Vị Trí / Khu Vực',
              accessor: 'location',
              cellClassName: 'text-xs text-slate-600',
            },
            {
              header: 'Quy Mô Máy & Thợ',
              render: (row) => (
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {row.machine_count || 0} máy CNC
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {row.operator_count || 0} thợ
                  </span>
                </div>
              ),
            },
            {
              header: 'Dàn Thiết Bị Chính',
              accessor: 'main_machines',
              cellClassName: 'text-xs text-slate-500',
            },
            {
              header: 'Trạng Thái',
              render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  {row.status === 'active' ? '● Hoạt động' : 'Tạm dừng'}
                </span>
              ),
            },
            {
              header: 'Thao Tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {canManageProduction && (
                    <>
                      <button
                        onClick={() => handleOpenEditWorkshop(row)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa xưởng"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkshop(row)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Xóa phân xưởng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Create LSX Modal */}
      <Modal
        isOpen={isLsxModalOpen}
        onClose={() => setIsLsxModalOpen(false)}
        title="Tạo Lệnh Sản Xuất CNC Mới (LSX)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLsxModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateLsx}>Phát Lệnh Sản Xuất</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1">
            <Select
              label="Chọn Đơn hàng SO nguồn (Tự động điền dữ liệu)"
              value={lsxForm.so_id}
              onChange={(e) => handleSelectSoForLsx(e.target.value)}
              options={[
                { value: '', label: '-- Nhập thủ công (Không liên kết SO) --' },
                ...salesOrders.map((so) => ({
                  value: so.id,
                  label: `${so.code} - ${so.customer_name} (${so.part_name} - SL: ${so.order_qty})`,
                })),
              ]}
            />
            {lsxForm.so_id && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                ✨ Đã tự động điền Tên chi tiết, Mã bản vẽ và Số lượng từ đơn hàng SO đã chọn.
              </p>
            )}
          </div>
          <Input
            label="Chi tiết gia công CNC"
            placeholder="VD: Khuôn ép nhựa / Trục lệch tâm"
            value={lsxForm.part_name}
            onChange={(e) => setLsxForm({ ...lsxForm, part_name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã bản vẽ kỹ thuật"
              placeholder="VD: DWG-CNC-042"
              value={lsxForm.drawing_code}
              onChange={(e) => setLsxForm({ ...lsxForm, drawing_code: e.target.value })}
            />
            <Input
              label="Số lượng yêu cầu gia công"
              type="number"
              value={lsxForm.target_qty}
              onChange={(e) => setLsxForm({ ...lsxForm, target_qty: Number(e.target.value) })}
              required
            />
          </div>
          <Select
            label="Công đoạn bắt đầu của LSX"
            value={lsxForm.current_step}
            onChange={(e) => setLsxForm({ ...lsxForm, current_step: e.target.value })}
            options={STANDARD_CNC_STEPS.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
          />
          <Select
            label="Phân xưởng CNC tiếp nhận lệnh gia công"
            value={lsxForm.workshop_name}
            onChange={(e) => setLsxForm({ ...lsxForm, workshop_name: e.target.value })}
            options={workshops.map((w) => ({
              value: `${w.code} - ${w.name}`,
              label: `${w.code} - ${w.name} (${w.manager_name || 'Quản đốc'} - ${w.machine_count || 1} máy CNC)`,
            }))}
            required
          />
        </form>
      </Modal>

      {/* Create WIP Modal */}
      <Modal
        isOpen={isWipModalOpen}
        onClose={() => setIsWipModalOpen(false)}
        title="Lập Phiếu Chuyển Công Đoạn & Báo Cáo NG"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsWipModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateWip}>Xác Nhận Luân Chuyển</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Select
            label="Lệnh sản xuất liên quan"
            value={wipForm.production_order_id}
            onChange={(e) => handleSelectLsxForWip(e.target.value)}
            options={[
              { value: '', label: '-- Chọn Lệnh sản xuất --' },
              ...orders.map((o) => ({ value: o.id, label: `${o.code} - ${o.part_name}` })),
            ]}
          />

          {wipForm.production_order_id && (() => {
            const currentOrder = orders.find((o) => String(o.id) === String(wipForm.production_order_id));
            if (!currentOrder) return null;
            return (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-blue-800">{currentOrder.code}</span>: {currentOrder.part_name}
                </div>
                <div className="flex items-center gap-3">
                  <span>Kế hoạch: <strong>{currentOrder.target_qty}</strong></span>
                  <span>Đã xong: <strong className="text-emerald-700">{currentOrder.completed_qty}</strong></span>
                  <span>Phế phẩm: <strong className="text-rose-600">{currentOrder.ng_qty} NG</strong></span>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Từ công đoạn hiện tại"
              value={wipForm.from_step}
              onChange={(e) => setWipForm({ ...wipForm, from_step: e.target.value })}
              required
            />
            <Select
              label="Chuyển sang công đoạn tiếp theo"
              value={wipForm.to_step}
              onChange={(e) => setWipForm({ ...wipForm, to_step: e.target.value })}
              options={STANDARD_CNC_STEPS.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kỹ sư / Thợ vận hành"
              placeholder="Nguyễn Văn A"
              value={wipForm.operator}
              onChange={(e) => setWipForm({ ...wipForm, operator: e.target.value })}
            />
            <Input
              label="Tổ máy thực hiện"
              placeholder="Mazak VCN-530C / Doosan Lynx"
              value={wipForm.machine_name}
              onChange={(e) => setWipForm({ ...wipForm, machine_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số lượng ĐẠT chuẩn"
              type="number"
              value={wipForm.qty_passed}
              onChange={(e) => setWipForm({ ...wipForm, qty_passed: Number(e.target.value) })}
              required
            />
            <Input
              label="Số lượng LỖI phế phẩm (NG)"
              type="number"
              value={wipForm.qty_failed}
              onChange={(e) => setWipForm({ ...wipForm, qty_failed: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Nguyên nhân lỗi (nếu có)"
            placeholder="Sai kích thước trục Z, trầy xước, ba via..."
            value={wipForm.fail_reason}
            onChange={(e) => setWipForm({ ...wipForm, fail_reason: e.target.value })}
          />
        </form>
      </Modal>

      {/* Create Subcontract Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="Lập Phiếu Gửi Gia Công Ngoài (Subcontracting)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSubModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateSubcontract}>Gửi Gia Công</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1">
            <Select
              label="Lệnh sản xuất LSX liên quan (Tự động điền chi tiết & số lượng)"
              value={subForm.production_order_id}
              onChange={(e) => handleSelectLsxForSub(e.target.value)}
              options={[
                { value: '', label: '-- Nhập thủ công (Không liên kết LSX) --' },
                ...orders.map((o) => ({
                  value: o.id,
                  label: `${o.code} - ${o.part_name} (Kế hoạch: ${o.target_qty})`,
                })),
              ]}
            />
            {subForm.production_order_id && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                ✨ Đã tự động điền Tên chi tiết và Số lượng từ Lệnh sản xuất đã chọn.
              </p>
            )}
          </div>
          <Input
            label="Xưởng gia công ngoài / Đối tác"
            placeholder="VD: Xưởng Anode Kim Phát, Nhiệt luyện Đức Minh"
            value={subForm.vendor_name}
            onChange={(e) => setSubForm({ ...subForm, vendor_name: e.target.value })}
            required
          />

          <Select
            label="Nguyên công gia công ngoài"
            value={subForm.process_type}
            onChange={(e) => setSubForm({ ...subForm, process_type: e.target.value })}
            options={[
              { value: 'Anode nhôm đen cứng', label: 'Anode nhôm đen / hóa cứng' },
              { value: 'Nhiệt luyện tôi thể tích', label: 'Nhiệt luyện tôi thể tích / thấm carbon' },
              { value: 'Xi mạ kẽm / Niken', label: 'Xi mạ Niken / Crom cứng' },
              { value: 'Sơn tĩnh điện công nghiệp', label: 'Sơn tĩnh điện công nghiệp' },
              { value: 'Cắt dây Molipden ngoài', label: 'Cắt dây Molipden ngoài' },
            ]}
          />

          <Input
            label="Tên chi tiết gửi ngoài"
            placeholder="VD: Gối đỡ nhôm 6061"
            value={subForm.part_name}
            onChange={(e) => setSubForm({ ...subForm, part_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số lượng gửi"
              type="number"
              value={subForm.send_qty}
              onChange={(e) => setSubForm({ ...subForm, send_qty: Number(e.target.value) })}
              required
            />
            <CurrencyInput
              label="Đơn giá gia công ngoài (VNĐ/cái)"
              value={subForm.unit_cost}
              onChange={(val) => setSubForm({ ...subForm, unit_cost: val })}
            />
          </div>

          <Input
            label="Hẹn ngày trả hàng"
            type="date"
            value={subForm.promise_date}
            onChange={(e) => setSubForm({ ...subForm, promise_date: e.target.value })}
          />
        </form>
      </Modal>

      {/* Add Workshop Modal */}
      {isAddWorkshopOpen && (
        <Modal
          isOpen={isAddWorkshopOpen}
          onClose={() => setIsAddWorkshopOpen(false)}
          title="Thêm Phân Xưởng CNC Mới"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddWorkshopOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleCreateWorkshop} icon={Plus}>Lưu Phân Xưởng</Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleCreateWorkshop}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã phân xưởng"
                placeholder="VD: X-04"
                value={workshopForm.code}
                onChange={(e) => setWorkshopForm({ ...workshopForm, code: e.target.value })}
                required
              />
              <Input
                label="Tên phân xưởng"
                placeholder="VD: Xưởng D (Nhiệt luyện & Mạ màu)"
                value={workshopForm.name}
                onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Quản đốc / Phụ trách xưởng"
                placeholder="VD: Lê Văn Sản Xuất"
                value={workshopForm.manager_name}
                onChange={(e) => setWorkshopForm({ ...workshopForm, manager_name: e.target.value })}
              />
              <Input
                label="Số điện thoại liên hệ"
                placeholder="VD: 0918112233"
                value={workshopForm.phone}
                onChange={(e) => setWorkshopForm({ ...workshopForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số lượng máy CNC"
                type="number"
                value={workshopForm.machine_count}
                onChange={(e) => setWorkshopForm({ ...workshopForm, machine_count: Number(e.target.value) })}
                required
              />
              <Input
                label="Số lượng thợ / kỹ sư"
                type="number"
                value={workshopForm.operator_count}
                onChange={(e) => setWorkshopForm({ ...workshopForm, operator_count: Number(e.target.value) })}
                required
              />
            </div>

            <Input
              label="Dàn máy thiết bị chính"
              placeholder="VD: 3 Máy Phay CNC Mazak, 2 Máy Tiện Doosan..."
              value={workshopForm.main_machines}
              onChange={(e) => setWorkshopForm({ ...workshopForm, main_machines: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vị trí / Khu xưởng"
                placeholder="VD: Khu xưởng 1 - Nhà A"
                value={workshopForm.location}
                onChange={(e) => setWorkshopForm({ ...workshopForm, location: e.target.value })}
              />
              <Select
                label="Trạng thái hoạt động"
                value={workshopForm.status}
                onChange={(e) => setWorkshopForm({ ...workshopForm, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'inactive', label: 'Tạm dừng hoạt động' },
                ]}
              />
            </div>

            <Input
              label="Mô tả / Năng lực gia công"
              placeholder="VD: Chuyên gia công phôi thép cứng, phay 4 trục..."
              value={workshopForm.description}
              onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
            />
          </form>
        </Modal>
      )}

      {/* Edit Workshop Modal */}
      {isEditWorkshopOpen && (
        <Modal
          isOpen={isEditWorkshopOpen}
          onClose={() => setIsEditWorkshopOpen(false)}
          title={`Chỉnh Sửa Phân Xưởng: ${selectedWorkshop?.name || ''}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditWorkshopOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleUpdateWorkshop} icon={Pencil}>Cập Nhật</Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleUpdateWorkshop}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã phân xưởng"
                value={workshopForm.code}
                onChange={(e) => setWorkshopForm({ ...workshopForm, code: e.target.value })}
                required
              />
              <Input
                label="Tên phân xưởng"
                value={workshopForm.name}
                onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Quản đốc / Phụ trách xưởng"
                value={workshopForm.manager_name}
                onChange={(e) => setWorkshopForm({ ...workshopForm, manager_name: e.target.value })}
              />
              <Input
                label="Số điện thoại liên hệ"
                value={workshopForm.phone}
                onChange={(e) => setWorkshopForm({ ...workshopForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số lượng máy CNC"
                type="number"
                value={workshopForm.machine_count}
                onChange={(e) => setWorkshopForm({ ...workshopForm, machine_count: Number(e.target.value) })}
                required
              />
              <Input
                label="Số lượng thợ / kỹ sư"
                type="number"
                value={workshopForm.operator_count}
                onChange={(e) => setWorkshopForm({ ...workshopForm, operator_count: Number(e.target.value) })}
                required
              />
            </div>

            <Input
              label="Dàn máy thiết bị chính"
              value={workshopForm.main_machines}
              onChange={(e) => setWorkshopForm({ ...workshopForm, main_machines: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vị trí / Khu xưởng"
                value={workshopForm.location}
                onChange={(e) => setWorkshopForm({ ...workshopForm, location: e.target.value })}
              />
              <Select
                label="Trạng thái hoạt động"
                value={workshopForm.status}
                onChange={(e) => setWorkshopForm({ ...workshopForm, status: e.target.value })}
                options={[
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'inactive', label: 'Tạm dừng hoạt động' },
                ]}
              />
            </div>

            <Input
              label="Mô tả / Năng lực gia công"
              value={workshopForm.description}
              onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
            />
          </form>
        </Modal>
      )}

      {/* Handover Finished Goods Modal */}
      {isHandoverModalOpen && selectedHandoverLsx && (
        <Modal
          isOpen={isHandoverModalOpen}
          onClose={() => setIsHandoverModalOpen(false)}
          title="QC Nghiệm Thu & Bàn Giao Thành Phẩm Nhập Kho"
          maxWidth="max-w-lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsHandoverModalOpen(false)}>Hủy</Button>
              <Button
                variant="primary"
                onClick={handleSubmitHandover}
                icon={CheckCircle2}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Xác Nhận Bàn Giao Nhập Kho
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleSubmitHandover}>
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800 text-sm">{selectedHandoverLsx.code}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Tiến độ: {selectedHandoverLsx.completed_qty}/{selectedHandoverLsx.target_qty}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-sm">{selectedHandoverLsx.part_name}</div>
              <div className="text-xs text-slate-500">Mã bản vẽ: <span className="font-mono font-medium">{selectedHandoverLsx.drawing_code || 'N/A'}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số lượng hoàn thành bàn giao"
                type="number"
                min="1"
                max={Math.max(1, Number(selectedHandoverLsx.target_qty) - Number(selectedHandoverLsx.completed_qty))}
                value={handoverQty}
                onChange={(e) => setHandoverQty(Number(e.target.value))}
                required
              />
              <Input
                label="Kỹ sư QC / Người phụ trách nghiệm thu"
                value={handoverInspector}
                onChange={(e) => setHandoverInspector(e.target.value)}
                required
              />
            </div>

            <Input
              label="Ghi chú nghiệm thu chất lượng kỹ thuật"
              placeholder="VD: Kích thước kiểm tra đạt 100%, độ nhám Ra đạt chuẩn..."
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
            />

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
              ✨ <strong>Lưu ý:</strong> Khi xác nhận, số lượng chi tiết đạt chuẩn sẽ được chuyển giao vào Kho Thành Phẩm. Thủ kho và bộ phận Bán hàng có thể lập Phiếu Giao Hàng (Delivery Note) để xuất giao cho đơn hàng SO.
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
