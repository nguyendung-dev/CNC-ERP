'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../api';
import { t } from '../../i18n';
import Table from '../ui/Table';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function CustomersModule() {
  const { showSuccess, showError, confirmDelete } = useToast();
  const { user } = useAuth();
  const canManageCustomers = user?.role === 'admin' || user?.role === 'sales';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    tax_code: '',
    contact_person: '',
    note: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAddModal = () => {
    setCustomerForm({
      code: `KH-${Date.now().toString().slice(-4)}`,
      name: '',
      phone: '',
      email: '',
      address: '',
      tax_code: '',
      contact_person: '',
      note: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setSelectedCustomer(cust);
    setCustomerForm({
      code: cust.code || '',
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      tax_code: cust.tax_code || '',
      contact_person: cust.contact_person || '',
      note: cust.note || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) {
      showError('Thiếu thông tin', 'Vui lòng nhập tên khách hàng hoặc tên công ty.');
      return;
    }
    try {
      await api.post('/customers', customerForm);
      setIsAddModalOpen(false);
      loadCustomers();
      showSuccess('Thêm khách hàng thành công!', `Khách hàng "${customerForm.name}" đã được lưu vào hệ thống.`);
    } catch (err) {
      showError('Lỗi thêm khách hàng', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.put(`/customers/${selectedCustomer.id}`, customerForm);
      setIsEditModalOpen(false);
      loadCustomers();
      showSuccess('Cập nhật thành công!', `Thông tin khách hàng "${customerForm.name}" đã được cập nhật.`);
    } catch (err) {
      showError('Lỗi cập nhật', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCustomer = (cust) => {
    confirmDelete({
      title: 'Xóa Khách Hàng',
      message: `Bạn có chắc chắn muốn xóa hồ sơ khách hàng "${cust.name}" (${cust.code}) khỏi cơ sở dữ liệu không?`,
      itemName: cust.name,
      onConfirm: async () => {
        try {
          await api.delete(`/customers/${cust.id}`);
          showSuccess('Đã xóa thành công!', `Đã xóa khách hàng "${cust.name}" khỏi hệ thống.`);
          loadCustomers();
        } catch (err) {
          showError('Lỗi xóa khách hàng', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleExportExcel = () => {
    if (!customers.length) return;
    const exportData = customers.map((c, index) => ({
      'STT': index + 1,
      'Mã Khách Hàng': c.code,
      'Tên Doanh Nghiệp / Khách Hàng': c.name,
      'Người Liên Hệ': c.contact_person,
      'Số Điện Thoại': c.phone,
      'Email': c.email,
      'Địa Chỉ': c.address,
      'Mã Số Thuế': c.tax_code,
      'Ghi Chú': c.note,
      'Ngày Tạo': c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachKhachHang');
    XLSX.writeFile(wb, `Danh_Sach_Khach_Hang_CNC_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showSuccess('Xuất file thành công', 'File Excel danh sách khách hàng đã được tải về.');
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Sub Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Danh Mục Khách Hàng & Đối Tác
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng <span className="font-bold text-blue-600">{customers.length}</span> doanh nghiệp & khách hàng trong hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageCustomers && (
            <Button
              onClick={handleOpenAddModal}
              icon={Plus}
              variant="primary"
              size="md"
            >
              Thêm khách hàng
            </Button>
          )}
          <Button
            onClick={handleExportExcel}
            icon={FileSpreadsheet}
            variant="outline"
            size="md"
          >
            Xuất Excel (XLSX)
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('customers.search_placeholder', 'Tìm theo tên công ty, mã KH, số điện thoại, người liên hệ...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Table
        isLoading={loading}
        data={filteredCustomers}
        columns={[
          {
            header: 'Mã KH',
            accessor: 'code',
            cellClassName: 'font-mono font-bold text-blue-600 whitespace-nowrap',
          },
          {
            header: 'Doanh nghiệp / Khách hàng',
            render: (row) => (
              <div>
                <p className="font-bold text-slate-900">{row.name}</p>
                {row.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-xs">{row.address}</span>
                  </p>
                )}
              </div>
            ),
          },
          {
            header: 'Người liên hệ & SĐT',
            render: (row) => (
              <div>
                <p className="font-medium text-slate-800">{row.contact_person || '—'}</p>
                {row.phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{row.phone}</span>
                  </p>
                )}
              </div>
            ),
          },
          {
            header: 'Email & Mã số thuế',
            render: (row) => (
              <div>
                <p className="text-xs text-slate-700 flex items-center gap-1">
                  {row.email ? (
                    <>
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{row.email}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
                {row.tax_code && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    MST: {row.tax_code}
                  </p>
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
            header: 'Thao tác',
            render: (row) => (
              <div className="flex items-center justify-end gap-1.5">
                {canManageCustomers && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(row)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Sửa thông tin khách hàng"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(row)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa khách hàng"
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

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('customers.add_modal_title', 'Thêm Mới Khách Hàng / Doanh Nghiệp')}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleCreateCustomer} icon={Plus}>
                {t('customers.save_customer', 'Lưu Khách Hàng')}
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleCreateCustomer}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã khách hàng"
                placeholder="VD: KH-001"
                value={customerForm.code}
                onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value })}
                required
              />
              <Input
                label="Tên khách hàng / Công ty"
                placeholder="VD: Công ty TNHH Cơ khí Sakura"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Người đại diện / liên hệ"
                placeholder="VD: Nguyễn Văn A (Trưởng phòng mua hàng)"
                value={customerForm.contact_person}
                onChange={(e) => setCustomerForm({ ...customerForm, contact_person: e.target.value })}
              />
              <Input
                label="Số điện thoại liên hệ"
                placeholder="VD: 0912345678"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email doanh nghiệp"
                type="email"
                placeholder="VD: contact@sakura.vn"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
              <Input
                label="Mã số thuế (MST)"
                placeholder="VD: 0108899123"
                value={customerForm.tax_code}
                onChange={(e) => setCustomerForm({ ...customerForm, tax_code: e.target.value })}
              />
            </div>

            <Input
              label="Địa chỉ trụ sở / Xưởng giao hàng"
              placeholder="VD: Lô CN-08, KCN Nội Bài, Hà Nội"
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú đặc thù / Yêu cầu tiêu chuẩn
              </label>
              <textarea
                rows={2}
                placeholder="VD: Tiêu chuẩn dung sai ±0.01mm, giao hàng có CO/CQ..."
                value={customerForm.note}
                onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Chỉnh Sửa Khách Hàng: ${selectedCustomer.name}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleUpdateCustomer}>
                Lưu Thay Đổi
              </Button>
            </>
          }
        >
          <form className="space-y-4" onSubmit={handleUpdateCustomer}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã khách hàng"
                value={customerForm.code}
                onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value })}
                required
              />
              <Input
                label="Tên khách hàng / Công ty"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Người đại diện / liên hệ"
                value={customerForm.contact_person}
                onChange={(e) => setCustomerForm({ ...customerForm, contact_person: e.target.value })}
              />
              <Input
                label="Số điện thoại liên hệ"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email doanh nghiệp"
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              />
              <Input
                label="Mã số thuế (MST)"
                value={customerForm.tax_code}
                onChange={(e) => setCustomerForm({ ...customerForm, tax_code: e.target.value })}
              />
            </div>

            <Input
              label="Địa chỉ trụ sở / Xưởng giao hàng"
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú đặc thù / Yêu cầu tiêu chuẩn
              </label>
              <textarea
                rows={2}
                value={customerForm.note}
                onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
