'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus,
  PackageCheck,
  CheckCircle2,
  Truck,
  ExternalLink, 
  AlertTriangle, 
  Download, 
  Package, 
  Search, 
  ArrowUpDown, 
  SlidersHorizontal,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import CurrencyInput from '../ui/CurrencyInput';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import Modal from '../ui/Modal';
import { Input, Select, Dropdown } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function InventoryModule({ initialSubTab }) {
  const { showSuccess, showError, confirmDelete } = useToast();
  const { user } = useAuth();
  const canManageInventory = user?.role === 'admin' || user?.role === 'warehouse';

  const [activeTab, setActiveTab] = useState(initialSubTab || 'stock'); // 'stock' | 'receipts' | 'issues'
  const [materials, setMaterials] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals for Material
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [stockChange, setStockChange] = useState({ changeAmount: 1, reason: '' });

  // Modals for Vouchers (Phiếu nhập, Phiếu xuất)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const [receiptForm, setReceiptForm] = useState({
    material_id: '',
    material_name: '',
    material_code: '',
    quantity: 1,
    unit: 'Cái',
    unit_price: 0,
    partner_name: '',
    advance_code: '',
    note: '',
  });

  const [issueForm, setIssueForm] = useState({
    material_id: '',
    material_name: '',
    material_code: '',
    quantity: 1,
    unit: 'Cái',
    unit_price: 0,
    partner_name: '',
    lsx_code: '',
    note: '',
  });

  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'Phôi kim loại',
    spec: '',
    unit: 'Cây',
    quantity: 10,
    min_stock: 5,
    unit_price: 500000,
    location: '',
    batch_no: '',
  });

  const [editForm, setEditForm] = useState({
    code: '',
    name: '',
    category: 'Phôi kim loại',
    spec: '',
    unit: 'Cây',
    quantity: 10,
    min_stock: 5,
    unit_price: 500000,
    location: '',
    batch_no: '',
  });

  const materialsRef = useRef(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resAll, resAlerts, resVouchers, resLsx] = await Promise.all([
        api.get('/inventory/materials').catch(() => ({ data: [] })),
        api.get('/inventory/materials/alerts/low-stock').catch(() => ({ data: [] })),
        api.get('/inventory/vouchers').catch(() => ({ data: [] })),
        api.get('/production/orders').catch(() => ({ data: [] })),
      ]);

      const allLsx = Array.isArray(resLsx.data) ? resLsx.data : (resLsx.data?.data || []);
      const completedLsx = allLsx.filter(o => o.status === 'finished' || Number(o.completed_qty) > 0);
      setFinishedGoods(completedLsx);
      setMaterials(resAll.data || []);
      setLowStockList(resAlerts.data || []);
      setVouchers(resVouchers.data?.data || resVouchers.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Mount only effect: fetch data and listen to global events
  useEffect(() => {
    loadData(false);

    const handleUpdate = () => loadData(true);
    const handleFocus = () => loadData(true);

    window.addEventListener('cnc_data_updated', handleUpdate);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('cnc_data_updated', handleUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Separate effect for opening receipt modal from Finance advance (no infinite loop)
  useEffect(() => {
    const handleOpenReceiptFromAdvance = (e) => {
      const adv = e.detail?.advance;
      setActiveTab('receipts');
      if (adv) {
        const currentMats = materialsRef.current || [];
        let matchedMat = null;
        for (const m of currentMats) {
          if (adv.purpose && adv.purpose.toLowerCase().includes(m.name.toLowerCase())) {
            matchedMat = m;
            break;
          }
        }
        const qtyMatch = adv.purpose ? adv.purpose.match(/(\d+(\.\d+)?)\s*(Hộp|Cái|Khối|Cây|kg|mét|cuộn)/i) : null;
        const extractedQty = qtyMatch ? Number(qtyMatch[1]) : 1;
        const totalAmt = Number(adv.amount || 0);

        setReceiptForm({
          material_id: matchedMat ? matchedMat.id : (currentMats[0]?.id || ''),
          material_name: matchedMat ? matchedMat.name : (currentMats[0]?.name || ''),
          material_code: matchedMat ? matchedMat.code : (currentMats[0]?.code || ''),
          quantity: extractedQty,
          unit: matchedMat ? matchedMat.unit : (qtyMatch ? qtyMatch[3] : 'Hộp'),
          unit_price: matchedMat ? Number(matchedMat.unit_price) : Math.round(totalAmt / (extractedQty || 1)),
          partner_name: adv.requester || 'Người tạm ứng mua hàng',
          advance_code: adv.code || '',
          note: `Nhập kho theo phiếu tạm ứng ${adv.code}: ${adv.purpose}`,
        });
      }
      setIsReceiptModalOpen(true);
    };

    window.addEventListener('open_inventory_receipt_modal', handleOpenReceiptFromAdvance);
    return () => window.removeEventListener('open_inventory_receipt_modal', handleOpenReceiptFromAdvance);
  }, []);

  // Handlers for Material CRUD
  const handleCreateMaterial = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!form.name || form.name.trim() === '') {
      showError('Thiếu thông tin', 'Vui lòng nhập Tên vật tư / phôi cơ khí');
      return;
    }
    const createdName = form.name.trim();
    const createdCode = form.code ? form.code.trim() : 'VT-' + Date.now();
    try {
      await api.post('/inventory/materials', {
        ...form,
        name: createdName,
        code: createdCode,
        quantity: Number(form.quantity) || 0,
        min_stock: Number(form.min_stock) || 0,
        unit_price: Number(form.unit_price) || 0,
      });
      setIsAddModalOpen(false);
      setForm({
        code: '',
        name: '',
        category: 'Phôi kim loại',
        spec: '',
        unit: 'Cây',
        quantity: 10,
        min_stock: 5,
        unit_price: 500000,
        location: '',
        batch_no: '',
      });
      loadData(true);
      showSuccess('Thêm vật tư thành công', `Vật tư "${createdName}" đã được lưu vào hệ thống kho.`);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'material_created' } }));
    } catch (err) {
      showError('Lỗi thêm vật tư', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateMaterial = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!editForm.name || editForm.name.trim() === '') {
      showError('Thiếu thông tin', 'Tên vật tư không được để trống.');
      return;
    }
    try {
      await api.put(`/inventory/materials/${editMaterialId}`, {
        ...editForm,
        name: editForm.name.trim(),
        quantity: Number(editForm.quantity) || 0,
        min_stock: Number(editForm.min_stock) || 0,
        unit_price: Number(editForm.unit_price) || 0,
      });
      setIsEditModalOpen(false);
      loadData(true);
      showSuccess('Cập nhật thành công!', `Đã lưu thay đổi cho vật tư "${editForm.name}".`);
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'material_updated' } }));
    } catch (err) {
      showError('Lỗi cập nhật', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteMaterial = (id) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Vật Tư',
      itemName: 'Vật tư #' + id,
      message: 'Bạn có chắc chắn muốn xóa vật tư này khỏi kho không?',
      onConfirm: async () => {
        try {
          await api.delete(`/inventory/materials/${id}`);
          showSuccess('Đã xóa thành công!', 'Vật tư đã được loại bỏ khỏi hệ thống kho.');
          loadData(true);
          window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'material_deleted' } }));
        } catch (err) {
          showError('Lỗi xóa vật tư', err.response?.data?.message || err.message);
        }
      },
    });
  };

  // Handlers for Vouchers (Phiếu Nhập / Xuất Kho)
  const handleOpenNewReceipt = () => {
    const firstMat = materials[0];
    setReceiptForm({
      material_id: firstMat ? firstMat.id : '',
      material_name: firstMat ? firstMat.name : '',
      material_code: firstMat ? firstMat.code : '',
      quantity: 10,
      unit: firstMat ? firstMat.unit : 'Hộp',
      unit_price: firstMat ? Number(firstMat.unit_price) : 0,
      partner_name: '',
      advance_code: '',
      note: 'Nhập bổ sung phôi / dao cụ vào kho',
    });
    setIsReceiptModalOpen(true);
  };

  const handleOpenNewIssue = () => {
    const firstMat = materials[0];
    setIssueForm({
      material_id: firstMat ? firstMat.id : '',
      material_name: firstMat ? firstMat.name : '',
      material_code: firstMat ? firstMat.code : '',
      quantity: 1,
      unit: firstMat ? firstMat.unit : 'Cái',
      unit_price: firstMat ? Number(firstMat.unit_price) : 0,
      partner_name: 'Xưởng A (Phay Mazak)',
      lsx_code: '',
      note: 'Xuất cấp phôi cho xưởng sản xuất',
    });
    setIsIssueModalOpen(true);
  };

  const handleCreateReceipt = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!receiptForm.material_id) {
      showError('Thiếu thông tin', 'Vui lòng chọn Vật tư / Phôi cần nhập kho.');
      return;
    }
    if (Number(receiptForm.quantity) <= 0) {
      showError('Số lượng không hợp lệ', 'Số lượng nhập kho phải lớn hơn 0.');
      return;
    }
    try {
      const res = await api.post('/inventory/vouchers', {
        ...receiptForm,
        type: 'in',
        quantity: Number(receiptForm.quantity),
        unit_price: Number(receiptForm.unit_price || 0),
        total_amount: Number(receiptForm.quantity) * Number(receiptForm.unit_price || 0),
      });
      setIsReceiptModalOpen(false);
      loadData(true);
      showSuccess(
        'Nhập kho thành công!',
        `Đã tạo Phiếu nhập kho ${res.data?.data?.code || ''}. Số lượng tồn kho đã được cộng thêm +${receiptForm.quantity} ${receiptForm.unit}!`
      );
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'inventory_restocked' } }));
    } catch (err) {
      showError('Lỗi nhập kho', err.response?.data?.message || err.message);
    }
  };

  const handleCreateIssue = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!issueForm.material_id) {
      showError('Thiếu thông tin', 'Vui lòng chọn Vật tư / Phôi cần xuất kho.');
      return;
    }
    const mat = materials.find(m => String(m.id) === String(issueForm.material_id));
    if (mat && Number(issueForm.quantity) > Number(mat.quantity)) {
      showError('Tồn kho không đủ', `Kho chỉ còn ${Number(mat.quantity).toLocaleString('vi-VN')} ${mat.unit}, không thể xuất ${issueForm.quantity}!`);
      return;
    }
    try {
      const res = await api.post('/inventory/vouchers', {
        ...issueForm,
        type: 'out',
        quantity: Number(issueForm.quantity),
        unit_price: Number(issueForm.unit_price || 0),
        total_amount: Number(issueForm.quantity) * Number(issueForm.unit_price || 0),
      });
      setIsIssueModalOpen(false);
      loadData(true);
      showSuccess(
        'Xuất kho thành công!',
        `Đã tạo Phiếu xuất kho ${res.data?.data?.code || ''}. Số lượng tồn kho đã được trừ -${issueForm.quantity} ${issueForm.unit}!`
      );
      window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'inventory_issued' } }));
    } catch (err) {
      showError('Lỗi xuất kho', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteVoucher = (voucher) => {
    confirmDelete({
      title: 'Xác Nhận Hủy Phiếu Kho',
      itemName: `${voucher.type === 'in' ? 'Phiếu Nhập' : 'Phiếu Xuất'} #${voucher.code}`,
      message: 'Khi xóa phiếu, số lượng tồn kho tương ứng sẽ được tự động hoàn tác. Bạn có chắc chắn muốn xóa?',
      onConfirm: async () => {
        try {
          await api.delete(`/inventory/vouchers/${voucher.id}`);
          showSuccess('Đã xóa phiếu kho!', 'Phiếu kho đã bị hủy và số lượng tồn kho đã được hoàn tác.');
          loadData(true);
          window.dispatchEvent(new CustomEvent('cnc_data_updated', { detail: { action: 'voucher_deleted' } }));
        } catch (err) {
          showError('Lỗi xóa phiếu', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const exportExcel = () => {
    if (!materials || materials.length === 0) {
      showError('Xuất file thất bại', 'Không có dữ liệu tồn kho để xuất.');
      return;
    }
    const exportData = filteredMaterials.map((m) => ({
      'Mã VT': m.code,
      'Tên Vật tư / Phôi': m.name,
      'Phân loại': m.category,
      'Quy cách': m.spec,
      'ĐVT': m.unit,
      'Tồn kho': Number(m.quantity),
      'Tồn tối thiểu': Number(m.min_stock),
      'Đơn giá (VNĐ)': Number(m.unit_price),
      'Thành tiền (VNĐ)': Number(m.quantity) * Number(m.unit_price),
      'Vị trí kệ': m.location || 'Chưa xếp kệ',
      'Số lô': m.batch_no || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TonKhoCNC');
    XLSX.writeFile(workbook, `BaoCao_TonKhoCNC_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showSuccess('Xuất file thành công!', 'File Excel tồn kho đã được tải về máy.');
  };

  // Filtered lists
  const filteredMaterials = materials.filter((m) => {
    const matchSearch = (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.code || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? m.category === categoryFilter : true;
    const matchLow = onlyLowStock ? Number(m.quantity) <= Number(m.min_stock) : true;
    return matchSearch && matchCat && matchLow;
  });

  const receiptVouchers = vouchers.filter(v => v.type === 'in');
  const issueVouchers = vouchers.filter(v => v.type === 'out');

  return (
    <div className="space-y-6">
      {/* Sub Tabs: Tồn kho | Phiếu Nhập Kho | Phiếu Xuất Kho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Package className="w-4 h-4 text-blue-500" />
            <span>Tồn Kho Vật Tư & Phôi</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'stock' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
              {materials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('finished')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'finished'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-indigo-600" />
            <span>Tồn Kho Thành Phẩm</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'finished' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
              {finishedGoods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Phiếu Nhập Kho</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'receipts' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
              {receiptVouchers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'issues'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            <span>Phiếu Xuất Kho</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'issues' ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-slate-200/70 text-slate-600'}`}>
              {issueVouchers.length}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'stock' && canManageInventory && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              icon={Plus}
              variant="primary"
              size="md"
            >
              Thêm vật tư
            </Button>
          )}
          {activeTab === 'stock' && (
            <ExportButton onClick={exportExcel}>
              Xuất Excel tồn kho (XLSX)
            </ExportButton>
          )}

          {activeTab === 'receipts' && canManageInventory && (
            <Button
              onClick={handleOpenNewReceipt}
              icon={Plus}
              variant="primary"
              size="md"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Lập phiếu nhập kho
            </Button>
          )}

          {activeTab === 'issues' && canManageInventory && (
            <Button
              onClick={handleOpenNewIssue}
              icon={Plus}
              variant="primary"
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Lập phiếu xuất kho
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TỒN KHO VẬT TƯ & PHÔI */}
      {/* ========================================================================= */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Low Stock Banner Alert */}
          {lowStockList.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 sm:p-4 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-950">
                    Cảnh báo: Có {lowStockList.length} vật tư dưới mức tồn kho an toàn!
                  </div>
                  <div className="text-amber-700 text-xs mt-0.5">
                    Các mã phôi, dao cụ hao hụt cần lập kế hoạch đặt thêm vật tư hoặc lập đề nghị tạm ứng.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer self-start sm:self-auto shrink-0 ${
                  onlyLowStock
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100/50'
                }`}
              >
                {onlyLowStock ? 'Hiện tất cả' : 'Lọc phôi dưới định mức'}
              </button>
            </div>
          )}

          {/* Action and Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên phôi, mã dao cụ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full sm:w-64">
                <Dropdown
                  size="sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Tất cả phân loại"
                  options={[
                    { value: '', label: 'Tất cả phân loại' },
                    { value: 'Phôi kim loại', label: 'Phôi kim loại (Thép/Nhôm/Inox)' },
                    { value: 'Dao cụ & Phụ tùng', label: 'Dao cụ & Phụ tùng (Endmill/Chip)' },
                    { value: 'Vật tư phụ', label: 'Vật tư phụ (Dầu tưới nguội)' },
                    { value: 'Bán thành phẩm', label: 'Bán thành phẩm (BTP)' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <Table
            isLoading={loading}
            data={filteredMaterials}
            columns={[
              {
                header: 'Mã VT',
                accessor: 'code',
                cellClassName: 'font-mono font-medium text-slate-900',
              },
              {
                header: 'Tên vật tư / Phôi',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-slate-800">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.spec || 'Không có quy cách'}</div>
                  </div>
                ),
              },
              {
                header: 'Phân loại',
                render: (row) => (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {row.category}
                  </span>
                ),
              },
              {
                header: 'Số lượng tồn',
                render: (row) => {
                  const isLow = Number(row.quantity) <= Number(row.min_stock);
                  return (
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {Number(row.quantity).toLocaleString('vi-VN')} {row.unit}
                      </span>
                      {isLow && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                          Dưới min ({Number(row.min_stock).toLocaleString('vi-VN')})
                        </span>
                      )}
                    </div>
                  );
                },
              },
              {
                header: 'Đơn giá kho',
                render: (row) => `${Number(row.unit_price).toLocaleString()} đ`,
              },
              {
                header: 'Vị trí / Lô phôi',
                render: (row) => (
                  <div className="text-xs text-slate-500">
                    <div>Vị trí: {row.location || 'Chưa xếp kệ'}</div>
                    <div className="font-mono text-[11px] text-slate-400">Lô: {row.batch_no || '---'}</div>
                  </div>
                ),
              },
              {
                header: 'Thao tác',
                render: (row) => (
                  <div className="flex items-center gap-1">
                    {canManageInventory && (
                      <button
                        onClick={() => {
                          setEditMaterialId(row.id);
                          setEditForm({
                            code: row.code || '',
                            name: row.name || '',
                            category: row.category || 'Phôi kim loại',
                            spec: row.spec || '',
                            unit: row.unit || 'Cây',
                            quantity: Number(row.quantity) || 0,
                            min_stock: Number(row.min_stock) || 5,
                            unit_price: Number(row.unit_price) || 0,
                            location: row.location || '',
                            batch_no: row.batch_no || '',
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Chỉnh sửa vật tư"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {canManageInventory && (
                      <button
                        onClick={() => handleDeleteMaterial(row.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Xóa vật tư"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PHIẾU NHẬP KHO (RECEIPTS) */}
      {/* ========================================================================= */}
      
      {/* ========================================================================= */}
      {/* SUB-TAB: TỒN KHO THÀNH PHẨM (FINISHED GOODS INVENTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'finished' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-indigo-900 text-sm block">Kho Thành Phẩm Cơ Khí Chính Xác (Finished Goods)</span>
                <span className="text-slate-600">
                  Tổng hợp các chi tiết máy đã gia công hoàn thiện qua 7 công đoạn CNC, KCS đã nghiệm thu đạt chuẩn và bàn giao vào kho sẵn sàng xuất bán.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-2xs">
                Tổng: {finishedGoods.length} loại chi tiết thành phẩm
              </span>
            </div>
          </div>

          <Table
            isLoading={loading}
            data={finishedGoods}
            emptyMessage="Chưa có thành phẩm nào nhập kho. Khi Lệnh sản xuất hoàn tất nghiệm thu QC và Bàn giao kho, thành phẩm sẽ xuất hiện tại đây."
            columns={[
              {
                header: 'Mã Bản Vẽ & Mã TP',
                render: (row) => (
                  <div>
                    <div className="font-mono font-bold text-indigo-600">{row.drawing_code || 'TP-CNC'}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: #{row.id}</div>
                  </div>
                ),
              },
              {
                header: 'Tên Chi Tiết Thành Phẩm',
                render: (row) => (
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{row.part_name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                      <span>Lệnh sản xuất:</span>
                      <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {row.code}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Kế Hoạch & Nhập Kho',
                render: (row) => (
                  <div className="text-xs">
                    <div>Kế hoạch: <strong className="text-slate-700">{row.target_qty}</strong></div>
                    <div className="mt-0.5">
                      Đã nhập kho: <strong className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">+{row.completed_qty} Chi tiết</strong>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Tồn Kho Khả Dụng',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">
                      {row.completed_qty}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Chi tiết</span>
                  </div>
                ),
              },
              {
                header: 'Đơn Hàng (SO) / Khách',
                render: (row) => (
                  <div className="text-xs">
                    {row.so_id ? (
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        SO #{row.so_id}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sản xuất dự phòng</span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Trạng Thái Kho',
                render: (row) => (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đã lưu kho thành phẩm
                  </span>
                ),
              },
              {
                header: 'Vị Trí Lưu Kho',
                render: (row) => (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Kệ TP-A1</span>
                    <div className="text-[11px] text-slate-400">Kho Thành Phẩm Cơ Khí</div>
                  </div>
                ),
              },
              {
                header: 'Thao Tác',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Truck}
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('navigate_to_sales_delivery', {
                            detail: {
                              code: row.code,
                              so_id: row.so_id,
                              part_name: row.part_name,
                              drawing_code: row.drawing_code,
                              delivery_qty: Number(row.completed_qty) || Number(row.target_qty) || 1,
                            },
                          })
                        );
                      }}
                      className="text-xs py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                      title="Lập phiếu xuất kho giao hàng cho khách hàng"
                    >
                      Xuất giao hàng
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <Table
            isLoading={loading}
            data={receiptVouchers}
            columns={[
              {
                header: 'Mã Phiếu NK',
                render: (row) => (
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-emerald-600">{row.code}</span>
                    <div>
                      {row.code?.startsWith('NK-TP') || row.lsx_code ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          <PackageCheck className="w-3 h-3 text-blue-600" />
                          Nhập Thành Phẩm LSX
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Package className="w-3 h-3 text-emerald-600" />
                          Nhập Phôi / Vật Tư
                        </span>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Ngày lập',
                render: (row) => (
                  <div className="text-xs text-slate-600">
                    <div>{new Date(row.created_at).toLocaleDateString('vi-VN')}</div>
                    <div className="text-slate-400 text-[11px]">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ),
              },
              {
                header: 'Vật tư / Phôi nhập',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-slate-800">{row.material_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{row.material_code || '---'}</div>
                  </div>
                ),
              },
              {
                header: 'Số lượng nhập',
                render: (row) => (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +{Number(row.quantity).toLocaleString('vi-VN')} {row.unit}
                  </span>
                ),
              },
              {
                header: 'Đơn giá & Thành tiền',
                render: (row) => (
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">{Number(row.total_amount).toLocaleString()} đ</div>
                    <div className="text-[11px] text-slate-400">({Number(row.unit_price).toLocaleString()} đ/{row.unit})</div>
                  </div>
                ),
              },
              {
                header: 'Nguồn nhập / Tạm ứng',
                render: (row) => (
                  <div className="text-xs text-slate-700">
                    <div>{row.partner_name || 'Mua ngoài'}</div>
                    {row.advance_code && (
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        {row.advance_code}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Ghi chú',
                accessor: 'note',
                cellClassName: 'text-xs text-slate-500 max-w-xs truncate',
              },
              {
                header: 'Người lập',
                accessor: 'created_by',
                cellClassName: 'text-xs font-medium text-slate-600',
              },
              {
                header: 'Thao tác',
                render: (row) => (
                  canManageInventory && (
                    <button
                      onClick={() => handleDeleteVoucher(row)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Hủy phiếu nhập kho (Hoàn tác tồn kho)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PHIẾU XUẤT KHO (ISSUES) */}
      {/* ========================================================================= */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <Table
            isLoading={loading}
            data={issueVouchers}
            columns={[
              { header: 'Mã Phiếu XK', accessor: 'code', cellClassName: 'font-mono font-bold text-amber-600' },
              {
                header: 'Ngày xuất',
                render: (row) => (
                  <div className="text-xs text-slate-600">
                    <div>{new Date(row.created_at).toLocaleDateString('vi-VN')}</div>
                    <div className="text-slate-400 text-[11px]">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ),
              },
              {
                header: 'Vật tư / Phôi xuất',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-slate-800">{row.material_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{row.material_code || '---'}</div>
                  </div>
                ),
              },
              {
                header: 'Số lượng xuất',
                render: (row) => (
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    -{Number(row.quantity).toLocaleString('vi-VN')} {row.unit}
                  </span>
                ),
              },
              {
                header: 'Nơi nhận / Lệnh sản xuất',
                render: (row) => (
                  <div className="text-xs text-slate-700">
                    <div>{row.partner_name || 'Xưởng gia công'}</div>
                    {row.lsx_code && (
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                        {row.lsx_code}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Mục đích / Ghi chú',
                accessor: 'note',
                cellClassName: 'text-xs text-slate-500 max-w-xs truncate',
              },
              {
                header: 'Người lập',
                accessor: 'created_by',
                cellClassName: 'text-xs font-medium text-slate-600',
              },
              {
                header: 'Thao tác',
                render: (row) => (
                  canManageInventory && (
                    <button
                      onClick={() => handleDeleteVoucher(row)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Hủy phiếu xuất kho (Hoàn tác tồn kho)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LẬP PHIẾU NHẬP KHO (PNK) */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Lập Phiếu Nhập Kho Vật Tư & Phôi (PNK)"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleCreateReceipt} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Xác Nhận Nhập Kho
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleCreateReceipt}>
            <div className="space-y-1">
              <Select
                label="Chọn Vật tư / Phôi cần nhập kho (*)"
                value={receiptForm.material_id}
                onChange={(e) => {
                  const mId = e.target.value;
                  const mat = materials.find((m) => String(m.id) === String(mId));
                  setReceiptForm((prev) => ({
                    ...prev,
                    material_id: mId,
                    material_name: mat ? mat.name : prev.material_name,
                    material_code: mat ? mat.code : prev.material_code,
                    unit: mat ? mat.unit : prev.unit,
                    unit_price: mat ? Number(mat.unit_price) : prev.unit_price,
                  }));
                }}
                options={[
                  { value: '', label: '-- Chọn vật tư có sẵn trong kho --' },
                  ...materials.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.code}) - Tồn hiện có: ${Number(m.quantity).toLocaleString('vi-VN')} ${m.unit}`,
                  })),
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số lượng nhập (*)"
                type="number"
                value={receiptForm.quantity}
                onChange={(e) => setReceiptForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                required
              />
              <Input
                label="Đơn vị tính"
                value={receiptForm.unit}
                onChange={(e) => setReceiptForm((prev) => ({ ...prev, unit: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput
                label="Đơn giá nhập (VNĐ)"
                value={receiptForm.unit_price}
                onChange={(val) => setReceiptForm((prev) => ({ ...prev, unit_price: val }))}
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng tiền nhập kho (dự tính)
                </label>
                <div className="px-3 py-2 text-sm font-bold bg-slate-100 rounded-xl text-slate-800 border border-slate-200">
                  {(Number(receiptForm.quantity || 0) * Number(receiptForm.unit_price || 0)).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nhà cung cấp / Đơn vị bán"
                placeholder="VD: Cty Thép Thăng Long, Cửa hàng Dao cụ Hoàng Phúc..."
                value={receiptForm.partner_name}
                onChange={(e) => setReceiptForm((prev) => ({ ...prev, partner_name: e.target.value }))}
              />
              <Input
                label="Mã Phiếu Tạm Ứng liên kết (nếu có)"
                placeholder="VD: TU-2026-7951"
                value={receiptForm.advance_code}
                onChange={(e) => setReceiptForm((prev) => ({ ...prev, advance_code: e.target.value }))}
              />
            </div>

            <Input
              label="Ghi chú nhập kho"
              placeholder="VD: Nhập bổ sung mảnh tiện theo phiếu tạm ứng..."
              value={receiptForm.note}
              onChange={(e) => setReceiptForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LẬP PHIẾU XUẤT KHO (PXK) */}
      {/* ========================================================================= */}
      {isIssueModalOpen && (
        <Modal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          title="Lập Phiếu Xuất Kho Vật Tư / Phôi Cho Xưởng (PXK)"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsIssueModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleCreateIssue} className="bg-blue-600 hover:bg-blue-700 text-white">
                Xác Nhận Xuất Kho
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleCreateIssue}>
            <Select
              label="Chọn Vật tư / Phôi cần xuất (*)"
              value={issueForm.material_id}
              onChange={(e) => {
                const mId = e.target.value;
                const mat = materials.find((m) => String(m.id) === String(mId));
                setIssueForm((prev) => ({
                  ...prev,
                  material_id: mId,
                  material_name: mat ? mat.name : '',
                  material_code: mat ? mat.code : '',
                  unit: mat ? mat.unit : 'Cái',
                  unit_price: mat ? Number(mat.unit_price) : 0,
                }));
              }}
              options={[
                { value: '', label: '-- Chọn vật tư trong kho --' },
                ...materials.map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.code}) - Tồn kho: ${Number(m.quantity).toLocaleString('vi-VN')} ${m.unit}`,
                })),
              ]}
              required
            />

            {(() => {
              const mat = materials.find((m) => String(m.id) === String(issueForm.material_id));
              if (!mat) return null;
              const currentStock = Number(mat.quantity || 0);
              const isOver = Number(issueForm.quantity) > currentStock;
              return (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${isOver ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                  Hiện còn tồn kho: {currentStock.toLocaleString('vi-VN')} {mat.unit}.
                  {isOver && ' (Cảnh báo: Số lượng xuất vượt quá tồn kho hiện có!)'}
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số lượng xuất (*)"
                type="number"
                value={issueForm.quantity}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                required
              />
              <Input
                label="Đơn vị tính"
                value={issueForm.unit}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Xưởng nhận / Người nhận"
                placeholder="VD: Xưởng A (Phay Mazak), Thợ tiện Cường..."
                value={issueForm.partner_name}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, partner_name: e.target.value }))}
              />
              <Input
                label="Mã Lệnh sản xuất LSX (nếu có)"
                placeholder="VD: LSX-2026-7101"
                value={issueForm.lsx_code}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, lsx_code: e.target.value }))}
              />
            </div>

            <Input
              label="Mục đích / Ghi chú xuất kho"
              placeholder="VD: Cấp phôi cho LSX, thay dao cụ mòn cháy..."
              value={issueForm.note}
              onChange={(e) => setIssueForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM VẬT TƯ MỚI */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Thêm Vật Tư / Phôi Cơ Khí Mới"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleCreateMaterial}>Lưu Vật Tư</Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleCreateMaterial}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mã vật tư"
                placeholder="Tự sinh nếu để trống (VD: PHOI-AL6061)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <Input
                label="Tên vật tư / Phôi (*)"
                placeholder="VD: Phôi Nhôm 6061 Phi 50"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Phân loại"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={[
                  { value: 'Phôi kim loại', label: 'Phôi kim loại (Thép/Nhôm/Đồng/Inox)' },
                  { value: 'Dao cụ & Phụ tùng', label: 'Dao cụ & Phụ tùng (Endmill/Insert/Collet)' },
                  { value: 'Vật tư phụ', label: 'Vật tư phụ (Dầu tưới nguội/Dầu thủy lực)' },
                  { value: 'Bán thành phẩm', label: 'Bán thành phẩm gia công dở dang' },
                ]}
              />
              <Input
                label="Quy cách / Kích thước"
                placeholder="VD: Phi 50mm x L3000mm"
                value={form.spec}
                onChange={(e) => setForm({ ...form, spec: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Đơn vị tính"
                placeholder="Cây, Kg, Khối, Hộp..."
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
              <Input
                label="Số lượng ban đầu"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                required
              />
              <Input
                label="Định mức an toàn (Min)"
                type="number"
                value={form.min_stock}
                onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })}
                required
              />
            </div>

            <CurrencyInput
              label="Đơn giá kho dự tính (VNĐ)"
              value={form.unit_price}
              onChange={(val) => setForm({ ...form, unit_price: val })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Vị trí lưu kho"
                placeholder="VD: Kệ A-01, Tủ dao C2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Input
                label="Số lô xuất xứ"
                placeholder="VD: LO-AL-2026-01"
                value={form.batch_no}
                onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHỈNH SỬA VẬT TƯ */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Chỉnh Sửa Thông Tin Vật Tư"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleUpdateMaterial}>Lưu Thay Đổi</Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleUpdateMaterial}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mã vật tư"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                disabled
              />
              <Input
                label="Tên vật tư / Phôi (*)"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Phân loại"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                options={[
                  { value: 'Phôi kim loại', label: 'Phôi kim loại' },
                  { value: 'Dao cụ & Phụ tùng', label: 'Dao cụ & Phụ tùng' },
                  { value: 'Vật tư phụ', label: 'Vật tư phụ' },
                  { value: 'Bán thành phẩm', label: 'Bán thành phẩm' },
                ]}
              />
              <Input
                label="Quy cách / Kích thước"
                value={editForm.spec}
                onChange={(e) => setEditForm({ ...editForm, spec: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Đơn vị tính"
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                required
              />
              <Input
                label="Số lượng tồn"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                required
              />
              <Input
                label="Tồn an toàn (Min)"
                type="number"
                value={editForm.min_stock}
                onChange={(e) => setEditForm({ ...editForm, min_stock: Number(e.target.value) })}
                required
              />
            </div>

            <CurrencyInput
              label="Đơn giá kho (VNĐ)"
              value={editForm.unit_price}
              onChange={(val) => setEditForm({ ...editForm, unit_price: val })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Vị trí lưu kho"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
              <Input
                label="Số lô"
                value={editForm.batch_no}
                onChange={(e) => setEditForm({ ...editForm, batch_no: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
