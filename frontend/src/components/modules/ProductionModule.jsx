'use client';

import {
  useState, useEffect } from 'react';
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
  Trash2,
  Users,
  Layers,
  ClipboardCheck,
  UserCheck,
  HardHat,
  User,
  AlertTriangle,
  Check,
  Clock,
  ShieldCheck,
  FileText,
  Printer,
  Warehouse,
  Coins,
  ChevronRight,
  Sparkles,
  History,
  PackageCheck,
  Eye
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import CurrencyInput from '../ui/CurrencyInput';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Select, Dropdown } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';


export const FACTORY_MACHINES = [
  'Máy Phay CNC Mazak VCN-530C (#01)',
  'Máy Phay CNC Mazak VCN-530C (#02)',
  'Máy Phay CNC Mazak VCN-530C (#03)',
  'Máy Tiện CNC Doosan Lynx 220 (#01)',
  'Máy Tiện CNC Doosan Lynx 220 (#02)',
  'Máy Cắt Dây CNC Sodick AQ327L (#01)',
  'Máy Cắt Dây CNC Sodick AQ327L (#02)',
  'Máy Mài Phẳng Okamoto ACC-DX (#01)',
  'Máy Mài Phẳng Okamoto ACC-DX (#02)',
  'Máy Cưa Vòng Amada HFA-300 Tự Động',
  'Máy Phay Cơ Vạn Năng Bridgeport',
  'Tổ Nguội, Khử Bavia & Lắp Ráp Jig',
  'Máy Đo 3D CMM Mitutoyo & Bàn Map',
];

export const CNC_DEFECT_REASONS = [
  { value: 'Sai kích thước / Lệch dung sai trục X-Y-Z', label: '1. Sai kích thước / Lệch dung sai trục (Kích thước vượt giới hạn ±0.01mm)' },
  { value: 'Độ nhám bề mặt không đạt (Xước dao, gợn sóng)', label: '2. Độ nhám không đạt (Bề mặt gợn sóng, sọc dao, xước phôi)' },
  { value: 'Mẻ dao / Gãy mũi phay / Cháy dao', label: '3. Sự cố dao cụ (Mẻ lưỡi cắt, gãy mũi dao, mòn cháy dao)' },
  { value: 'Rà gá phôi lệch / Kẹp lỏng phôi / Dịch chuyển', label: '4. Lỗi đồ gá & rà phôi (Kẹp lệch, rà chuẩn sai, lỏng ê-tô/Jig)' },
  { value: 'Lỗi phôi thô (Rỗ khí, lẫn xỉ, cong vênh)', label: '5. Lỗi phôi vật tư (Phôi cong vênh, rỗ khí, tạp chất phôi)' },
  { value: 'Lỗi chương trình CAM / Nhầm gốc tọa độ G54-G59', label: '6. Lỗi lập trình & vận hành (Nhầm tọa độ, sai code G-code, bù dao sai)' },
  { value: 'Ba via quá lớn / Móp méo / Rơi biến dạng', label: '7. Biến dạng cơ học (Ba via nặng, rơi móp méo khi tháo gá)' },
  { value: 'Khác', label: '8. Nguyên nhân khác (Nhập chi tiết cụ thể...)' },
];

export const FACTORY_MACHINE_GROUPS = [
  {
    label: 'Xưởng A - Phay Mazak & Tiện Doosan',
    options: [
      { value: 'Máy Phay CNC Mazak VCN-530C (#01)', label: 'Máy Phay CNC Mazak VCN-530C (#01)', badge: 'Phay 4 trục' },
      { value: 'Máy Phay CNC Mazak VCN-530C (#02)', label: 'Máy Phay CNC Mazak VCN-530C (#02)', badge: 'Phay 4 trục' },
      { value: 'Máy Phay CNC Mazak VCN-530C (#03)', label: 'Máy Phay CNC Mazak VCN-530C (#03)', badge: 'Phay 4 trục' },
      { value: 'Máy Tiện CNC Doosan Lynx 220 (#01)', label: 'Máy Tiện CNC Doosan Lynx 220 (#01)', badge: 'Tiện CNC' },
      { value: 'Máy Tiện CNC Doosan Lynx 220 (#02)', label: 'Máy Tiện CNC Doosan Lynx 220 (#02)', badge: 'Tiện CNC' },
    ],
  },
  {
    label: 'Xưởng B - Cắt Dây EDM & Mài Phẳng',
    options: [
      { value: 'Máy Cắt Dây CNC Sodick AQ327L (#01)', label: 'Máy Cắt Dây CNC Sodick AQ327L (#01)', badge: 'Cắt dây EDM' },
      { value: 'Máy Cắt Dây CNC Sodick AQ327L (#02)', label: 'Máy Cắt Dây CNC Sodick AQ327L (#02)', badge: 'Cắt dây EDM' },
      { value: 'Máy Mài Phẳng Okamoto ACC-DX (#01)', label: 'Máy Mài Phẳng Okamoto ACC-DX (#01)', badge: 'Mài phẳng' },
      { value: 'Máy Mài Phẳng Okamoto ACC-DX (#02)', label: 'Máy Mài Phẳng Okamoto ACC-DX (#02)', badge: 'Mài phẳng' },
    ],
  },
  {
    label: 'Xưởng C - Cưa Phôi, Phay Cơ & Jig',
    options: [
      { value: 'Máy Cưa Vòng Amada HFA-300 Tự Động', label: 'Máy Cưa Vòng Amada HFA-300 Tự Động', badge: 'Cưa tự động' },
      { value: 'Máy Phay Cơ Vạn Năng Bridgeport', label: 'Máy Phay Cơ Vạn Năng Bridgeport', badge: 'Phay cơ' },
      { value: 'Tổ Nguội, Khử Bavia & Lắp Ráp Jig', label: 'Tổ Nguội, Khử Bavia & Lắp Ráp Jig', badge: 'Nguội & Jig' },
    ],
  },
  {
    label: 'KCS & Đo Lường',
    options: [
      { value: 'Máy Đo 3D CMM Mitutoyo & Bàn Map', label: 'Máy Đo 3D CMM Mitutoyo & Bàn Map', badge: 'Đo 3D CMM' },
    ],
  },
];

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
  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [subcontracts, setSubcontracts] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedWorkshopForDetail, setSelectedWorkshopForDetail] = useState(null);
  const [isWorkshopDetailOpen, setIsWorkshopDetailOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isEditOperatorModalOpen, setIsEditOperatorModalOpen] = useState(false);

  // Multi-worker assignment to workshop
  const [isAssignWorkersModalOpen, setIsAssignWorkersModalOpen] = useState(false);
  const [selectedWorkerIdsForAssign, setSelectedWorkerIdsForAssign] = useState([]);
  const [assignWorkerSearch, setAssignWorkerSearch] = useState('');
  const [assignWorkerFilter, setAssignWorkerFilter] = useState('unassigned'); // 'all' | 'unassigned' | 'other'

  // Worker output recording on LSX
  const [isRecordOutputModalOpen, setIsRecordOutputModalOpen] = useState(false);
  const [selectedLsxForRecord, setSelectedLsxForRecord] = useState(null);
  const [workerOutputForm, setWorkerOutputForm] = useState({
    operator: '',
    step_name: '',
    machine_name: '',
    qty_passed: 1,
    qty_failed: 0,
    fail_reason: '',
  });

  // History modal of worker contributions on an LSX
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLsxForHistory, setSelectedLsxForHistory] = useState(null);
  const [operatorSearch, setOperatorSearch] = useState('');
  const [operatorFilterWs, setOperatorFilterWs] = useState('all');

  const [operatorForm, setOperatorForm] = useState({
    code: '',
    name: '',
    phone: '',
    workshop_id: '',
    skill_level: 'Thợ bậc 4/7 - Vận hành Phay CNC',
    shift: 'Ca 1 (Hành chính)',
    status: 'active',
    notes: '',
  });

  const [editOperatorForm, setEditOperatorForm] = useState({
    id: null,
    code: '',
    name: '',
    phone: '',
    workshop_id: '',
    skill_level: '',
    shift: 'Ca 1 (Hành chính)',
    status: 'active',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Steps state (Thêm, sửa, xóa, cắt bỏ công đoạn)
  const [cncSteps, setCncSteps] = useState([]);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isEditStepOpen, setIsEditStepOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [stepForm, setStepForm] = useState({
    step_order: 1,
    name: '',
    assigned_role: '',
    description: '',
    workshop_id: '',
    assigned_operators: '',
  });

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
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [selectedOrderForRouting, setSelectedOrderForRouting] = useState(null);
  const [routingTab, setRoutingTab] = useState('workflow'); // 'workflow' | 'history' | 'qc' | 'materials' | 'costing'
  const [routingMoveForm, setRoutingMoveForm] = useState({
    from_step: '',
    to_step: '',
    qty_passed: 1,
    qty_failed: 0,
    fail_reason: '',
    fail_reason_category: '',
    operator: '',
    machine_name: '',
    notes: '',
  });
  const [isLsxModalOpen, setIsLsxModalOpen] = useState(false);
  const [isEditLsxOpen, setIsEditLsxOpen] = useState(false);
  const [editingLsxId, setEditingLsxId] = useState(null);
  const [editLsxForm, setEditLsxForm] = useState({
    target_qty: 50,
    current_step: 'Cắt phôi',
    workshop_name: '',
    priority: 'Bình thường',
    notes: '',
    status: 'in_progress',
  });
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
    material_id: '',
    material_name: '',
    material_qty_needed: 50,
    auto_issue_material: true,
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

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resLsx, resWip, resSub, resWs, resSo, resSteps, resParts, resOperators, resMats] = await Promise.all([
        api.get('/production/orders').catch(() => ({ data: [] })),
        api.get('/production/wip-movements').catch(() => ({ data: [] })),
        api.get('/production/subcontracting').catch(() => ({ data: [] })),
        api.get('/workshops').catch(() => ({ data: [] })),
        api.get('/sales/orders').catch(() => ({ data: [] })),
        api.get('/production/steps').catch(() => ({ data: [] })),
        api.get('/sales/parts').catch(() => ({ data: [] })),
        api.get('/production/operators').catch(() => ({ data: [] })),
        api.get('/inventory/materials').catch(() => ({ data: [] })),
      ]);

      const parseArray = (res) => {
        if (!res || !res.data) return [];
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data.data)) return res.data.data;
        return [];
      };

      setOrders(parseArray(resLsx));
      setMovements(parseArray(resWip));
      setSubcontracts(parseArray(resSub));
      setWorkshops(parseArray(resWs));
      setSalesOrders(parseArray(resSo));
      setPartsList(parseArray(resParts));
      setOperators(parseArray(resOperators));
      setMaterials(parseArray(resMats));

      const fetchedSteps = parseArray(resSteps);
      setCncSteps(
        fetchedSteps.length > 0
          ? fetchedSteps
          : STANDARD_CNC_STEPS.map((step, i) => ({
              id: i + 1,
              step_order: i + 1,
              name: step.value,
              assigned_role: step.role,
              description: step.label,
            }))
      );
    } catch (err) {
      console.error('Failed to load production data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData(true);
    const handleFocus = () => loadData(true);

    window.addEventListener('cnc_data_updated', handleUpdate);
    window.addEventListener('focus', handleFocus);

    // Heartbeat live polling every 6s
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('cnc_data_updated', handleUpdate);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);


  const stepOptions = (cncSteps.length > 0 ? cncSteps : STANDARD_CNC_STEPS.map((s, i) => ({ id: i + 1, step_order: i + 1, name: s.value, assigned_role: s.role, description: s.label }))).map((s, idx) => ({
    value: s.name,
    label: `${s.step_order || idx + 1}. ${s.name}${s.workshop_code ? ` [${s.workshop_code}]` : ''} (${s.assigned_role || 'Thợ xưởng'})`,
    role: s.assigned_role,
    id: s.id,
    order: s.step_order || idx + 1,
    workshop_id: s.workshop_id,
  }));

  const handleOpenAddStep = (workshopId = '') => {
    setSelectedStep(null);
    setStepForm({
      step_order: cncSteps.length + 1,
      name: '',
      assigned_role: '',
      description: '',
      workshop_id: workshopId ? String(workshopId) : '',
      assigned_operators: '',
    });
    setIsAddStepOpen(true);
  };

  const handleOpenEditStep = (step) => {
    setSelectedStep(step);
    setStepForm({
      step_order: step.step_order || 1,
      name: step.name || '',
      assigned_role: step.assigned_role || '',
      description: step.description || '',
      workshop_id: step.workshop_id ? String(step.workshop_id) : '',
      assigned_operators: step.assigned_operators || '',
    });
    setIsEditStepOpen(true);
  };

  const handleCreateStep = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!stepForm.name.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập tên công đoạn sản xuất.');
      return;
    }
    try {
      await api.post('/production/steps', {
        ...stepForm,
        workshop_id: stepForm.workshop_id ? Number(stepForm.workshop_id) : null,
      });
      setIsAddStepOpen(false);
      loadData();
      showSuccess('Thêm công đoạn thành công!', `Công đoạn "${stepForm.name}" đã được đưa vào quy trình sản xuất.`);
    } catch (err) {
      showError('Lỗi thêm công đoạn', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStep = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedStep) return;
    try {
      await api.put(`/production/steps/${selectedStep.id}`, {
        ...stepForm,
        workshop_id: stepForm.workshop_id ? Number(stepForm.workshop_id) : null,
      });
      setIsEditStepOpen(false);
      loadData();
      showSuccess('Cập nhật thành công!', `Công đoạn "${stepForm.name}" đã được cập nhật.`);
    } catch (err) {
      showError('Lỗi cập nhật công đoạn', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteStep = (step) => {
    confirmDelete({
      title: 'Xác Nhận Cắt Bỏ / Xóa Công Đoạn',
      itemName: step.name,
      message: `Bạn có chắc chắn muốn cắt bỏ công đoạn "${step.name}" khỏi quy trình sản xuất cơ khí CNC không?`,
      onConfirm: async () => {
        try {
          await api.delete(`/production/steps/${step.id}`);
          loadData();
          showSuccess('Đã cắt bỏ thành công!', `Công đoạn "${step.name}" đã được loại bỏ khỏi quy trình.`);
        } catch (err) {
          showError('Lỗi xóa công đoạn', err.response?.data?.message || err.message);
        }
      },
    });
  };

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
      const targetQty = Number(found.order_qty) || 50;
      // Auto-suggest material if found in part name
      const matchedMat = materials.find(m => 
        (found.part_name && m.name && (
          (found.part_name.toLowerCase().includes('nhôm') && m.name.toLowerCase().includes('nhôm')) ||
          (found.part_name.toLowerCase().includes('thép') && m.name.toLowerCase().includes('thép')) ||
          (found.part_name.toLowerCase().includes('inox') && m.name.toLowerCase().includes('inox'))
        ))
      ) || materials[0];

      setLsxForm((prev) => ({
        ...prev,
        so_id: found.id,
        part_name: found.part_name || prev.part_name,
        drawing_code: found.drawing_code || prev.drawing_code,
        target_qty: targetQty,
        material_id: matchedMat ? matchedMat.id : prev.material_id,
        material_name: matchedMat ? matchedMat.name : prev.material_name,
        material_qty_needed: targetQty,
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

  const handleOpenEditLsx = (lsx) => {
    setEditingLsxId(lsx.id);
    setEditLsxForm({
      target_qty: Number(lsx.target_qty) || 1,
      current_step: lsx.current_step || 'Cắt phôi',
      workshop_name: lsx.workshop_name || '',
      priority: lsx.priority || 'Bình thường',
      notes: lsx.notes || '',
      status: lsx.status || 'in_progress',
    });
    setIsEditLsxOpen(true);
  };

  const handleUpdateLsx = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/production/orders/${editingLsxId}`, editLsxForm);
      setIsEditLsxOpen(false);
      loadData();
      showSuccess('Cập nhật thành công!', 'Lệnh sản xuất đã được lưu thay đổi.');
    } catch (err) {
      showError('Lỗi cập nhật LSX', err.response?.data?.message || err.message);
    }
  };

  const handleOpenRoutingModal = (order) => {
    setSelectedOrderForRouting(order);
    setRoutingTab('workflow');
    
    const remaining = Math.max(1, (Number(order.target_qty) || 0) - (Number(order.ng_qty) || 0));
    const currentIndex = STANDARD_CNC_STEPS.findIndex((s) => s.value === order.current_step);
    const nextStep = currentIndex >= 0 && currentIndex < STANDARD_CNC_STEPS.length - 1
      ? STANDARD_CNC_STEPS[currentIndex + 1].value
      : (order.current_step === 'Kiểm tra KCS / QC' ? 'Đã QC nghiệm thu & Nhập kho thành phẩm' : 'Phay CNC mặt chuẩn');

    let suggestedMachine = 'Máy Phay CNC Mazak VCN-530C (#01)';
    if (nextStep.includes('Cắt phôi')) suggestedMachine = 'Máy Cưa Vòng Amada HFA-300 Tự Động';
    else if (nextStep.includes('Tiện')) suggestedMachine = 'Máy Tiện CNC Doosan Lynx 220 (#01)';
    else if (nextStep.includes('Cắt dây') || nextStep.includes('EDM')) suggestedMachine = 'Máy Cắt Dây CNC Sodick AQ327L (#01)';
    else if (nextStep.includes('Mài')) suggestedMachine = 'Máy Mài Phẳng Okamoto ACC-DX (#01)';
    else if (nextStep.includes('QC') || nextStep.includes('KCS')) suggestedMachine = 'Máy Đo 3D CMM Mitutoyo & Bàn Map';

    const matchingOp = operators.find(op => {
      if (nextStep.includes('Cắt phôi')) return op.skill_level?.includes('cưa') || op.skill_level?.includes('phôi');
      if (nextStep.includes('Tiện')) return op.skill_level?.includes('Tiện');
      if (nextStep.includes('Phay')) return op.skill_level?.includes('Phay');
      if (nextStep.includes('Cắt dây')) return op.skill_level?.includes('Cắt');
      if (nextStep.includes('Mài')) return op.skill_level?.includes('Mài');
      return false;
    });

    setRoutingMoveForm({
      from_step: order.current_step || 'Cắt phôi',
      to_step: nextStep,
      qty_passed: remaining,
      qty_failed: 0,
      fail_reason: '',
      fail_reason_category: '',
      operator: matchingOp?.name || user?.full_name || '',
      machine_name: suggestedMachine,
      notes: '',
    });
    setIsRoutingModalOpen(true);
  };

  const handleRoutingAdvanceStep = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeOrder = orders.find(o => o.id === selectedOrderForRouting?.id) || selectedOrderForRouting;
    if (!activeOrder) return;

    if (Number(routingMoveForm.qty_passed) === 0 && Number(routingMoveForm.qty_failed) === 0) {
      showError('Thiếu thông tin', 'Vui lòng nhập số lượng đạt hoặc số lượng phế phẩm.');
      return;
    }

    const defectText = (routingMoveForm.fail_reason || routingMoveForm.fail_reason_category || '').trim();
    if (Number(routingMoveForm.qty_failed) > 0 && !defectText) {
      showError('Chưa nhập nguyên nhân lỗi', 'Phát hiện chi tiết lỗi NG. Vui lòng chọn hoặc mô tả nguyên nhân lỗi cụ thể.');
      return;
    }

    try {
      await api.post('/production/wip-movements', {
        production_order_id: activeOrder.id,
        from_step: routingMoveForm.from_step,
        to_step: routingMoveForm.to_step,
        qty_passed: Number(routingMoveForm.qty_passed) || 0,
        qty_failed: Number(routingMoveForm.qty_failed) || 0,
        fail_reason: Number(routingMoveForm.qty_failed) > 0 ? defectText : '',
        operator: routingMoveForm.operator || user?.full_name || 'Thợ máy',
        machine_name: routingMoveForm.machine_name || 'Máy CNC',
        action_on_error: 'continue',
      });

      showSuccess(
        'Chuyển bước thành công!',
        `Đã hoàn tất ${routingMoveForm.from_step} và chuyển ${routingMoveForm.qty_passed} chi tiết đạt sang ${routingMoveForm.to_step}.`
      );

      await loadData(true);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'wip_created' } }));

      // Refresh form with next step
      const nextIndex = STANDARD_CNC_STEPS.findIndex((s) => s.value === routingMoveForm.to_step);
      const afterNextStep = nextIndex >= 0 && nextIndex < STANDARD_CNC_STEPS.length - 1
        ? STANDARD_CNC_STEPS[nextIndex + 1].value
        : 'Đã QC nghiệm thu & Nhập kho thành phẩm';

      setRoutingMoveForm(prev => ({
        ...prev,
        from_step: prev.to_step,
        to_step: afterNextStep,
        qty_failed: 0,
        fail_reason: '',
        fail_reason_category: '',
      }));
    } catch (err) {
      showError('Lỗi chuyển bước', err.response?.data?.message || err.message);
    }
  };

  const handleQuickMoveStep = (order) => {
    const remaining = Math.max(1, (Number(order.target_qty) || 0) - (Number(order.ng_qty) || 0));
    const currentIndex = STANDARD_CNC_STEPS.findIndex((s) => s.value === order.current_step);
    const nextStep = currentIndex >= 0 && currentIndex < STANDARD_CNC_STEPS.length - 1
      ? STANDARD_CNC_STEPS[currentIndex + 1].value
      : (order.current_step === 'Kiểm tra KCS / QC' ? 'Đã QC nghiệm thu & Nhập kho thành phẩm' : 'Phay CNC mặt chuẩn');

    let suggestedMachine = 'Máy Phay CNC Mazak VCN-530C (#01)';
    if (nextStep.includes('Cắt phôi')) suggestedMachine = 'Máy Cưa Vòng Amada HFA-300 Tự Động';
    else if (nextStep.includes('Tiện')) suggestedMachine = 'Máy Tiện CNC Doosan Lynx 220 (#01)';
    else if (nextStep.includes('Cắt dây') || nextStep.includes('EDM')) suggestedMachine = 'Máy Cắt Dây CNC Sodick AQ327L (#01)';
    else if (nextStep.includes('Mài')) suggestedMachine = 'Máy Mài Phẳng Okamoto ACC-DX (#01)';
    else if (nextStep.includes('QC') || nextStep.includes('KCS')) suggestedMachine = 'Máy Đo 3D CMM Mitutoyo & Bàn Map';

    const matchingOp = operators.find(op => {
      if (nextStep.includes('Cắt phôi')) return op.skill_level?.includes('cưa') || op.skill_level?.includes('phôi');
      if (nextStep.includes('Tiện')) return op.skill_level?.includes('Tiện');
      if (nextStep.includes('Phay')) return op.skill_level?.includes('Phay');
      if (nextStep.includes('Cắt dây')) return op.skill_level?.includes('Cắt');
      if (nextStep.includes('Mài')) return op.skill_level?.includes('Mài');
      return false;
    });

    setWipForm({
      production_order_id: order.id,
      from_step: order.current_step || 'Cắt phôi',
      to_step: nextStep,
      operator: matchingOp?.name || user?.full_name || '',
      machine_name: suggestedMachine,
      qty_passed: remaining,
      qty_failed: 0,
      fail_reason: '',
      fail_reason_category: '',
      fail_reason_detail: '',
      action_on_error: 'continue',
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

  
  const handleQuickImportMaterial = async (material, missingQty) => {
    if (!material) return;
    try {
      await api.post(`/inventory/materials/${material.id}/adjust-stock`, {
        changeAmount: missingQty,
      });
      showSuccess(
        'Nhập kho bổ sung thành công!',
        `Đã nhập thêm +${missingQty} ${material.unit} vào kho cho "${material.name}". Tồn kho đã sẵn sàng!`
      );
      loadData(true);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'material_restocked' } }));
    } catch (err) {
      showError('Lỗi nhập kho', err.response?.data?.message || err.message);
    }
  };

  const handleQuickAdvanceForMaterial = async (material, missingQty) => {
    if (!material) return;
    const estAmount = Math.max(500000, Math.round(missingQty * (Number(material.unit_price) || 500000)));
    try {
      await api.post('/finance/advances', {
        requester: user?.full_name || 'Quản đốc xưởng CNC',
        purpose: `Mua bổ sung ${missingQty} ${material.unit} phôi "${material.name}" phục vụ LSX`,
        amount: estAmount,
      });
      showSuccess(
        'Đã gửi đề nghị tạm ứng!',
        `Đã tạo phiếu tạm ứng mua phôi ${estAmount.toLocaleString()} đ gửi Ban Giám đốc & Kế toán duyệt.`
      );
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'advance_created' } }));
    } catch (err) {
      showError('Lỗi lập tạm ứng', err.response?.data?.message || err.message);
    }
  };

  const handleIssueMaterial = async (order) => {
    try {
      await api.post(`/production/orders/${order.id}/issue-material`);
      showSuccess(
        'Cấp phôi thành công!',
        `Đã xuất kho ${order.material_qty_needed || order.target_qty} phôi "${order.material_name || 'vật tư'}" cấp cho xưởng sản xuất.`
      );
      loadData(true);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'material_issued' } }));
    } catch (err) {
      showError('Lỗi cấp phôi', err.response?.data?.message || err.message);
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

  const handleResumeLsx = async (order) => {
    try {
      await api.put(`/production/orders/${order.id}`, {
        status: 'running',
        current_step: order.current_step?.replace(/^Tạm dừng: /, '')?.replace(/ \(Sự cố NG\)$/, '') || 'Phay CNC mặt chuẩn',
      });
      showSuccess('Đã mở lại lệnh sản xuất!', `Lệnh sản xuất ${order.code} đã tiếp tục gia công bình thường.`);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'lsx_resumed' } }));
      loadData();
    } catch (err) {
      showError('Lỗi mở lại LSX', err.response?.data?.message || err.message);
    }
  };

  const handleCreateWip = async (e) => {
    e.preventDefault();
    if (Number(wipForm.qty_passed) === 0 && Number(wipForm.qty_failed) === 0) {
      showError('Thiếu thông tin', 'Vui lòng nhập số lượng đạt chuẩn hoặc số lượng lỗi.');
      return;
    }

    const defectReasonText = (wipForm.fail_reason || wipForm.fail_reason_category || '').trim();
    if (Number(wipForm.qty_failed) > 0 && !defectReasonText) {
      showError('Chưa nhập nguyên nhân lỗi', 'Phát hiện chi tiết lỗi NG. Vui lòng bấm chọn gợi ý hoặc tự nhập mô tả nguyên nhân lỗi cụ thể.');
      return;
    }

    const combinedFailReason = Number(wipForm.qty_failed) > 0 ? defectReasonText : '';

    const isStopping = wipForm.action_on_error === 'stop' || (Number(wipForm.qty_passed) === 0 && Number(wipForm.qty_failed) > 0);

    try {
      await api.post('/production/wip-movements', {
        ...wipForm,
        fail_reason: combinedFailReason,
        action_on_error: isStopping ? 'stop' : 'continue',
      });
      setIsWipModalOpen(false);
      loadData();
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'wip_created' } }));

      if (isStopping) {
        showError(
          'Đã tạm dừng lệnh sản xuất',
          `Phát hiện ${wipForm.qty_failed} chi tiết lỗi (${wipForm.fail_reason_category}). Lệnh sản xuất đã được tạm dừng khẩn cấp để rà soát đồ gá/dao cụ máy.`
        );
      } else {
        showSuccess(
          'Luân chuyển BTP thành công!',
          `Đã chuyển ${wipForm.qty_passed} chi tiết đạt sang ${wipForm.to_step}${Number(wipForm.qty_failed) > 0 ? ` (Đã cô lập ${wipForm.qty_failed} chi tiết lỗi phế phẩm)` : ''}.`
        );
      }
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
    const defaultQty = Number(lsx.completed_qty) > 0 ? Number(lsx.completed_qty) : (Number(lsx.target_qty) || 1);
    setHandoverQty(defaultQty);
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
  const handleOpenCreateOperator = (workshopId = '') => {
    const nextCode = `THO-${String(operators.length + 1).padStart(3, '0')}`;
    setOperatorForm({
      code: nextCode,
      name: '',
      phone: '',
      workshop_id: workshopId || (workshops[0]?.id ? String(workshops[0].id) : ''),
      skill_level: 'Thợ bậc 4/7 - Vận hành Phay/Tiện CNC',
      shift: 'Ca 1 (Hành chính)',
      status: 'active',
      notes: '',
    });
    setIsOperatorModalOpen(true);
  };

  const handleSaveOperator = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!operatorForm.name.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập họ và tên thợ máy.');
      return;
    }
    try {
      await api.post('/production/operators', {
        ...operatorForm,
        workshop_id: operatorForm.workshop_id ? Number(operatorForm.workshop_id) : null,
      });
      setIsOperatorModalOpen(false);
      showSuccess('Thêm thợ máy thành công!', `Thợ máy "${operatorForm.name}" đã được bổ sung vào hệ thống.`);
      loadData();
    } catch (err) {
      showError('Lỗi thêm thợ máy', err.response?.data?.message || err.message);
    }
  };

  const handleOpenEditOperator = (op) => {
    setEditOperatorForm({
      id: op.id,
      code: op.code,
      name: op.name,
      phone: op.phone || '',
      workshop_id: op.workshop_id ? String(op.workshop_id) : '',
      skill_level: op.skill_level || '',
      shift: op.shift || 'Ca 1 (Hành chính)',
      status: op.status || 'active',
      notes: op.notes || '',
    });
    setIsEditOperatorModalOpen(true);
  };

  const handleUpdateOperator = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editOperatorForm.name.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập họ tên thợ máy.');
      return;
    }
    try {
      await api.put(`/production/operators/${editOperatorForm.id}`, {
        ...editOperatorForm,
        workshop_id: editOperatorForm.workshop_id ? Number(editOperatorForm.workshop_id) : null,
      });
      setIsEditOperatorModalOpen(false);
      showSuccess('Cập nhật thành công!', `Đã lưu thông tin cho thợ máy "${editOperatorForm.name}".`);
      loadData();
    } catch (err) {
      showError('Lỗi cập nhật thợ máy', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteOperator = (op) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Thợ Máy CNC',
      itemName: `${op.code} - ${op.name}`,
      message: `Bạn có chắc chắn muốn xóa hồ sơ thợ máy "${op.name}" khỏi hệ thống không?`,
      onConfirm: async () => {
        try {
          await api.delete(`/production/operators/${op.id}`);
          showSuccess('Đã xóa thành công!', `Hồ sơ thợ máy "${op.name}" đã được xóa.`);
          loadData();
        } catch (err) {
          showError('Lỗi xóa thợ máy', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleOpenAssignWorkers = (ws) => {
    setSelectedWorkshopForDetail(ws);
    // Pre-select workers already in this workshop
    const currentWsOpIds = operators.filter((op) => op.workshop_id === ws.id).map((op) => op.id);
    setSelectedWorkerIdsForAssign(currentWsOpIds);
    setAssignWorkerSearch('');
    setAssignWorkerFilter('all');
    setIsAssignWorkersModalOpen(true);
  };

  const handleSaveAssignedWorkers = async () => {
    if (!selectedWorkshopForDetail) return;
    try {
      await api.post('/production/operators/assign-workshop', {
        workshop_id: selectedWorkshopForDetail.id,
        operator_ids: selectedWorkerIdsForAssign,
      });
      setIsAssignWorkersModalOpen(false);
      loadData();
      showSuccess(
        'Phân công thành công!',
        `Đã phân công ${selectedWorkerIdsForAssign.length} công nhân vào ${selectedWorkshopForDetail.name}.`
      );
    } catch (err) {
      showError('Lỗi phân công công nhân', err.response?.data?.message || err.message);
    }
  };

  const handleOpenRecordOutput = (lsx) => {
    setSelectedLsxForRecord(lsx);
    const remain = Math.max(1, (Number(lsx.target_qty) || 0) - (Number(lsx.completed_qty) || 0));
    
    // Suggest first matching operator from this workshop or any operator
    const ws = workshops.find((w) => w.name === lsx.workshop_name || w.code === lsx.workshop_name);
    const wsOps = ws ? operators.filter((op) => op.workshop_id === ws.id) : operators;
    const defaultOp = wsOps[0]?.name || operators[0]?.name || '';

    setWorkerOutputForm({
      operator: defaultOp,
      step_name: lsx.current_step || 'Phay CNC mặt chuẩn',
      machine_name: 'Máy Phay CNC Mazak VCN-530C (#01)',
      qty_passed: remain,
      qty_failed: 0,
      fail_reason: '',
    });
    setIsRecordOutputModalOpen(true);
  };

  const handleSaveWorkerOutput = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedLsxForRecord) return;
    if (!workerOutputForm.operator) {
      showError('Thiếu thông tin', 'Vui lòng chọn công nhân thực hiện.');
      return;
    }
    if (Number(workerOutputForm.qty_passed) <= 0 && Number(workerOutputForm.qty_failed) <= 0) {
      showError('Thiếu thông tin', 'Vui lòng nhập số lượng hoàn thành đạt chuẩn hoặc số lượng lỗi.');
      return;
    }

    try {
      const activeStepList = cncSteps.length > 0 ? cncSteps : STANDARD_CNC_STEPS.map((s, i) => ({ name: s.value }));
      const curIdx = activeStepList.findIndex((s) => s.name === workerOutputForm.step_name);
      const nextStep = curIdx >= 0 && curIdx < activeStepList.length - 1
        ? activeStepList[curIdx + 1].name
        : 'Hoàn thành & Bàn giao kho';

      await api.post('/production/wip-movements', {
        production_order_id: selectedLsxForRecord.id,
        from_step: workerOutputForm.step_name,
        to_step: nextStep,
        operator: workerOutputForm.operator,
        machine_name: workerOutputForm.machine_name,
        qty_passed: Number(workerOutputForm.qty_passed) || 0,
        qty_failed: Number(workerOutputForm.qty_failed) || 0,
        fail_reason: workerOutputForm.fail_reason || '',
      });

      setIsRecordOutputModalOpen(false);
      loadData();

      const newTotal = Number(selectedLsxForRecord.completed_qty || 0) + (Number(workerOutputForm.qty_passed) || 0);
      const isDone = newTotal >= Number(selectedLsxForRecord.target_qty);

      if (isDone) {
        window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'worker_output_recorded' } }));
        showSuccess(
          'Đạt đủ số lượng kế hoạch!',
          `Công nhân ${workerOutputForm.operator} đã hoàn thành ghi nhận ${workerOutputForm.qty_passed} chi tiết. Lệnh sản xuất ${selectedLsxForRecord.code} đã đạt ${newTotal}/${selectedLsxForRecord.target_qty} và chuyển sang trạng thái Hoàn thành!`
        );
      } else {
        showSuccess(
          'Ghi nhận sản lượng thành công!',
          `Đã ghi nhận ${workerOutputForm.qty_passed} chi tiết đạt cho công nhân ${workerOutputForm.operator}. Tiến độ hiện tại: ${newTotal}/${selectedLsxForRecord.target_qty}.`
        );
      }
    } catch (err) {
      showError('Lỗi ghi nhận sản lượng', err.response?.data?.message || err.message);
    }
  };

  const handleOpenLsxHistory = (lsx) => {
    setSelectedLsxForHistory(lsx);
    setIsHistoryModalOpen(true);
  };

  const handleOpenWorkshopDetail = (ws) => {
    setSelectedWorkshopForDetail(ws);
    setIsWorkshopDetailOpen(true);
  };



  return (
    <div className="space-y-6">
      {/* Sub Tabs: Only show for Production module, hide completely when on dedicated Operators screen */}
      {subTab !== 'operators' && (
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
      )}

      {/* LSX SubTab */}
      {subTab === 'lsx' && (
        <Table
          isLoading={loading}
          data={orders}
          onRowClick={(row) => handleOpenRoutingModal(row)}
          columns={[
            {
              header: 'Mã LSX',
              render: (row) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoutingModal(row);
                  }}
                  className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 cursor-pointer text-left group"
                  title="Nhấp để xem toàn bộ quy trình & luân chuyển từng bước"
                >
                  <span>{row.code}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 transition" />
                </button>
              ),
            },
            {
              header: 'Chi tiết gia công & Phân xưởng',
              render: (row) => (
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRoutingModal(row);
                    }}
                    className="font-bold text-slate-800 hover:text-blue-600 hover:underline text-left cursor-pointer transition block"
                    title="Nhấp để xem toàn bộ quy trình & luân chuyển từng bước"
                  >
                    {row.part_name}
                  </button>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                      <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                      {row.workshop_name || 'Xưởng A (Phay Mazak, Tiện Doosan)'}
                    </span>
                    {row.material_name && (
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                        row.material_status === 'issued'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                          : 'bg-amber-50 text-amber-700 border-amber-200 font-medium'
                      }`}>
                        Phôi: {row.material_name} ({row.material_qty_needed || row.target_qty}) — {row.material_status === 'issued' ? 'Đã xuất kho' : 'Chờ cấp phôi'}
                      </span>
                    )}
                  </div>
                </div>
              ),
            },
            { header: 'Mã bản vẽ', accessor: 'drawing_code', cellClassName: 'font-mono' },
            { header: 'Kế hoạch', accessor: 'target_qty', cellClassName: 'font-bold' },
            {
              header: 'Tiến độ hoàn thành',
              render: (row) => {
                const percent = Math.min(100, Math.round((Number(row.completed_qty) / Number(row.target_qty)) * 100));
                const isDone = Number(row.completed_qty) >= Number(row.target_qty);
                const isOver = Number(row.completed_qty) > Number(row.target_qty);

                return (
                  <div className="w-44">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">Đạt: {row.completed_qty}/{row.target_qty}</span>
                        {isOver && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                            +{Number(row.completed_qty) - Number(row.target_qty)} dư
                          </span>
                        )}
                      </div>
                      <span className={`font-bold ${isDone ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {isDone && (
                      <div className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã đủ số lượng kế hoạch</span>
                      </div>
                    )}
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
              render: (row) => {
                if (row.status === 'paused') {
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
                      Tạm dừng (Lỗi NG)
                    </span>
                  );
                }
                return <Badge status={row.status}>{row.status}</Badge>;
              },
            },
            {
              header: 'Thao tác',
              render: (row) => {
                const isFullyProduced = Number(row.completed_qty) >= Number(row.target_qty) && Number(row.target_qty) > 0;
                const isAtFinalStep = row.current_step && (
                  row.current_step.includes('QC') || 
                  row.current_step.includes('KCS') || 
                  row.current_step.includes('Hoàn thành') || 
                  row.current_step.includes('bàn giao')
                );
                const isAlreadyHandedOver = row.status === 'finished';
                const canHandover = (isFullyProduced || isAtFinalStep) && !isAlreadyHandedOver;
                const canMoveStep = !isAlreadyHandedOver && !isFullyProduced;

                return (
                  <div className="flex items-center gap-1.5">
                    {row.material_name && row.material_status !== 'issued' && canManageProduction && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleIssueMaterial(row)}
                        className="text-xs py-1 px-2 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold"
                        title="Xuất kho phôi cấp cho xưởng gia công"
                      >
                        Cấp phôi
                      </Button>
                    )}
                    {canManageProduction && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Workflow}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRoutingModal(row);
                        }}
                        className="text-xs py-1 px-2 border-indigo-200 text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 font-semibold"
                        title="Xem toàn bộ 7 công đoạn & luân chuyển từng bước"
                      >
                        Quy trình
                      </Button>
                    )}
                    {canMoveStep && canManageProduction && (
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
                    {canHandover && canManageProduction && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={CheckCircle2}
                        onClick={() => handleOpenHandover(row)}
                        className="text-xs py-1 px-2 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                        title="Nghiệm thu QC đạt và bàn giao thành phẩm nhập kho"
                      >
                        Bàn giao kho
                      </Button>
                    )}
                    {canManageProduction && (
                      <button
                        onClick={() => handleOpenEditLsx(row)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa lệnh sản xuất"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
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
          onRowClick={(row) => handleOpenWorkshopDetail(row)}
          emptyMessage="Chưa có phân xưởng nào. Bấm 'Thêm phân xưởng mới' để khởi tạo."
          columns={[
            {
              header: 'Mã Xưởng',
              render: (row) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWorkshopDetail(row);
                  }}
                  className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Bấm để xem chi tiết & công đoạn xưởng"
                >
                  <span>{row.code}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
              ),
            },
            {
              header: 'Tên Phân Xưởng',
              render: (row) => (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWorkshopDetail(row);
                  }}
                  className="cursor-pointer group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-blue-600 transition flex items-center gap-1.5">
                    <span>{row.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-normal opacity-0 group-hover:opacity-100 transition">Xem chi tiết</span>
                  </div>
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
              header: 'Quy Mô & Công Đoạn',
              render: (row) => {
                const wsOps = operators.filter((op) => op.workshop_id === row.id);
                const wsSteps = cncSteps.filter((s) => s.workshop_id === row.id);
                return (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {row.machine_count || 0} máy
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {wsOps.length} thợ
                    </span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {wsSteps.length} công đoạn
                    </span>
                  </div>
                );
              },
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
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenWorkshopDetail(row)}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer flex items-center gap-1 border border-blue-200"
                    title="Xem danh sách thợ máy & công đoạn của xưởng"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem xưởng</span>
                  </button>
                  {canManageProduction && (
                    <>
                      <button
                        onClick={() => handleOpenEditWorkshop(row)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa thông tin xưởng"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkshop(row)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
                Đã tự động điền Tên chi tiết, Mã bản vẽ và Số lượng từ đơn hàng SO đã chọn.
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
          {/* Chọn Phôi vật tư & Kiểm tra tồn kho đối soát thực tế */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Phôi vật tư gia công (*)
              </label>
              <span className="text-[11px] text-slate-500">
                Đối soát tồn kho vật tư thực tế
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Chọn loại phôi từ Kho"
                value={lsxForm.material_id}
                onChange={(e) => {
                  const matId = e.target.value;
                  const mat = materials.find((m) => String(m.id) === String(matId));
                  setLsxForm((prev) => ({
                    ...prev,
                    material_id: matId,
                    material_name: mat ? mat.name : '',
                  }));
                }}
                options={[
                  { value: '', label: '-- Chọn phôi từ kho vật tư --' },
                  ...materials.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.code}) - Tồn: ${Number(m.quantity).toLocaleString('vi-VN')} ${m.unit}`,
                  })),
                ]}
              />

              <Input
                label="Số lượng phôi cần cấp"
                type="number"
                value={lsxForm.material_qty_needed}
                onChange={(e) => setLsxForm((prev) => ({ ...prev, material_qty_needed: Number(e.target.value) }))}
              />
            </div>

            {/* Khung Đối soát Tồn kho & Cảnh báo thiếu phôi */}
            {(() => {
              const selectedMat = materials.find((m) => String(m.id) === String(lsxForm.material_id));
              if (!selectedMat) return null;
              const stockQty = Number(selectedMat.quantity || 0);
              const needed = Number(lsxForm.material_qty_needed || 0);
              const isSufficient = stockQty >= needed;
              const missingQty = Math.max(0, needed - stockQty);

              return (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-2 ${
                    isSufficient
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/90 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>
                      {isSufficient
                        ? `Tồn kho đủ cấp: Hiện có ${stockQty.toLocaleString('vi-VN')} ${selectedMat.unit} (Cần: ${needed.toLocaleString('vi-VN')} ${selectedMat.unit}). Phôi sẵn sàng xuất cho xưởng!`
                        : `Cảnh báo thiếu phôi: Kho chỉ còn ${stockQty.toLocaleString('vi-VN')} ${selectedMat.unit}, thiếu ${missingQty.toLocaleString('vi-VN')} ${selectedMat.unit} để chạy lệnh này!`}
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Đơn giá: {Number(selectedMat.unit_price).toLocaleString()} đ/{selectedMat.unit}
                    </span>
                  </div>

                  {/* Nút hành động trực tiếp nếu thiếu phôi */}
                  {!isSufficient && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/80">
                      <span className="text-amber-800 font-medium">Hành động khắc phục:</span>

                      <button
                        type="button"
                        onClick={() => handleQuickAdvanceForMaterial(selectedMat, missingQty)}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer shadow-xs"
                      >
                        Lập đề nghị tạm ứng mua phôi
                      </button>
                    </div>
                  )}

                  {isSufficient && (
                    <label className="flex items-center gap-2 pt-1 cursor-pointer text-emerald-800 font-medium">
                      <input
                        type="checkbox"
                        checked={lsxForm.auto_issue_material}
                        onChange={(e) => setLsxForm((prev) => ({ ...prev, auto_issue_material: e.target.checked }))}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tự động xuất kho {needed.toLocaleString('vi-VN')} {selectedMat.unit} phôi khi tạo Lệnh sản xuất</span>
                    </label>
                  )}
                </div>
              );
            })()}
          </div>

          <Select
            label="Công đoạn bắt đầu của LSX"
            value={lsxForm.current_step}
            onChange={(e) => setLsxForm({ ...lsxForm, current_step: e.target.value })}
            options={stepOptions}
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
            <Button
              variant={Number(wipForm.qty_passed) === 0 && Number(wipForm.qty_failed) > 0 ? 'danger' : wipForm.action_on_error === 'stop' && Number(wipForm.qty_failed) > 0 ? 'danger' : 'primary'}
              onClick={handleCreateWip}
            >
              {Number(wipForm.qty_passed) === 0 && Number(wipForm.qty_failed) > 0
                ? 'Tạm dừng lệnh sản xuất'
                : wipForm.action_on_error === 'stop' && Number(wipForm.qty_failed) > 0
                ? 'Tạm dừng lệnh sản xuất'
                : 'Xác Nhận Luân Chuyển'}
            </Button>
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
              options={stepOptions}
              required
            />
          </div>

                    {/* Thợ máy CNC & Tổ máy thực hiện (Dropdown thông minh + Nhập linh hoạt) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Dropdown
                label="Thợ máy CNC vận hành"
                placeholder="-- Chọn thợ máy CNC phụ trách --"
                value={operators.some((op) => op.name === wipForm.operator) ? wipForm.operator : (wipForm.operator ? '__custom__' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setWipForm(prev => ({ ...prev, operator: '' }));
                  } else {
                    setWipForm(prev => ({ ...prev, operator: val }));
                  }
                }}
                options={operators.map((op) => ({
                  value: op.name,
                  label: `${op.code} - ${op.name}`,
                  description: op.skill_level,
                  badge: op.workshop_name ? op.workshop_name.split(' ')[0] : (op.workshop_code || undefined),
                  group: op.workshop_name || 'Phân xưởng chung',
                }))}
                searchable={true}
                customActions={[
                  {
                    label: 'Nhập tên thợ máy khác...',
                    value: '__custom__',
                    onClick: () => setWipForm(prev => ({ ...prev, operator: '' })),
                  },
                ]}
              />
              {(!operators.some((op) => op.name === wipForm.operator) || wipForm.operator === '') && (
                <input
                  type="text"
                  placeholder="Gõ tên thợ máy tại đây..."
                  value={wipForm.operator}
                  onChange={(e) => setWipForm({ ...wipForm, operator: e.target.value })}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-blue-50/20"
                />
              )}
            </div>

            <div>
              <Dropdown
                label="Tổ máy CNC thực hiện"
                placeholder="-- Chọn tổ máy CNC thực hiện --"
                value={FACTORY_MACHINES.some((m) => m === wipForm.machine_name) ? wipForm.machine_name : (wipForm.machine_name ? '__custom__' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setWipForm(prev => ({ ...prev, machine_name: '' }));
                  } else {
                    setWipForm(prev => ({ ...prev, machine_name: val }));
                  }
                }}
                groups={FACTORY_MACHINE_GROUPS}
                searchable={true}
                customActions={[
                  {
                    label: 'Nhập tổ máy khác...',
                    value: '__custom__',
                    onClick: () => setWipForm(prev => ({ ...prev, machine_name: '' })),
                  },
                ]}
              />
              {(!FACTORY_MACHINES.some((m) => m === wipForm.machine_name) || wipForm.machine_name === '') && (
                <input
                  type="text"
                  placeholder="Gõ tên tổ máy tại đây..."
                  value={wipForm.machine_name}
                  onChange={(e) => setWipForm({ ...wipForm, machine_name: e.target.value })}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-blue-50/20"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số lượng ĐẠT chuẩn"
              type="number"
              min="0"
              value={wipForm.qty_passed}
              onChange={(e) => setWipForm({ ...wipForm, qty_passed: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              required
            />
            <Input
              label="Số lượng LỖI phế phẩm (NG)"
              type="number"
              min="0"
              value={wipForm.qty_failed}
              onChange={(e) => setWipForm({ ...wipForm, qty_failed: Math.max(0, parseInt(e.target.value, 10) || 0) })}
            />
          </div>

          {Number(wipForm.qty_failed) === 0 ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% chi tiết đạt chuẩn chất lượng OK, không phát hiện lỗi phế phẩm.</span>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <span>Phát hiện {wipForm.qty_failed} chi tiết phế phẩm (NG) - Phân loại nguyên nhân và phương án xử lý:</span>
              </div>

              {/* Gợi ý chọn nhanh & Ô tự nhập kết hợp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nguyên nhân lỗi gia công (*):
                </label>

                {/* Các nút bấm chọn nhanh */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { label: 'Vượt dung sai', prefix: 'Sai kích thước / Vượt dung sai bản vẽ' },
                    { label: 'Mẻ / Gãy dao', prefix: 'Mẻ lưỡi cắt / Gãy mũi dao / Cháy dao' },
                    { label: 'Độ nhám / Xước', prefix: 'Bề mặt xước / Độ nhám Ra không đạt' },
                    { label: 'Kẹp lệch / Rung gá', prefix: 'Rà gá phôi lệch / Kẹp lỏng phôi / Rung lắc' },
                    { label: 'Lỗi phôi / Rỗ khí', prefix: 'Lỗi phôi vật tư / Rỗ khí / Cong vênh' },
                    { label: 'Lỗi G-code / CAM', prefix: 'Lỗi chương trình CAM / Nhầm tọa độ G54' },
                    { label: 'Bavia / Biến dạng', prefix: 'Bavia quá dày / Biến dạng nhiệt khi gia công' },
                  ].map((item, idx) => {
                    const isSelected = (wipForm.fail_reason || '').startsWith(item.prefix);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const currentVal = wipForm.fail_reason || '';
                          const existingDetail = currentVal.includes(': ')
                            ? currentVal.split(': ').slice(1).join(': ')
                            : '';
                          const newReason = existingDetail
                            ? `${item.prefix}: ${existingDetail}`
                            : `${item.prefix}: `;
                          setWipForm({
                            ...wipForm,
                            fail_reason: newReason,
                            fail_reason_category: item.prefix,
                            fail_reason_detail: existingDetail,
                          });
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white border-slate-800 font-semibold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ô nhập chi tiết trực tiếp */}
                <textarea
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white placeholder:text-slate-400 text-slate-800 leading-relaxed"
                  placeholder="Ghi chú chi tiết nguyên nhân lỗi hoặc biện pháp xử lý kỹ thuật..."
                  value={wipForm.fail_reason || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWipForm({
                      ...wipForm,
                      fail_reason: val,
                      fail_reason_detail: val,
                      fail_reason_category: val.includes(': ') ? val.split(': ')[0] : (val ? 'Tự nhập' : ''),
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phương án kiểm soát chất lượng (Quy tắc dừng):
                </label>
                {Number(wipForm.qty_passed) === 0 ? (
                  <div className="p-2.5 bg-rose-100/90 border border-rose-300 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                    <span>
                      Toàn bộ chi tiết không đạt (0 đạt / {wipForm.qty_failed} phế phẩm). Lệnh sản xuất sẽ tạm dừng để kỹ thuật kiểm tra.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label
                      className={`flex items-start gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                        wipForm.action_on_error === 'stop'
                          ? 'bg-rose-100/80 border-rose-400 text-rose-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="wip_action_on_error"
                        value="stop"
                        checked={wipForm.action_on_error === 'stop'}
                        onChange={() => setWipForm({ ...wipForm, action_on_error: 'stop' })}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="block font-semibold">Tạm dừng lệnh để kiểm tra máy</span>
                        <span className="text-[11px] text-slate-500 font-normal">Dừng máy khẩn cấp để rà dao/gá, tránh hỏng thêm</span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                        wipForm.action_on_error === 'continue'
                          ? 'bg-amber-100/80 border-amber-400 text-amber-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="wip_action_on_error"
                        value="continue"
                        checked={wipForm.action_on_error === 'continue'}
                        onChange={() => setWipForm({ ...wipForm, action_on_error: 'continue' })}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="block font-semibold">Chuyển {wipForm.qty_passed} chi tiết đạt</span>
                        <span className="text-[11px] text-slate-500 font-normal">Cô lập {wipForm.qty_failed} chi tiết lỗi vào phế phẩm</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
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
                Đã tự động điền Tên chi tiết và Số lượng từ Lệnh sản xuất đã chọn.
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
              <strong>Lưu ý:</strong> Khi xác nhận, số lượng chi tiết đạt chuẩn sẽ được chuyển giao vào Kho Thành Phẩm. Thủ kho và bộ phận Bán hàng có thể lập Phiếu Giao Hàng (Delivery Note) để xuất giao cho đơn hàng SO.
            </div>
          </form>
        </Modal>
      )}

      {/* Edit LSX Modal */}
      {isEditLsxOpen && (
        <Modal
          isOpen={isEditLsxOpen}
          onClose={() => setIsEditLsxOpen(false)}
          title="Chỉnh Sửa Lệnh Sản Xuất CNC"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditLsxOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleUpdateLsx} icon={Pencil}>
                Lưu Thay Đổi
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleUpdateLsx}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Số lượng kế hoạch cần sản xuất"
                type="number"
                value={editLsxForm.target_qty}
                onChange={(e) => setEditLsxForm({ ...editLsxForm, target_qty: Number(e.target.value) })}
                required
              />
              <Select
                label="Phân xưởng CNC phụ trách"
                value={editLsxForm.workshop_name}
                onChange={(e) => setEditLsxForm({ ...editLsxForm, workshop_name: e.target.value })}
                options={[
                  { value: '', label: '-- Chọn xưởng nhận lệnh --' },
                  ...workshops.map((ws) => ({
                    value: `${ws.name} (${ws.main_machines || ws.code})`,
                    label: `${ws.name} (${ws.main_machines || ws.code})`,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Công đoạn hiện tại"
                value={editLsxForm.current_step}
                onChange={(e) => setEditLsxForm({ ...editLsxForm, current_step: e.target.value })}
                options={STANDARD_CNC_STEPS.map((s) => ({ value: s.value, label: s.label }))}
              />
              <Select
                label="Mức độ ưu tiên"
                value={editLsxForm.priority}
                onChange={(e) => setEditLsxForm({ ...editLsxForm, priority: e.target.value })}
                options={[
                  { value: 'Bình thường', label: 'Bình thường' },
                  { value: 'Gấp (Ưu tiên)', label: 'Gấp (Ưu tiên)' },
                  { value: 'Rất gấp (Hỏa tốc)', label: 'Rất gấp (Hỏa tốc)' },
                ]}
              />
            </div>

            <Select
              label="Trạng thái lệnh sản xuất"
              value={editLsxForm.status}
              onChange={(e) => setEditLsxForm({ ...editLsxForm, status: e.target.value })}
              options={[
                { value: 'in_progress', label: 'Đang gia công' },
                { value: 'completed', label: 'Đã hoàn thành' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
            />

            <Input
              label="Ghi chú kỹ thuật / Điều phối"
              placeholder="VD: Chú ý phay dung sai H7, kiểm dao sau mỗi 10 chi tiết..."
              value={editLsxForm.notes}
              onChange={(e) => setEditLsxForm({ ...editLsxForm, notes: e.target.value })}
            />
          </form>
        </Modal>
      )}
    
      {/* ========================================================================= */}
      {/* OPERATORS SUB-TAB: QUẢN LÝ THỢ MÁY CNC TOÀN XƯỞNG                         */}
      {/* ========================================================================= */}
      {subTab === 'operators' && (
        <div className="space-y-4">
          {/* Filter, Search & Add Operator Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-1">
              <div className="w-full sm:w-80">
                <Dropdown
                  size="sm"
                  value={operatorFilterWs}
                  onChange={(e) => setOperatorFilterWs(e.target.value)}
                  options={[
                    { value: 'all', label: `Tất cả phân xưởng (${operators.length} thợ)` },
                    ...workshops.map((w) => {
                      const count = operators.filter((op) => op.workshop_id === w.id).length;
                      return {
                        value: String(w.id),
                        label: `${w.code} - ${w.name}`,
                        badge: `${count} thợ`,
                      };
                    }),
                  ]}
                />
              </div>
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Tìm thợ theo tên, mã thợ, kỹ năng..."
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                />
              </div>
            </div>

            {canManageProduction && (
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => handleOpenCreateOperator()}
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Thêm Thợ Máy CNC
              </Button>
            )}
          </div>

          {/* Operators Table */}
          <Table
            isLoading={loading}
            data={operators
              .filter((op) => {
                if (operatorFilterWs !== 'all' && String(op.workshop_id) !== operatorFilterWs) return false;
                if (operatorSearch.trim()) {
                  const s = operatorSearch.toLowerCase();
                  return (
                    op.name?.toLowerCase().includes(s) ||
                    op.code?.toLowerCase().includes(s) ||
                    op.skill_level?.toLowerCase().includes(s) ||
                    op.phone?.includes(s) ||
                    op.workshop_name?.toLowerCase().includes(s)
                  );
                }
                return true;
              })}
            emptyMessage="Chưa có thợ máy nào phù hợp tiêu chí lọc. Bấm 'Thêm Thợ Máy CNC' để tạo mới."
            columns={[
              {
                header: 'Mã Thợ',
                accessor: 'code',
                cellClassName: 'font-mono font-bold text-blue-600',
              },
              {
                header: 'Họ và Tên Thợ Máy',
                render: (op) => (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {op.name ? op.name.slice(0, 1) : 'T'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">{op.name}</div>
                      {op.phone && <div className="text-[11px] text-slate-400 font-mono">{op.phone}</div>}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Phân Xưởng Trực Thuộc',
                render: (op) => {
                  const ws = workshops.find((w) => w.id === op.workshop_id);
                  return (
                    <div>
                      {ws ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Building2 className="w-3 h-3" />
                          <span>{ws.code} - {(ws.name || '').split('(')[0].trim()}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân xưởng</span>
                      )}
                    </div>
                  );
                },
              },
              {
                header: 'Bậc Thợ & Tay Nghề Đứng Máy',
                render: (op) => (
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">{op.skill_level || 'Thợ đứng máy CNC'}</div>
                    {op.notes && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{op.notes}</div>}
                  </div>
                ),
              },
              {
                header: 'Ca Làm Việc',
                render: (op) => (
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {op.shift || 'Ca 1 (Hành chính)'}
                  </span>
                ),
              },
              {
                header: 'Trạng Thái',
                render: (op) => (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    op.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {op.status === 'active' ? '● Sẵn sàng đứng máy' : 'Tạm vắng / Nghỉ'}
                  </span>
                ),
              },
              {
                header: 'Thao Tác',
                render: (op) => (
                  <div className="flex items-center gap-1.5">
                    {canManageProduction && (
                      <>
                        <button
                          onClick={() => handleOpenEditOperator(op)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Sửa thông tin thợ"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOperator(op)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Xóa hồ sơ thợ"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHI TIẾT PHÂN XƯỞNG, THỢ MÁY & CÔNG ĐOẠN CỦA XƯỞNG                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isWorkshopDetailOpen}
        onClose={() => setIsWorkshopDetailOpen(false)}
        title={selectedWorkshopForDetail ? `Chi Tiết ${selectedWorkshopForDetail.code} - ${selectedWorkshopForDetail.name}` : 'Chi Tiết Phân Xưởng'}
        size="xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  if (selectedWorkshopForDetail) {
                    handleOpenCreateOperator(String(selectedWorkshopForDetail.id));
                  }
                }}
              >
                Thêm Thợ Vào Xưởng
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Layers}
                onClick={() => {
                  if (selectedWorkshopForDetail) {
                    handleOpenAddStep(String(selectedWorkshopForDetail.id));
                  }
                }}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Thêm Công Đoạn Cho Xưởng
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setIsWorkshopDetailOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedWorkshopForDetail && (() => {
          const currentWs = workshops.find((w) => w.id === selectedWorkshopForDetail.id) || selectedWorkshopForDetail;
          const wsOperators = operators.filter((op) => op.workshop_id === currentWs.id);
          const wsSteps = cncSteps
            .filter((s) => s.workshop_id === currentWs.id)
            .sort((a, b) => (a.step_order || 0) - (b.step_order || 0));

          return (
            <div className="space-y-6">
              {/* Workshop Quick Overview Card */}
              <div className="bg-gradient-to-r from-blue-50/60 to-slate-50 p-4 rounded-2xl border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 block text-[11px]">Quản Đốc / Trưởng Ca:</span>
                  <span className="font-bold text-slate-800">{currentWs.manager_name || 'Chưa chỉ định'}</span>
                  {currentWs.phone && (
                    <span className="block text-slate-500 font-mono text-xs">{currentWs.phone}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Vị Trí Mặt Bằng:</span>
                  <span className="font-semibold text-slate-800">{currentWs.location || 'Khu xưởng'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Quy Mô Máy Móc:</span>
                  <span className="font-bold text-blue-700">{currentWs.machine_count || 1} máy CNC</span>
                </div>
                <div className="sm:col-span-3 pt-2 border-t border-blue-100/60">
                  <span className="text-slate-500 block text-[11px]">Dàn Thiết Bị & Máy Móc Chính:</span>
                  <span className="font-medium text-slate-700">{currentWs.main_machines || 'Chưa cập nhật'}</span>
                </div>
              </div>

              {/* SECTION 1: Operators of this workshop */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      1. Đội Ngũ Thợ Máy Trực Thuộc ({wsOperators.length} Thợ)
                    </h4>
                  </div>
                  {canManageProduction && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleOpenCreateOperator(String(currentWs.id))}
                      className="text-xs"
                    >
                      Thêm Thợ
                    </Button>
                  )}
                </div>

                {wsOperators.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Chưa có thợ máy nào được phân công vào xưởng này.</p>
                    {canManageProduction && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        icon={Plus}
                        onClick={() => handleOpenCreateOperator(String(currentWs.id))}
                      >
                        Thêm thợ đầu tiên vào xưởng
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {wsOperators.map((op) => (
                      <div key={op.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {op.name ? op.name.slice(0, 1) : 'T'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{op.name}</span>
                              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{op.code}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                op.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {op.status === 'active' ? 'Hoạt động' : 'Tạm vắng'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1 font-medium">
                              {op.skill_level}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              {op.phone && <span>{op.phone}</span>}
                              <span>⏰ {op.shift || 'Ca 1'}</span>
                            </div>
                          </div>
                        </div>
                        {canManageProduction && (
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => handleOpenEditOperator(op)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa thợ"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOperator(op)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa thợ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: Production Steps of this workshop */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        2. Các Công Đoạn Gia Công Chuyên Trách ({wsSteps.length} Công đoạn)
                      </h4>
                      <p className="text-[11px] text-slate-400">Các bước sản xuất do dàn máy và thợ của phân xưởng này đảm nhiệm thực hiện</p>
                    </div>
                  </div>
                  {canManageProduction && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleOpenAddStep(String(currentWs.id))}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-xs"
                    >
                      Thêm Công Đoạn
                    </Button>
                  )}
                </div>

                {wsSteps.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Chưa có công đoạn nào được gán chuyên trách cho phân xưởng này.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Bấm nút bên dưới để thêm công đoạn gia công mới trực thuộc xưởng.</p>
                    {canManageProduction && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                        icon={Plus}
                        onClick={() => handleOpenAddStep(String(currentWs.id))}
                      >
                        Thêm công đoạn đầu tiên cho xưởng
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {wsSteps.map((step) => (
                      <div key={step.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/30 transition">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            #{step.step_order}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{step.name}</span>
                              <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                                {currentWs.code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1 font-medium flex flex-wrap items-center gap-2">
                              <span className="text-slate-400">Tổ máy / Vai trò:</span>
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                                {step.assigned_role || 'Chưa chỉ định tổ máy'}
                              </span>
                            </div>
                            {step.assigned_operators && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[11px] text-slate-400">Công nhân phụ trách:</span>
                                {step.assigned_operators.split(',').map(s => s.trim()).filter(Boolean).map(workerName => (
                                  <span key={workerName} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                    <User className="w-2.5 h-2.5" />
                                    {workerName}
                                  </span>
                                ))}
                              </div>
                            )}
                            {step.description && (
                              <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {canManageProduction && (
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => handleOpenEditStep(step)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa công đoạn này"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa công đoạn này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: THÊM CÔNG ĐOẠN SẢN XUẤT MỚI                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
        title="Thêm Công Đoạn Gia Công Sản Xuất Mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddStepOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateStep} icon={Plus}>
              Thêm Công Đoạn
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateStep} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Thứ tự bước (#)"
                type="number"
                min="1"
                value={stepForm.step_order}
                onChange={(e) => setStepForm({ ...stepForm, step_order: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Tên Công Đoạn Gia Công"
                placeholder="VD: Cắt dây EDM rãnh khuôn, Phay CNC mặt chuẩn..."
                value={stepForm.name}
                onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Dropdown
                label="Phân Xưởng CNC Phụ Trách"
                placeholder="-- Dùng chung / Không cố định xưởng --"
                value={stepForm.workshop_id}
                onChange={(e) => setStepForm({ ...stepForm, workshop_id: e.target.value })}
                options={[
                  { value: '', label: '-- Dùng chung / Không cố định xưởng --' },
                  ...workshops.map((w) => ({
                    value: String(w.id),
                    label: `${w.code} - ${w.name}`,
                    badge: `${w.machine_count || 0} máy`,
                  })),
                ]}
              />
            </div>
            <Input
              label="Vai Trò / Tổ Máy Đảm Nhiệm"
              placeholder="VD: Thợ máy Phay CNC, Thợ Cắt Dây EDM..."
              value={stepForm.assigned_role}
              onChange={(e) => setStepForm({ ...stepForm, assigned_role: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phân Công Công Nhân Cụ Thể Cho Công Đoạn Này (Click chọn 1 hoặc nhiều người):
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {operators
                  .filter((op) => !stepForm.workshop_id || String(op.workshop_id) === String(stepForm.workshop_id))
                  .map((op) => {
                    const assignedList = (stepForm.assigned_operators || '').split(',').map(s => s.trim()).filter(Boolean);
                    const isChecked = assignedList.includes(op.name);
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                          let updated;
                          if (isChecked) {
                            updated = assignedList.filter(n => n !== op.name);
                          } else {
                            updated = [...assignedList, op.name];
                          }
                          setStepForm({ ...stepForm, assigned_operators: updated.join(', ') });
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <User className="w-3 h-3" />
                        <span>{op.name} ({op.code})</span>
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
              </div>
              {stepForm.assigned_operators && (
                <p className="text-[11px] text-blue-700 font-medium">
                  Đã phân công: <strong>{stepForm.assigned_operators}</strong>
                </p>
              )}
            </div>
          </div>

          <Input
            label="Mô Tả Chi Tiết / Tiêu Chuẩn Kỹ Thuật"
            placeholder="VD: Rà gá chuẩn phôi, chạy dao thô D16, chạy tinh dung sai ±0.01mm..."
            value={stepForm.description}
            onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA CÔNG ĐOẠN SẢN XUẤT                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditStepOpen}
        onClose={() => setIsEditStepOpen(false)}
        title="Chỉnh Sửa Công Đoạn Sản Xuất"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditStepOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateStep} icon={Pencil}>
              Cập Nhật Công Đoạn
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateStep} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Thứ tự bước (#)"
                type="number"
                min="1"
                value={stepForm.step_order}
                onChange={(e) => setStepForm({ ...stepForm, step_order: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Tên Công Đoạn Gia Công"
                value={stepForm.name}
                onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Dropdown
                label="Phân Xưởng CNC Phụ Trách"
                placeholder="-- Dùng chung / Không cố định xưởng --"
                value={stepForm.workshop_id}
                onChange={(e) => setStepForm({ ...stepForm, workshop_id: e.target.value })}
                options={[
                  { value: '', label: '-- Dùng chung / Không cố định xưởng --' },
                  ...workshops.map((w) => ({
                    value: String(w.id),
                    label: `${w.code} - ${w.name}`,
                    badge: `${w.machine_count || 0} máy`,
                  })),
                ]}
              />
            </div>
            <Input
              label="Tổ Máy / Thợ Phụ Trách Đảm Nhiệm"
              value={stepForm.assigned_role}
              onChange={(e) => setStepForm({ ...stepForm, assigned_role: e.target.value })}
            />
          </div>

          <Input
            label="Mô Tả Chi Tiết / Tiêu Chuẩn Kỹ Thuật"
            value={stepForm.description}
            onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: THÊM THỢ MÁY CNC MỚI                                               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        title="Thêm Thợ Máy CNC Mới Vào Xưởng"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOperatorModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveOperator} icon={Plus}>
              Lưu Thợ Máy
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveOperator} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã Thợ"
              placeholder="VD: THO-011"
              value={operatorForm.code}
              onChange={(e) => setOperatorForm({ ...operatorForm, code: e.target.value })}
              required
            />
            <Input
              label="Họ và Tên Thợ Máy"
              placeholder="VD: Nguyễn Văn Nam"
              value={operatorForm.name}
              onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số Điện Thoại"
              placeholder="VD: 0912..."
              value={operatorForm.phone}
              onChange={(e) => setOperatorForm({ ...operatorForm, phone: e.target.value })}
            />
            <div>
              <Dropdown
                label="Phân Xưởng Trực Thuộc"
                placeholder="-- Chưa gán phân xưởng --"
                value={operatorForm.workshop_id}
                onChange={(e) => setOperatorForm({ ...operatorForm, workshop_id: e.target.value })}
                options={[
                  { value: '', label: '-- Chưa gán phân xưởng --' },
                  ...workshops.map((w) => ({
                    value: String(w.id),
                    label: `${w.code} - ${w.name}`,
                    badge: `${w.machine_count || 0} máy`,
                  })),
                ]}
              />
            </div>
          </div>
          <Input
            label="Bậc Thợ & Tay Nghề Đứng Máy"
            placeholder="VD: Thợ bậc 5/7 - Đứng máy Phay CNC 4 trục"
            value={operatorForm.skill_level}
            onChange={(e) => setOperatorForm({ ...operatorForm, skill_level: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ca Làm Việc"
              value={operatorForm.shift}
              onChange={(e) => setOperatorForm({ ...operatorForm, shift: e.target.value })}
              options={[
                { value: 'Ca 1 (Hành chính)', label: 'Ca 1 (Hành chính: 08:00 - 17:00)' },
                { value: 'Ca 2 (Chiều/Đêm)', label: 'Ca 2 (Chiều/Đêm: 17:00 - 01:00)' },
                { value: 'Ca 3 (Đêm)', label: 'Ca 3 (Đêm: 01:00 - 08:00)' },
                { value: 'Xoay ca luân phiên', label: 'Xoay ca luân phiên' },
              ]}
            />
            <Select
              label="Trạng Thái"
              value={operatorForm.status}
              onChange={(e) => setOperatorForm({ ...operatorForm, status: e.target.value })}
              options={[
                { value: 'active', label: 'Hoạt động / Sẵn sàng đứng máy' },
                { value: 'busy', label: 'Đang chạy đơn hàng gấp' },
                { value: 'leave', label: 'Nghỉ phép / Tạm vắng' },
              ]}
            />
          </div>
          <Input
            label="Ghi chú kinh nghiệm / Dòng máy chuyên trách"
            placeholder="VD: Kinh nghiệm 5 năm Mastercam, rà gá chuẩn xác..."
            value={operatorForm.notes}
            onChange={(e) => setOperatorForm({ ...operatorForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA HỒ SƠ THỢ MÁY CNC                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditOperatorModalOpen}
        onClose={() => setIsEditOperatorModalOpen(false)}
        title="Chỉnh Sửa Hồ Sơ Thợ Máy CNC"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditOperatorModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateOperator} icon={Pencil}>
              Cập Nhật Thợ Máy
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateOperator} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã Thợ"
              value={editOperatorForm.code}
              onChange={(e) => setEditOperatorForm({ ...editOperatorForm, code: e.target.value })}
              required
            />
            <Input
              label="Họ và Tên Thợ Máy"
              value={editOperatorForm.name}
              onChange={(e) => setEditOperatorForm({ ...editOperatorForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số Điện Thoại"
              value={editOperatorForm.phone}
              onChange={(e) => setEditOperatorForm({ ...editOperatorForm, phone: e.target.value })}
            />
            <div>
              <Dropdown
                label="Phân Xưởng Trực Thuộc"
                placeholder="-- Chưa gán phân xưởng --"
                value={editOperatorForm.workshop_id}
                onChange={(e) => setEditOperatorForm({ ...editOperatorForm, workshop_id: e.target.value })}
                options={[
                  { value: '', label: '-- Chưa gán phân xưởng --' },
                  ...workshops.map((w) => ({
                    value: String(w.id),
                    label: `${w.code} - ${w.name}`,
                    badge: `${w.machine_count || 0} máy`,
                  })),
                ]}
              />
            </div>
          </div>
          <Input
            label="Bậc Thợ & Tay Nghề Đứng Máy"
            value={editOperatorForm.skill_level}
            onChange={(e) => setEditOperatorForm({ ...editOperatorForm, skill_level: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Ca Làm Việc"
              value={editOperatorForm.shift}
              onChange={(e) => setEditOperatorForm({ ...editOperatorForm, shift: e.target.value })}
              options={[
                { value: 'Ca 1 (Hành chính)', label: 'Ca 1 (Hành chính: 08:00 - 17:00)' },
                { value: 'Ca 2 (Chiều/Đêm)', label: 'Ca 2 (Chiều/Đêm: 17:00 - 01:00)' },
                { value: 'Ca 3 (Đêm)', label: 'Ca 3 (Đêm: 01:00 - 08:00)' },
                { value: 'Xoay ca luân phiên', label: 'Xoay ca luân phiên' },
              ]}
            />
            <Select
              label="Trạng Thái"
              value={editOperatorForm.status}
              onChange={(e) => setEditOperatorForm({ ...editOperatorForm, status: e.target.value })}
              options={[
                { value: 'active', label: 'Hoạt động / Sẵn sàng đứng máy' },
                { value: 'busy', label: 'Đang chạy đơn hàng gấp' },
                { value: 'leave', label: 'Nghỉ phép / Tạm vắng' },
              ]}
            />
          </div>
          <Input
            label="Ghi chú kinh nghiệm / Dòng máy chuyên trách"
            value={editOperatorForm.notes}
            onChange={(e) => setEditOperatorForm({ ...editOperatorForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: PHÂN CÔNG / THÊM CÔNG NHÂN VÀO PHÂN XƯỞNG (CHỌN 1 HOẶC NHIỀU)     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignWorkersModalOpen}
        onClose={() => setIsAssignWorkersModalOpen(false)}
        title={selectedWorkshopForDetail ? `Phân Công Công Nhân Vào ${selectedWorkshopForDetail.code} - ${selectedWorkshopForDetail.name}` : 'Phân Công Công Nhân'}
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="text-xs text-slate-600 font-medium">
              Đã chọn: <strong className="text-blue-700 font-bold">{selectedWorkerIdsForAssign.length}</strong> công nhân
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsAssignWorkersModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAssignedWorkers}
                icon={UserCheck}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lưu Phân Công ({selectedWorkerIdsForAssign.length} Thợ)
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Sổ danh sách công nhân từ danh mục nhân sự toàn công ty. Bạn có thể <strong>click chọn 1 hoặc nhiều công nhân</strong> để đưa vào trực thuộc xưởng này.
          </p>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm công nhân theo tên, mã thợ, kỹ năng..."
                value={assignWorkerSearch}
                onChange={(e) => setAssignWorkerSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setAssignWorkerFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                  assignWorkerFilter === 'all'
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Tất cả ({operators.length})
              </button>
              <button
                type="button"
                onClick={() => setAssignWorkerFilter('unassigned')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                  assignWorkerFilter === 'unassigned'
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Chưa có xưởng ({operators.filter((op) => !op.workshop_id).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  const unassigned = operators.filter((op) => !op.workshop_id).map((op) => op.id);
                  setSelectedWorkerIdsForAssign((prev) => Array.from(new Set([...prev, ...unassigned])));
                }}
                className="px-2.5 py-1 text-xs rounded-lg font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
              >
                + Chọn hết thợ chưa có xưởng
              </button>
            </div>
          </div>

          {/* Workers Selection Grid */}
          <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {operators
              .filter((op) => {
                if (assignWorkerFilter === 'unassigned' && op.workshop_id) return false;
                if (assignWorkerSearch.trim()) {
                  const s = assignWorkerSearch.toLowerCase();
                  return (
                    op.name?.toLowerCase().includes(s) ||
                    op.code?.toLowerCase().includes(s) ||
                    op.skill_level?.toLowerCase().includes(s)
                  );
                }
                return true;
              })
              .map((op) => {
                const isChecked = selectedWorkerIdsForAssign.includes(op.id);
                const isCurrentWs = selectedWorkshopForDetail && op.workshop_id === selectedWorkshopForDetail.id;

                return (
                  <div
                    key={op.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedWorkerIdsForAssign((prev) => prev.filter((id) => id !== op.id));
                      } else {
                        setSelectedWorkerIdsForAssign((prev) => [...prev, op.id]);
                      }
                    }}
                    className={`p-3 flex items-center justify-between gap-3 transition cursor-pointer select-none ${
                      isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {op.name ? op.name.slice(0, 1) : 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{op.name}</span>
                          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">{op.code}</span>
                          {isCurrentWs && (
                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                              Đang ở xưởng này
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{op.skill_level || 'Thợ máy CNC'}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {op.workshop_name ? (
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {op.workshop_code || op.workshop_name}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Chưa phân xưởng
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 mt-0.5">Ca: {op.shift || 'Ca 1'}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CÔNG NHÂN TỰ GHI NHẬN SẢN LƯỢNG HOÀN THÀNH CHO LỆNH SẢN XUẤT (LSX) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRecordOutputModalOpen}
        onClose={() => setIsRecordOutputModalOpen(false)}
        title={selectedLsxForRecord ? `Ghi Nhận Sản Lượng Thợ Máy - ${selectedLsxForRecord.code}` : 'Ghi Nhận Sản Lượng'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={() => setIsRecordOutputModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWorkerOutput}
              icon={ClipboardCheck}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Lưu Ghi Nhận Sản Lượng
            </Button>
          </div>
        }
      >
        {selectedLsxForRecord && (() => {
          const currentDone = Number(selectedLsxForRecord.completed_qty) || 0;
          const target = Number(selectedLsxForRecord.target_qty) || 1;
          const willAdd = Number(workerOutputForm.qty_passed) || 0;
          const projectedTotal = currentDone + willAdd;
          const projectedPercent = Math.min(100, Math.round((projectedTotal / target) * 100));
          const isProjectedComplete = projectedTotal >= target;

          return (
            <form onSubmit={handleSaveWorkerOutput} className="space-y-4">
              {/* Order Context Card */}
              <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 p-3.5 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-blue-600 font-bold block">{selectedLsxForRecord.code}</span>
                    <h4 className="text-sm font-bold text-slate-800">{selectedLsxForRecord.part_name}</h4>
                    <span className="text-xs text-slate-500">Bản vẽ: {selectedLsxForRecord.drawing_code || '---'}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">Kế hoạch sản xuất:</span>
                    <span className="text-sm font-bold text-slate-800">{target} chi tiết</span>
                  </div>
                </div>

                {/* Progress bar preview */}
                <div className="pt-2 border-t border-blue-100/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">
                      Hiện tại: {currentDone}/{target} chi tiết • Sau lần này: <strong className="text-blue-700">{projectedTotal}/{target}</strong>
                    </span>
                    <span className={`font-bold ${isProjectedComplete ? 'text-emerald-600 font-extrabold' : 'text-blue-600'}`}>
                      {projectedPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isProjectedComplete 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      style={{ width: `${projectedPercent}%` }}
                    />
                  </div>

                  {isProjectedComplete && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Đủ số lượng kế hoạch ({projectedTotal >= target ? `Đạt ${projectedTotal}/${target}` : ''})! Thanh tiến độ bên ngoài sẽ đầy 100% và trạng thái lệnh sản xuất sẽ tự động chuyển thành "Đã hoàn thành".
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Worker & Step Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dropdown
                  label="Công Nhân Thực Hiện Ghi Nhận (*)"
                  placeholder="-- Chọn công nhân --"
                  value={workerOutputForm.operator}
                  onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, operator: e.target.value })}
                  searchable={true}
                  options={operators.map((op) => ({
                    value: op.name,
                    label: `${op.code} - ${op.name}`,
                    description: op.skill_level,
                    badge: op.workshop_name ? op.workshop_name.split(' ')[0] : (op.workshop_code || undefined),
                    group: op.workshop_name || 'Phân xưởng chung',
                  }))}
                />

                <Dropdown
                  label="Công Đoạn Đang Thực Hiện (*)"
                  placeholder="-- Chọn công đoạn --"
                  value={workerOutputForm.step_name}
                  onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, step_name: e.target.value })}
                  options={(cncSteps.length > 0 ? cncSteps : STANDARD_CNC_STEPS.map((s, i) => ({ id: i + 1, step_order: i + 1, name: s.value, assigned_role: s.role }))).map((s, idx) => ({
                    value: s.name,
                    label: `${s.step_order || idx + 1}. ${s.name} (${s.assigned_role || 'Thợ đứng máy'})`,
                  }))}
                />
              </div>

              <Dropdown
                label="Tổ Máy CNC Đứng Máy Gia Công"
                placeholder="-- Chọn tổ máy CNC --"
                value={workerOutputForm.machine_name}
                onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, machine_name: e.target.value })}
                groups={FACTORY_MACHINE_GROUPS}
                searchable={true}
              />

              {/* Quantity Passed & NG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Số lượng ĐẠT chuẩn hoàn thành (*)"
                  type="number"
                  min="0"
                  value={workerOutputForm.qty_passed}
                  onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, qty_passed: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  required
                />
                <Input
                  label="Số lượng LỖI phế phẩm (NG, nếu có)"
                  type="number"
                  min="0"
                  value={workerOutputForm.qty_failed}
                  onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, qty_failed: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                />
              </div>

              <Input
                label="Ghi chú kỹ thuật / Nguyên nhân lỗi (nếu có)"
                placeholder="VD: Đã tiện tinh dung sai ±0.01mm, kiểm tra 100% bằng thước panme..."
                value={workerOutputForm.fail_reason}
                onChange={(e) => setWorkerOutputForm({ ...workerOutputForm, fail_reason: e.target.value })}
              />
            </form>
          );
        })()}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: NHẬT KÝ SẢN LƯỢNG CỦA CÁC CÔNG NHÂN TRÊN LỆNH SẢN XUẤT            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={selectedLsxForHistory ? `Nhật Ký Công Nhân Ghi Nhận - ${selectedLsxForHistory.code}` : 'Nhật Ký Sản Lượng'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="primary"
              size="sm"
              icon={ClipboardCheck}
              onClick={() => {
                setIsHistoryModalOpen(false);
                if (selectedLsxForHistory) {
                  handleOpenRecordOutput(selectedLsxForHistory);
                }
              }}
            >
              + Ghi Nhận Thêm Sản Lượng
            </Button>
            <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        {selectedLsxForHistory && (() => {
          const lsxMovements = movements.filter((m) => m.production_order_id === selectedLsxForHistory.id);
          const totalLogged = lsxMovements.reduce((acc, m) => acc + (Number(m.qty_passed) || 0), 0);
          const totalNg = lsxMovements.reduce((acc, m) => acc + (Number(m.qty_failed) || 0), 0);

          return (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{selectedLsxForHistory.part_name}</span>
                  <span className="text-slate-400 block font-mono">Bản vẽ: {selectedLsxForHistory.drawing_code || '---'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">Kế hoạch: {selectedLsxForHistory.target_qty}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Đã ghi nhận: {totalLogged} chi tiết
                  </span>
                  {totalNg > 0 && (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Lỗi NG: {totalNg}
                    </span>
                  )}
                </div>
              </div>

              {lsxMovements.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Chưa có công nhân nào ghi nhận sản lượng cho lệnh sản xuất này.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    icon={ClipboardCheck}
                    onClick={() => {
                      setIsHistoryModalOpen(false);
                      handleOpenRecordOutput(selectedLsxForHistory);
                    }}
                  >
                    Ghi nhận sản lượng đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {lsxMovements.map((m) => (
                    <div key={m.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{m.operator || 'Thợ xưởng'}</span>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {m.from_step}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span>Máy: <strong>{m.machine_name || 'CNC'}</strong></span>
                          <span>•</span>
                          <span>{new Date(m.created_at).toLocaleString('vi-VN')}</span>
                          {m.fail_reason && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-400">"{m.fail_reason}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          +{m.qty_passed} đạt
                        </span>
                        {Number(m.qty_failed) > 0 && (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                            -{m.qty_failed} NG
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

    
      {/* ========================================================================= */}
      {/* MODAL: TOÀN BỘ QUY TRÌNH 7 CÔNG ĐOẠN & LUÂN CHUYỂN CHI TIẾT LỆNH SẢN XUẤT */}
      {/* ========================================================================= */}
      {isRoutingModalOpen && (() => {
        const activeOrder = orders.find((o) => o.id === selectedOrderForRouting?.id) || selectedOrderForRouting;
        if (!activeOrder) return null;

        const currentStepOrder = (() => {
          const found = STANDARD_CNC_STEPS.findIndex((s) => s.value === activeOrder.current_step);
          return found >= 0 ? found + 1 : 1;
        })();

        const isFinished = activeOrder.status === 'finished' || activeOrder.current_step?.includes('Đã QC nghiệm thu');
        const lsxMovements = movements.filter((m) => m.production_order_id === activeOrder.id || m.order_code === activeOrder.code);
        const targetQty = Number(activeOrder.target_qty) || 1;
        const currentPassed = Number(activeOrder.completed_qty) || 0;
        const currentNg = Number(activeOrder.ng_qty) || 0;
        const currentRemaining = Math.max(0, targetQty - currentNg);
        const progressPercent = isFinished ? 100 : Math.min(100, Math.round(((currentStepOrder - 1) / (STANDARD_CNC_STEPS.length - 1)) * 100));

        const isAtFinalQcStep = activeOrder.current_step && (
          activeOrder.current_step.includes('QC') || 
          activeOrder.current_step.includes('KCS') || 
          activeOrder.current_step.includes('Hoàn thành') || 
          activeOrder.current_step.includes('bàn giao')
        );

        return (
          <Modal
            isOpen={isRoutingModalOpen}
            onClose={() => setIsRoutingModalOpen(false)}
            maxWidth="max-w-6xl"
            title={
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base sm:text-lg">Quy Trình & Luân Chuyển Chi Tiết LSX</span>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {activeOrder.code}
                    </span>
                    <Badge status={activeOrder.status}>{activeOrder.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Hành trình công nghệ gia công chi tiết: <strong className="text-slate-700">{activeOrder.part_name}</strong> (Bản vẽ: <span className="font-mono">{activeOrder.drawing_code || '---'}</span>)
                  </p>
                </div>
              </div>
            }
            footer={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Dữ liệu quy trình đồng bộ thời gian thực theo từng công đoạn xưởng</span>
                </div>
                <Button variant="ghost" onClick={() => setIsRoutingModalOpen(false)}>
                  Đóng cửa sổ
                </Button>
              </div>
            }
          >
            <div className="space-y-5 -mt-1">
              {/* TÓM TẮT THÔNG SỐ LỆNH SẢN XUẤT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium block">Kế hoạch sản xuất</span>
                  <span className="font-bold text-slate-900 text-sm">{targetQty} <span className="text-[11px] font-normal text-slate-500">chi tiết</span></span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium block">Đã hoàn thành</span>
                  <span className="font-bold text-emerald-600 text-sm">{currentPassed} <span className="text-[11px] font-normal text-slate-500">thành phẩm</span></span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium block">Phế phẩm (NG)</span>
                  <span className={`font-bold text-sm ${currentNg > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                    {currentNg} <span className="text-[11px] font-normal text-slate-500">chi tiết</span>
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium block">Tiến độ quy trình</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-blue-600">{progressPercent}%</span>
                    <span className="text-[11px] text-slate-500">({currentStepOrder}/{STANDARD_CNC_STEPS.length} bước)</span>
                  </div>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <span className="text-slate-400 font-medium block">Phân xưởng phụ trách</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px] truncate">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {activeOrder.workshop_name || 'Xưởng A (Phay Mazak, Tiện Doosan)'}
                  </span>
                </div>
              </div>

              {/* TÌNH TRẠNG PHÔI VẬT TƯ */}
              {activeOrder.material_name && (
                <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  activeOrder.material_status === 'issued'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeOrder.material_status === 'issued' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></div>
                    <div>
                      <span className="font-semibold">Phôi vật tư: </span>
                      <strong>{activeOrder.material_name}</strong> (Số lượng cần: {activeOrder.material_qty_needed || activeOrder.target_qty}) — 
                      <span className="font-semibold ml-1">
                        {activeOrder.material_status === 'issued' ? 'Đã xuất kho cấp xưởng đầy đủ' : 'Chưa xuất kho phôi'}
                      </span>
                    </div>
                  </div>
                  {activeOrder.material_status !== 'issued' && canManageProduction && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleIssueMaterial(activeOrder)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1 px-3 text-xs shrink-0 shadow-xs"
                    >
                      Xuất kho cấp phôi ngay
                    </Button>
                  )}
                </div>
              )}

              {/* TABS ĐIỀU HƯỚNG QUY TRÌNH (DỄ DÀNG MỞ RỘNG TÍNH NĂNG VỀ SAU) */}
              <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0 text-xs">
                <button
                  type="button"
                  onClick={() => setRoutingTab('workflow')}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 font-bold border-b-2 transition whitespace-nowrap ${
                    routingTab === 'workflow'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Workflow className="w-4 h-4" />
                  <span>1. Quy Trình & Luân Chuyển Bước</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-700 font-bold">
                    Bước {currentStepOrder}/{STANDARD_CNC_STEPS.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoutingTab('history')}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 font-bold border-b-2 transition whitespace-nowrap ${
                    routingTab === 'history'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>2. Nhật Ký Luân Chuyển (Travel Card)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
                    {lsxMovements.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoutingTab('qc')}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 font-bold border-b-2 transition whitespace-nowrap ${
                    routingTab === 'qc'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Tiêu Chuẩn KCS / Đo CMM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoutingTab('materials')}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 font-bold border-b-2 transition whitespace-nowrap ${
                    routingTab === 'materials'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>4. Định Mức Vật Tư & Phôi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoutingTab('costing')}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 font-bold border-b-2 transition whitespace-nowrap ${
                    routingTab === 'costing'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>5. Dự Toán Chi Phí & Giờ Máy</span>
                </button>
              </div>

              {/* NỘI DUNG TAB 1: QUY TRÌNH 7 BƯỚC & FORM LUÂN CHUYỂN */}
              {routingTab === 'workflow' && (
                <div className="space-y-6">
                  {/* THANH PIPELINE 7 CÔNG ĐOẠN TRỰC QUAN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Tiến độ dây chuyền gia công CNC (7 công đoạn liên hoàn):
                      </span>
                      <span className="font-semibold text-slate-500">
                        {isFinished ? 'Đã hoàn tất toàn bộ quy trình' : `Đang ở công đoạn ${currentStepOrder}/${STANDARD_CNC_STEPS.length}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                      {STANDARD_CNC_STEPS.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isStepPassed = isFinished || currentStepOrder > stepNum;
                        const isStepCurrent = !isFinished && currentStepOrder === stepNum;
                        const isStepUpcoming = !isFinished && currentStepOrder < stepNum;

                        return (
                          <div
                            key={step.value}
                            className={`relative p-3 rounded-xl border transition-all ${
                              isStepCurrent
                                ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/30'
                                : isStepPassed
                                ? 'bg-emerald-50/60 border-emerald-300'
                                : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isStepCurrent
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : isStepPassed
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isStepPassed ? <Check className="w-3.5 h-3.5" /> : stepNum}
                              </span>

                              {isStepCurrent && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 animate-pulse">
                                  Đang làm
                                </span>
                              )}
                              {isStepPassed && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                  Xong
                                </span>
                              )}
                              {isStepUpcoming && (
                                <span className="text-[10px] text-slate-400 font-medium">Chờ</span>
                              )}
                            </div>

                            <div className="font-bold text-slate-800 text-xs line-clamp-1" title={step.value}>
                              {step.value}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={step.role}>
                              {step.role}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">Sản lượng:</span>
                              <span className="font-bold text-slate-700">
                                {isStepPassed
                                  ? `${currentRemaining}/${targetQty}`
                                  : isStepCurrent
                                  ? `${currentRemaining} BTP`
                                  : '---'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* KHU VỰC THAO TÁC LUÂN CHUYỂN BƯỚC TIẾP THEO HOẶC BÀN GIAO KHO */}
                  <div className="p-4 sm:p-5 rounded-2xl border bg-gradient-to-br from-white to-slate-50 shadow-xs border-slate-200">
                    {isFinished ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">Lệnh Sản Xuất Đã Hoàn Thành Toàn Diện!</h4>
                          <p className="text-xs text-slate-500 max-w-md mt-1">
                            Toàn bộ {targetQty} chi tiết đã vượt qua 7 công đoạn gia công CNC & kiểm tra KCS/QC, đã hoàn tất bàn giao nhập kho thành phẩm.
                          </p>
                        </div>
                      </div>
                    ) : isAtFinalQcStep || currentStepOrder >= STANDARD_CNC_STEPS.length ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-sm block text-emerald-900">Chi tiết đã hoàn tất các bước gia công cơ khí!</span>
                            <span>Đã qua kiểm tra KCS / QC dung sai & ngoại quan. Sẵn sàng bàn giao thành phẩm nhập kho.</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <Button
                            size="md"
                            variant="primary"
                            icon={PackageCheck}
                            onClick={() => {
                              setIsRoutingModalOpen(false);
                              handleOpenHandover(activeOrder);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 shadow-sm text-sm"
                          >
                            Bàn Giao Thành Phẩm Vào Kho Ngay
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleRoutingAdvanceStep} className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>Nghiệm Thu & Chuyển Sang Công Đoạn Tiếp Theo</span>
                              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                {routingMoveForm.from_step} ➔ {routingMoveForm.to_step}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Xác nhận sản lượng đạt của công đoạn hiện tại để luân chuyển phôi BTP đến tổ máy tiếp theo.
                            </p>
                          </div>

                          {routingMoveForm.from_step.includes('Gia công ngoài') && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              icon={Truck}
                              onClick={() => {
                                setIsRoutingModalOpen(false);
                                handleSelectLsxForSub(activeOrder.id);
                                setIsSubModalOpen(true);
                              }}
                              className="text-xs border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                            >
                              Lập Phiếu Gia Công Ngoài
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Công đoạn hiện tại <span className="text-slate-400 font-normal">(Hoàn tất)</span>
                            </label>
                            <input
                              type="text"
                              value={routingMoveForm.from_step}
                              readOnly
                              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Chuyển tới công đoạn <span className="text-blue-600 font-semibold">*</span>
                            </label>
                            <select
                              value={routingMoveForm.to_step}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, to_step: e.target.value })}
                              className="w-full bg-white border border-blue-300 focus:border-blue-500 rounded-lg px-3 py-2 font-semibold text-blue-800"
                            >
                              {STANDARD_CNC_STEPS.map((s, idx) => (
                                <option key={s.value} value={s.value}>
                                  {idx + 1}. {s.value} ({s.role})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Số lượng ĐẠT (Passed) <span className="text-emerald-600 font-semibold">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={targetQty}
                              value={routingMoveForm.qty_passed}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, qty_passed: Math.max(0, Number(e.target.value) || 0) })}
                              className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 font-bold text-emerald-700"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Số lượng LỖI (Phế phẩm NG)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={targetQty}
                              value={routingMoveForm.qty_failed}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, qty_failed: Math.max(0, Number(e.target.value) || 0) })}
                              className="w-full bg-white border border-slate-300 focus:border-rose-500 rounded-lg px-3 py-2 font-bold text-rose-700"
                            />
                          </div>
                        </div>

                        {Number(routingMoveForm.qty_failed) > 0 && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs animate-in fade-in">
                            <label className="block font-bold text-rose-800">
                              Nguyên nhân lỗi gia công CNC (Tiêu chuẩn kỹ thuật):
                            </label>
                            <select
                              value={routingMoveForm.fail_reason_category}
                              onChange={(e) => setRoutingMoveForm({
                                ...routingMoveForm,
                                fail_reason_category: e.target.value,
                                fail_reason: e.target.value !== 'Khác' ? e.target.value : routingMoveForm.fail_reason,
                              })}
                              className="w-full bg-white border border-rose-300 text-rose-900 rounded-lg px-3 py-1.5 text-xs font-semibold"
                            >
                              <option value="">-- Chọn nguyên nhân lỗi CNC phổ biến --</option>
                              {CNC_DEFECT_REASONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Mô tả cụ thể kích thước lệch, vị trí lỗi hoặc biện pháp khắc phục..."
                              value={routingMoveForm.fail_reason}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, fail_reason: e.target.value })}
                              className="w-full bg-white border border-rose-300 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Thợ máy thực hiện / Đứng máy
                            </label>
                            <select
                              value={routingMoveForm.operator}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, operator: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                            >
                              <option value="">-- Chọn thợ máy phụ trách --</option>
                              {operators.map((op) => (
                                <option key={op.id} value={op.name}>
                                  {op.name} ({op.skill_level || 'Thợ xưởng'}) - {op.shift || 'Ca 1'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Máy gia công CNC thực hiện
                            </label>
                            <select
                              value={routingMoveForm.machine_name}
                              onChange={(e) => setRoutingMoveForm({ ...routingMoveForm, machine_name: e.target.value })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                            >
                              {FACTORY_MACHINES.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
                          <Button
                            type="submit"
                            size="md"
                            variant="primary"
                            icon={ArrowRight}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 shadow-sm text-sm"
                          >
                            Xác Nhận Nghiệm Thu & Chuyển Sang: {routingMoveForm.to_step}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 2: NHẬT KÝ LUÂN CHUYỂN BTP (TRAVEL CARD) */}
              {routingTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Thẻ Theo Dõi Sản Phẩm Điện Tử (Travel Card Log)</h4>
                      <p className="text-xs text-slate-500">Lịch sử từng lượt luân chuyển bán thành phẩm giữa các công đoạn xưởng.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Printer}
                      onClick={() => window.print()}
                      className="text-xs"
                    >
                      In Phiếu Luân Chuyển
                    </Button>
                  </div>

                  {lsxMovements.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Chưa có lượt luân chuyển BTP nào được ghi nhận cho lệnh này.</p>
                      <Button
                        size="sm"
                        variant="primary"
                        className="mt-3 text-xs"
                        onClick={() => setRoutingTab('workflow')}
                      >
                        Bắt đầu chuyển công đoạn đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                            <tr>
                              <th className="py-2.5 px-3">Thời gian</th>
                              <th className="py-2.5 px-3">Từ công đoạn ➔ Đến công đoạn</th>
                              <th className="py-2.5 px-3 text-center">SL Đạt</th>
                              <th className="py-2.5 px-3 text-center">SL Hỏng (NG)</th>
                              <th className="py-2.5 px-3">Thợ máy & Thiết bị</th>
                              <th className="py-2.5 px-3">Lý do lỗi / Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {lsxMovements.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                                  {new Date(m.created_at).toLocaleString('vi-VN')}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                  <span className="text-slate-600">{m.from_step}</span>
                                  <span className="text-blue-500 mx-1.5 font-bold">➔</span>
                                  <span className="text-blue-700">{m.to_step}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    +{m.qty_passed}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {Number(m.qty_failed) > 0 ? (
                                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                      {m.qty_failed} NG
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">0</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-medium text-slate-800">{m.operator || 'Thợ xưởng'}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{m.machine_name || 'CNC'}</div>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 italic">
                                  {m.fail_reason || 'Đạt chuẩn kỹ thuật'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NỘI DUNG TAB 3: TIÊU CHUẨN KCS / ĐO CMM (SẴN SÀNG PHÁT TRIỂN) */}
              {routingTab === 'qc' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Tiêu Chuẩn Dung Sai & Đo Kiểm KCS (Bản vẽ {activeOrder.drawing_code})
                      </h4>
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        QC Pass 100%
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Đo kiểm trên Máy Đo 3D CMM Mitutoyo & Bàn Map Granite chuẩn cấp 0.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Thông số kiểm tra</th>
                          <th className="py-2.5 px-3">Kích thước danh nghĩa</th>
                          <th className="py-2.5 px-3">Dung sai kỹ thuật</th>
                          <th className="py-2.5 px-3">Dụng cụ đo</th>
                          <th className="py-2.5 px-3 text-center">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">Đường kính trục ngoài (OD)</td>
                          <td className="py-2.5 px-3 font-mono">Ø45.00 mm</td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">+0.015 / -0.000 mm</td>
                          <td className="py-2.5 px-3 text-slate-600">Panme Mitutoyo 25-50mm</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">Đạt (PASS)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">Độ đồng tâm trục</td>
                          <td className="py-2.5 px-3 font-mono">0.000 mm</td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">≤ 0.008 mm</td>
                          <td className="py-2.5 px-3 text-slate-600">Đồng hồ so chân gập & Chống tâm</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">Đạt (PASS)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">Độ nhám bề mặt lắp ổ bi</td>
                          <td className="py-2.5 px-3 font-mono">Ra 0.8 µm</td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">Ra ≤ 0.8 µm</td>
                          <td className="py-2.5 px-3 text-slate-600">Máy đo nhám SJ-210</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">Đạt (PASS)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 4: ĐỊNH MỨC VẬT TƯ & PHÔI */}
              {routingTab === 'materials' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Thông Tin Phôi Cắt & Định Mức Cấp Phát</h4>
                    <p className="text-slate-500">Định mức vật liệu thô sử dụng cho lệnh sản xuất {activeOrder.code}.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                      <span className="font-bold text-slate-800 block text-xs">Vật tư phôi thô:</span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Chủng loại phôi:</span>
                        <strong className="text-slate-900">{activeOrder.material_name || 'Thép S45C / Nhôm 6061'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Số lượng định mức:</span>
                        <strong className="text-slate-900">{activeOrder.material_qty_needed || activeOrder.target_qty} phôi</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Trạng thái cấp phát:</span>
                        <span className={`font-bold ${activeOrder.material_status === 'issued' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {activeOrder.material_status === 'issued' ? 'Đã xuất kho cấp xưởng' : 'Chưa xuất kho'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                      <span className="font-bold text-slate-800 block text-xs">Dao cụ & Đồ gá sử dụng:</span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Dao phay khỏa mặt:</span>
                        <span className="font-mono text-slate-700">Face Mill Ø63 (Chíp APMT1604)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Dao tiện ngoài & bo R:</span>
                        <span className="font-mono text-slate-700">Cán tiện DCLNR2525M12 (CNMG120408)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Đồ gá gia công:</span>
                        <span className="text-slate-700">Mâm cặp thủy lực 3 chấu & Chống tâm xoay</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NỘI DUNG TAB 5: DỰ TOÁN CHI PHÍ & GIỜ MÁY */}
              {routingTab === 'costing' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Bảng Tính Chi Phí Sản Xuất Thực Tế (Costing Breakdown)</h4>
                    <p className="text-slate-500">Tổng hợp chi phí phôi vật tư, dao cụ tiêu hao, giờ máy CNC và nhân công đứng máy.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 border border-slate-200 rounded-xl bg-white">
                      <span className="text-slate-400 block text-[11px]">Chi phí phôi thô</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">1.850.000 ₫</span>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-white">
                      <span className="text-slate-400 block text-[11px]">Khấu hao giờ máy CNC</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">950.000 ₫</span>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-white">
                      <span className="text-slate-400 block text-[11px]">Dao cụ tiêu hao</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">320.000 ₫</span>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-xl bg-white">
                      <span className="text-slate-400 block text-[11px]">Nhân công & KCS</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">680.000 ₫</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

    </div>
  );
}
