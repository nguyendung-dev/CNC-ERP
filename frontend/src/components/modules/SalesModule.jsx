'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowRight, 
  FileText, 
  Truck, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  Calculator,
  Trash2
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import Badge, { STATUS_LABELS } from '../ui/Badge';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function SalesModule() {
  const { showSuccess, showError, confirmDelete } = useToast();
  const { user } = useAuth();

  const canManageQuotations = user?.role === 'admin' || user?.role === 'sales';
  const canManageDeliveries = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'warehouse';

  // If accountant or warehouse, hide quotations tab
  useEffect(() => {
    if (!canManageQuotations && activeSubTab === 'quotations') {
      setActiveSubTab('orders');
    }
  }, [user?.role, canManageQuotations, activeSubTab]);
  const [activeSubTab, setActiveSubTab] = useState('quotations'); // 'quotations' | 'orders' | 'deliveries'
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);

  // Form states
  const [quotationForm, setQuotationForm] = useState({
    customer_name: '',
    customer_phone: '',
    part_name: '',
    drawing_code: '',
    quantity: 10,
    raw_material_cost: 0,
    machine_hours: 0,
    machine_hourly_rate: 350000,
    subcontract_cost: 0,
    transport_cost: 0,
  });

  const [deliveryForm, setDeliveryForm] = useState({
    so_id: '',
    customer_name: '',
    drawing_code: '',
    delivery_qty: 1,
    receiver_name: '',
    note: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resQuotes, resOrders, resDeliveries] = await Promise.all([
        api.get('/sales/quotations'),
        api.get('/sales/orders'),
        api.get('/sales/delivery-notes'),
      ]);
      setQuotations(resQuotes.data || []);
      setOrders(resOrders.data || []);
      setDeliveries(resDeliveries.data || []);
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate live quotation total
  const estimatedTotal =
    Number(quotationForm.raw_material_cost || 0) +
    Number(quotationForm.machine_hours || 0) * Number(quotationForm.machine_hourly_rate || 0) +
    Number(quotationForm.subcontract_cost || 0) +
    Number(quotationForm.transport_cost || 0);

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    const customerName = quotationForm.customer_name;
    const partName = quotationForm.part_name;
    try {
      await api.post('/sales/quotations', {
        ...quotationForm,
        total_amount: estimatedTotal,
      });
      setIsQuotationModalOpen(false);
      setQuotationForm({
        customer_name: '',
        customer_phone: '',
        part_name: '',
        drawing_code: '',
        quantity: 10,
        raw_material_cost: 0,
        machine_hours: 0,
        machine_hourly_rate: 350000,
        subcontract_cost: 0,
        transport_cost: 0,
      });
      loadData();
      showSuccess('Tạo báo giá thành công!', 'Báo giá cho chi tiết "' + partName + '" của khách hàng ' + customerName + ' đã được tạo.');
    } catch (err) {
      showError('Lỗi lập báo giá', err.response?.data?.message || err.message);
    }
  };

  const handleConvertToSO = (quotationId) => {
    confirmDelete({
      title: 'Chuyển Đổi Sang Đơn Hàng (SO)',
      message: 'Bạn có chắc chắn muốn duyệt và chuyển Báo giá này thành Đơn đặt hàng (SO) chính thức không?',
      confirmText: 'Chuyển thành SO',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          await api.post('/sales/quotations/' + quotationId + '/convert-to-so');
          showSuccess('Chuyển đổi thành công!', 'Báo giá đã được phê duyệt và tạo Đơn đặt hàng (SO).');
          loadData();
          setActiveSubTab('orders');
        } catch (err) {
          showError('Lỗi chuyển đổi', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleOpenNewDelivery = () => {
    const latestSo = orders.length > 0 ? orders[0] : null;
    if (latestSo) {
      setSelectedOrderForDelivery(latestSo);
      setDeliveryForm({
        so_id: latestSo.id,
        customer_name: latestSo.customer_name,
        drawing_code: latestSo.drawing_code,
        delivery_qty: Math.max(1, (Number(latestSo.order_qty) || 0) - (Number(latestSo.delivered_qty) || 0)),
        receiver_name: '',
        note: 'Giao hàng đợt mới kèm phiếu KCS',
      });
    } else {
      setSelectedOrderForDelivery(null);
      setDeliveryForm({
        so_id: '',
        customer_name: '',
        drawing_code: '',
        delivery_qty: 1,
        receiver_name: '',
        note: '',
      });
    }
    setIsDeliveryModalOpen(true);
  };

  const handleSelectSoForDelivery = (soId) => {
    if (!soId) {
      setSelectedOrderForDelivery(null);
      setDeliveryForm((prev) => ({
        ...prev,
        so_id: '',
        customer_name: '',
        drawing_code: '',
      }));
      return;
    }
    const found = orders.find((o) => String(o.id) === String(soId));
    if (found) {
      setSelectedOrderForDelivery(found);
      setDeliveryForm((prev) => ({
        ...prev,
        so_id: found.id,
        customer_name: found.customer_name,
        drawing_code: found.drawing_code,
        delivery_qty: Math.max(1, (Number(found.order_qty) || 0) - (Number(found.delivered_qty) || 0)),
      }));
    }
  };

  const handleOpenDeliveryModal = (order) => {
    setSelectedOrderForDelivery(order);
    setDeliveryForm({
      so_id: order.id,
      customer_name: order.customer_name,
      drawing_code: order.drawing_code,
      delivery_qty: Math.max(1, order.order_qty - order.delivered_qty),
      receiver_name: '',
      note: 'Giao hàng đợt mới kèm phiếu KCS',
    });
    setIsDeliveryModalOpen(true);
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales/delivery-notes', deliveryForm);
      setIsDeliveryModalOpen(false);
      loadData();
      showSuccess('Xuất kho thành công', 'Phiếu xuất kho giao hàng đã được tạo thành công.');
    } catch (err) {
      showError('Lỗi xuất kho', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteQuotation = (quotationId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Báo Giá',
      itemName: 'Báo giá #' + quotationId,
      message: 'Bạn có chắc chắn muốn xóa Báo giá này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/sales/quotations/' + quotationId);
          showSuccess('Đã xóa thành công!', 'Báo giá đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa báo giá', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeleteOrder = (orderId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Đơn Hàng (SO)',
      itemName: 'Đơn hàng SO #' + orderId,
      message: 'Bạn có chắc chắn muốn xóa Đơn đặt hàng (SO) này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/sales/orders/' + orderId);
          showSuccess('Đã xóa thành công!', 'Đơn đặt hàng SO đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa đơn hàng', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeleteDelivery = (deliveryId) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Phiếu Giao Hàng',
      itemName: 'Phiếu giao hàng #' + deliveryId,
      message: 'Bạn có chắc chắn muốn xóa Phiếu xuất kho giao hàng này không?',
      onConfirm: async () => {
        try {
          await api.delete('/sales/delivery-notes/' + deliveryId);
          showSuccess('Đã xóa thành công!', 'Phiếu xuất kho giao hàng đã được xóa khỏi hệ thống.');
          loadData();
        } catch (err) {
          showError('Lỗi xóa phiếu giao hàng', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const exportSalesExcel = () => {
    const dataToExport =
      activeSubTab === 'quotations'
        ? quotations.map((q) => ({
            'Mã BG': q.code,
            'Khách hàng': q.customer_name,
            'Chi tiết CNC': q.part_name,
            'Mã bản vẽ': q.drawing_code,
            'Số lượng': q.quantity,
            'Tổng tiền (VNĐ)': q.total_amount,
            'Trạng thái': (STATUS_LABELS && STATUS_LABELS[q.status]) || q.status,
            'Ngày tạo': q.created_at,
          }))
        : orders.map((o) => ({
            'Mã SO': o.code,
            'Khách hàng': o.customer_name,
            'Chi tiết CNC': o.part_name,
            'SL Đặt': o.order_qty,
            'Đã gia công': o.machined_qty,
            'Đã giao': o.delivered_qty,
            'Dở dang (WIP)': o.wip_qty,
            'Giá trị': o.total_price,
            'Hạn giao': o.delivery_deadline,
            'Trạng thái': (STATUS_LABELS && STATUS_LABELS[o.status]) || o.status,
          }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeSubTab);
    XLSX.writeFile(wb, `Bao_Cao_${activeSubTab.toUpperCase()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Sub Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full no-scrollbar">
          {canManageQuotations && (
            <button
              onClick={() => setActiveSubTab('quotations')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'quotations'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span>Báo giá CNC</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'quotations' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
                {quotations.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Đơn hàng SO</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('deliveries')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'deliveries'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Phiếu Giao Hàng</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeSubTab === 'deliveries' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {deliveries.length}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'quotations' && canManageQuotations && (
            <Button
              onClick={() => setIsQuotationModalOpen(true)}
              icon={Plus}
              variant="primary"
              size="md"
            >
              Lập báo giá mới
            </Button>
          )}
          {activeSubTab === 'deliveries' && canManageDeliveries && (
            <Button
              onClick={handleOpenNewDelivery}
              icon={Plus}
              variant="primary"
              size="md"
            >
              Lập phiếu XK mới
            </Button>
          )}
          <ExportButton onClick={exportSalesExcel}>
            Xuất Excel
          </ExportButton>
        </div>
      </div>

      {/* Quotations SubTab */}
      {activeSubTab === 'quotations' && (
        <Table
          isLoading={loading}
          data={quotations}
          columns={[
            { header: 'Mã BG', accessor: 'code', cellClassName: 'font-mono font-medium text-blue-600' },
            { header: 'Khách hàng', accessor: 'customer_name' },
            {
              header: 'Chi tiết gia công CNC',
              render: (row) => (
                <div>
                  <div className="font-semibold text-slate-800">{row.part_name}</div>
                  <div className="text-xs text-slate-400 font-mono">Bản vẽ: {row.drawing_code || '---'}</div>
                </div>
              ),
            },
            { header: 'SL', accessor: 'quantity', cellClassName: 'font-semibold' },
            {
              header: 'Cơ cấu chi phí (Phôi + Giờ máy + Ngoài)',
              render: (row) => (
                <div className="text-xs space-y-0.5 text-slate-500">
                  <div>Phôi: {Number(row.raw_material_cost).toLocaleString()}đ</div>
                  <div>Máy: {row.machine_hours}h x {Number(row.machine_hourly_rate).toLocaleString()}đ</div>
                  <div>GC ngoài: {Number(row.subcontract_cost).toLocaleString()}đ</div>
                </div>
              ),
            },
            {
              header: 'Tổng tiền',
              render: (row) => (
                <span className="font-bold text-slate-900">
                  {Number(row.total_amount).toLocaleString()} đ
                </span>
              ),
            },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {row.status !== 'converted_to_so' ? (
                    <Button
                      onClick={() => handleConvertToSO(row.id)}
                      size="sm"
                      variant="secondary"
                      icon={ArrowRight}
                    >
                      Tạo SO
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã chuyển SO
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteQuotation(row.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa báo giá"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Orders SubTab */}
      {activeSubTab === 'orders' && (
        <Table
          isLoading={loading}
          data={orders}
          columns={[
            { header: 'Mã SO', accessor: 'code', cellClassName: 'font-mono font-medium text-blue-600' },
            { header: 'Khách hàng', accessor: 'customer_name' },
            { header: 'Chi tiết CNC', accessor: 'part_name' },
            { header: 'SL Đặt', accessor: 'order_qty', cellClassName: 'font-bold' },
            {
              header: 'Tiến độ gia công & giao',
              render: (row) => {
                const percent = Math.min(100, Math.round((row.delivered_qty / row.order_qty) * 100));
                return (
                  <div className="w-44">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Đã giao: {row.delivered_qty}/{row.order_qty}</span>
                      <span className="font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Đang dở dang WIP: {row.wip_qty}</div>
                  </div>
                );
              },
            },
            {
              header: 'Giá trị đơn',
              render: (row) => `${Number(row.total_price).toLocaleString()} đ`,
            },
            { header: 'Hạn giao', accessor: 'delivery_deadline', cellClassName: 'font-mono text-xs' },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => handleOpenDeliveryModal(row)}
                    size="sm"
                    variant="outline"
                    icon={Truck}
                  >
                    Xuất kho
                  </Button>
                  <button
                    onClick={() => handleDeleteOrder(row.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa đơn hàng SO"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Deliveries SubTab */}
      {activeSubTab === 'deliveries' && (
        <Table
          isLoading={loading}
          data={deliveries}
          columns={[
            { header: 'Mã Phiếu XK', accessor: 'code', cellClassName: 'font-mono font-medium text-emerald-600' },
            { header: 'Khách hàng', accessor: 'customer_name' },
            { header: 'Mã bản vẽ', accessor: 'drawing_code', cellClassName: 'font-mono' },
            { header: 'Số lượng giao', accessor: 'delivery_qty', cellClassName: 'font-bold text-slate-900' },
            { header: 'Người nhận hàng', accessor: 'receiver_name' },
            { header: 'Ghi chú / Chứng chỉ', accessor: 'note', cellClassName: 'text-xs text-slate-500' },
            { header: 'Thời gian', accessor: 'created_at', cellClassName: 'text-xs text-slate-400 font-mono' },
            {
              header: 'Thao tác',
              render: (row) => (
                <button
                  onClick={() => handleDeleteDelivery(row.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa phiếu giao hàng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
        />
      )}

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        title="Lập Báo Giá Cơ Khí CNC Mới"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsQuotationModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateQuotation} icon={Calculator}>
              Lưu & Xuất Báo Giá
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Khách hàng / Doanh nghiệp"
              placeholder="VD: Cty Sakura"
              value={quotationForm.customer_name}
              onChange={(e) => setQuotationForm({ ...quotationForm, customer_name: e.target.value })}
              required
            />
            <Input
              label="Số điện thoại / Liên hệ"
              placeholder="0912..."
              value={quotationForm.customer_phone}
              onChange={(e) => setQuotationForm({ ...quotationForm, customer_phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Tên chi tiết gia công"
              placeholder="VD: Trục truyền động"
              value={quotationForm.part_name}
              onChange={(e) => setQuotationForm({ ...quotationForm, part_name: e.target.value })}
              required
            />
            <Input
              label="Mã bản vẽ kỹ thuật"
              placeholder="VD: DWG-SKR-01"
              value={quotationForm.drawing_code}
              onChange={(e) => setQuotationForm({ ...quotationForm, drawing_code: e.target.value })}
            />
            <Input
              label="Số lượng chi tiết"
              type="number"
              value={quotationForm.quantity}
              onChange={(e) => setQuotationForm({ ...quotationForm, quantity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" /> Cấu thành chi phí gia công
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Chi phí phôi (VNĐ)"
                type="number"
                value={quotationForm.raw_material_cost}
                onChange={(e) => setQuotationForm({ ...quotationForm, raw_material_cost: Number(e.target.value) })}
              />
              <Input
                label="Số giờ chạy máy CNC (h)"
                type="number"
                step="0.5"
                value={quotationForm.machine_hours}
                onChange={(e) => setQuotationForm({ ...quotationForm, machine_hours: Number(e.target.value) })}
              />
              <Input
                label="Đơn giá giờ máy (VNĐ/h)"
                type="number"
                value={quotationForm.machine_hourly_rate}
                onChange={(e) => setQuotationForm({ ...quotationForm, machine_hourly_rate: Number(e.target.value) })}
              />
              <Input
                label="Gia công ngoài (Xi mạ, Nhiệt luyện)"
                type="number"
                value={quotationForm.subcontract_cost}
                onChange={(e) => setQuotationForm({ ...quotationForm, subcontract_cost: Number(e.target.value) })}
              />
            </div>

            <Input
              label="Chi phí vận chuyển & bao bì (VNĐ)"
              type="number"
              value={quotationForm.transport_cost}
              onChange={(e) => setQuotationForm({ ...quotationForm, transport_cost: Number(e.target.value) })}
            />

            <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-200">
              <span className="text-slate-700">Tổng báo giá tính toán:</span>
              <span className="text-blue-600 text-lg">{estimatedTotal.toLocaleString()} VNĐ</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* Create Delivery Note Modal */}
      <Modal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        title="Lập Phiếu Xuất Kho Giao Hàng Bán Hàng"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeliveryModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateDelivery} icon={Truck}>
              Xác Nhận Xuất Hàng
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1">
            <Select
              label="Chọn Đơn hàng SO cần xuất hàng (Tự động điền thông tin)"
              value={deliveryForm.so_id || ''}
              onChange={(e) => handleSelectSoForDelivery(e.target.value)}
              options={[
                { value: '', label: '-- Chọn Đơn hàng SO --' },
                ...orders.map((o) => ({
                  value: o.id,
                  label: `${o.code} - ${o.customer_name} (${o.part_name} | Còn lại: ${Math.max(0, (Number(o.order_qty) || 0) - (Number(o.delivered_qty) || 0))})`,
                })),
              ]}
            />
            {deliveryForm.so_id && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                ✨ Đã tự động điền Tên khách hàng, Mã bản vẽ và Số lượng còn lại từ Đơn hàng SO.
              </p>
            )}
          </div>
          <Input
            label="Khách hàng"
            value={deliveryForm.customer_name}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã bản vẽ"
              value={deliveryForm.drawing_code}
              disabled
            />
            <Input
              label="Số lượng xuất giao"
              type="number"
              value={deliveryForm.delivery_qty}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, delivery_qty: Number(e.target.value) })}
              required
            />
          </div>
          <Input
            label="Người đại diện nhận hàng"
            placeholder="Họ tên người nhận"
            value={deliveryForm.receiver_name}
            onChange={(e) => setDeliveryForm({ ...deliveryForm, receiver_name: e.target.value })}
            required
          />
          <Input
            label="Ghi chú đính kèm"
            placeholder="Kèm theo biên bản kiểm tra kích thước CMM, CO/CQ..."
            value={deliveryForm.note}
            onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
