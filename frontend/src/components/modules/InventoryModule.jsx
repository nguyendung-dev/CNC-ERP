'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Download, 
  Package, 
  Search, 
  ArrowUpDown, 
  SlidersHorizontal,
  Pencil,
  Trash2
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import * as XLSX from 'xlsx';

export default function InventoryModule() {
  const [materials, setMaterials] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [stockChange, setStockChange] = useState({ changeAmount: 1, reason: '' });

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [resAll, resAlerts] = await Promise.all([
        api.get('/inventory/materials'),
        api.get('/inventory/materials/alerts/low-stock'),
      ]);
      setMaterials(resAll.data || []);
      setLowStockList(resAlerts.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/materials', form);
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
      loadData();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    try {
      await api.post(`/inventory/materials/${selectedMaterial.id}/adjust-stock`, stockChange);
      setIsStockModalOpen(false);
      loadData();
      alert('Cập nhật tồn kho thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const openAdjustStock = (material, type = 'in') => {
    setSelectedMaterial(material);
    setStockChange({
      changeAmount: type === 'in' ? 5 : -5,
      reason: type === 'in' ? 'Nhập kho mua thêm' : 'Xuất cho xưởng gia công',
    });
    setIsStockModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setEditMaterialId(material.id);
    setEditForm({
      code: material.code || '',
      name: material.name || '',
      category: material.category || 'Phôi kim loại',
      spec: material.spec || '',
      unit: material.unit || 'Cây',
      quantity: material.quantity || 0,
      min_stock: material.min_stock || 0,
      unit_price: material.unit_price || 0,
      location: material.location || '',
      batch_no: material.batch_no || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    if (!editMaterialId) return;
    try {
      await api.put(`/inventory/materials/${editMaterialId}`, editForm);
      setIsEditModalOpen(false);
      loadData();
      alert('Cập nhật thông tin vật tư thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vật tư "${material.name}" (${material.code}) khỏi kho?`)) {
      return;
    }
    try {
      await api.delete(`/inventory/materials/${material.id}`);
      loadData();
      alert(`Đã xóa vật tư "${material.name}" thành công!`);
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.code?.toLowerCase().includes(search.toLowerCase()) ||
      m.spec?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? m.category === categoryFilter : true;
    const matchLow = onlyLowStock ? Number(m.quantity) <= Number(m.min_stock) : true;
    return matchSearch && matchCat && matchLow;
  });

  const exportExcel = () => {
    const exportData = filteredMaterials.map((m) => ({
      'Mã VT': m.code,
      'Tên vật tư': m.name,
      'Phân loại': m.category,
      'Quy cách cơ khí': m.spec,
      'ĐVT': m.unit,
      'Tồn kho': m.quantity,
      'Tồn tối thiểu': m.min_stock,
      'Đơn giá (VNĐ)': m.unit_price,
      'Vị trí kệ': m.location,
      'Mã lô phôi': m.batch_no,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ton_Kho_Vat_Tu');
    XLSX.writeFile(wb, 'Bao_Cao_Ton_Kho_CNC.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Low Stock */}
      {lowStockList.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Cảnh báo: Có {lowStockList.length} vật tư dưới mức tồn kho an toàn!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Các mã phôi, dao cụ hao hụt cần lập kế hoạch đặt thêm vật tư (MRP).
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className="border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            {onlyLowStock ? 'Xem tất cả' : 'Lọc mã thiếu'}
          </Button>
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả phân loại</option>
            <option value="Phôi kim loại">Phôi kim loại (Thép/Nhôm/Inox)</option>
            <option value="Dao cụ & Phụ tùng">Dao cụ & Phụ tùng (Endmill/Chip)</option>
            <option value="Vật tư phụ">Vật tư phụ (Dầu tưới nguội)</option>
            <option value="Bán thành phẩm">Bán thành phẩm (BTP)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
            variant="primary"
            size="md"
          >
            Thêm vật tư
          </Button>
          <ExportButton onClick={exportExcel}>
            Xuất Excel tồn kho (XLSX)
          </ExportButton>
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
                    {row.quantity} {row.unit}
                  </span>
                  {isLow && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                      Dưới min ({row.min_stock})
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
            header: 'Điều chỉnh tồn',
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openAdjustStock(row, 'in')}
                  className="px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                >
                  + Nhập
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openAdjustStock(row, 'out')}
                  className="px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                >
                  - Xuất
                </Button>
              </div>
            ),
          },
          {
            header: 'Thao tác',
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(row)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Sửa thông tin vật tư"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMaterial(row)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa vật tư"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Add Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Vật Tư / Phôi Cơ Khí Mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateMaterial} icon={Package}>
              Lưu Vật Tư
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã vật tư"
              placeholder="VD: PHOI-AL6061-D60"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <Select
              label="Phân loại"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: 'Phôi kim loại', label: 'Phôi kim loại (Thép/Nhôm/Inox)' },
                { value: 'Dao cụ & Phụ tùng', label: 'Dao cụ & Phụ tùng' },
                { value: 'Vật tư phụ', label: 'Vật tư phụ' },
                { value: 'Bán thành phẩm', label: 'Bán thành phẩm' },
              ]}
            />
          </div>

          <Input
            label="Tên vật tư"
            placeholder="VD: Phôi Nhôm 6061 tròn đặc"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quy cách kích thước cơ khí"
              placeholder="Phi 60mm x L3000mm"
              value={form.spec}
              onChange={(e) => setForm({ ...form, spec: e.target.value })}
            />
            <Input
              label="Đơn vị tính"
              placeholder="Cây, Kg, Cái, Lít"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Số lượng ban đầu"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
            <Input
              label="Tồn tối thiểu (Cảnh báo)"
              type="number"
              value={form.min_stock}
              onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })}
            />
            <Input
              label="Đơn giá nhập (VNĐ)"
              type="number"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vị trí kho / Kệ"
              placeholder="Kệ A-02"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              label="Mã lô phôi"
              placeholder="LO-2026-X"
              value={form.batch_no}
              onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Điều Chỉnh Tồn Kho: ${selectedMaterial?.name || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsStockModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAdjustStock} icon={ArrowUpDown}>
              Cập Nhật Tồn Kho
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <p className="text-sm text-slate-600">
            Hiện tại trong kho đang có:{' '}
            <strong className="text-slate-900">
              {selectedMaterial?.quantity} {selectedMaterial?.unit}
            </strong>
          </p>

          <Input
            label="Số lượng điều chỉnh (+ để nhập thêm, - để xuất bớt)"
            type="number"
            value={stockChange.changeAmount}
            onChange={(e) => setStockChange({ ...stockChange, changeAmount: Number(e.target.value) })}
            required
          />

          <Input
            label="Lý do điều chỉnh / Lệnh sản xuất liên quan"
            placeholder="Xuất phôi cho LSX-01, Nhập bù hàng..."
            value={stockChange.reason}
            onChange={(e) => setStockChange({ ...stockChange, reason: e.target.value })}
          />
        </form>
      </Modal>

      {/* Edit Material Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Chỉnh Sửa Vật Tư: ${editForm.code}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleUpdateMaterial} icon={Package}>
                Lưu Thay Đổi
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Mã vật tư"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                required
              />
              <Select
                label="Phân loại nhóm"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                options={[
                  { value: 'Phôi kim loại', label: 'Phôi kim loại (Thép/Nhôm/Inox/Đồng)' },
                  { value: 'Dao cụ & Phụ tùng', label: 'Dao cụ CNC (Dao phay/tiện/khoan)' },
                  { value: 'Vật tư phụ', label: 'Vật tư phụ (Dầu làm mát/Dầu ray)' },
                  { value: 'Bán thành phẩm', label: 'Bán thành phẩm gia công dở dang' },
                ]}
              />
            </div>

            <Input
              label="Tên vật tư"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quy cách kích thước cơ khí"
                value={editForm.spec}
                onChange={(e) => setEditForm({ ...editForm, spec: e.target.value })}
              />
              <Input
                label="Đơn vị tính"
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Số lượng tồn"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
              />
              <Input
                label="Tồn tối thiểu (Min)"
                type="number"
                value={editForm.min_stock}
                onChange={(e) => setEditForm({ ...editForm, min_stock: Number(e.target.value) })}
              />
              <Input
                label="Đơn giá kho (VNĐ)"
                type="number"
                value={editForm.unit_price}
                onChange={(e) => setEditForm({ ...editForm, unit_price: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Vị trí kho / Kệ"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
              <Input
                label="Mã lô phôi / CO-CQ"
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
