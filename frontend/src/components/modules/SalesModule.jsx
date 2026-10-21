'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowRight, 
  FileText, 
  Truck, 
  Download, 
  CheckCircle2,
  Clock,
  AlertTriangle, 
  DollarSign, 
  Calculator,
  Trash2,
  Upload,
  Paperclip,
  X
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import CurrencyInput from '../ui/CurrencyInput';
import Badge, { STATUS_LABELS } from '../ui/Badge';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export default function SalesModule() {
  const { showSuccess, showError, confirmAction, confirmDelete } = useToast();
  const [drawingFile, setDrawingFile] = useState(null);
  const { user } = useAuth();

  const canManageQuotations = user?.role === 'admin' || user?.role === 'sales';
  const canManageDeliveries = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'warehouse';

  const [activeSubTab, setActiveSubTab] = useState('quotations'); // 'quotations' | 'orders' | 'deliveries'

  // If accountant or warehouse, hide quotations tab
  useEffect(() => {
    if (!canManageQuotations && activeSubTab === 'quotations') {
      setActiveSubTab('orders');
    }
  }, [user?.role, canManageQuotations, activeSubTab]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [customerList, setCustomerList] = useState([]);
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
    machine_hourly_rate: 0,
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
      const [resQuotes, resOrders, resDeliveries, resCustomers] = await Promise.allSettled([
        api.get('/sales/quotations'),
        api.get('/sales/orders'),
        api.get('/sales/delivery-notes'),
        api.get('/customers'),
      ]);
      setQuotations(resQuotes.status === 'fulfilled' ? (resQuotes.value.data || []) : []);
      setOrders(resOrders.status === 'fulfilled' ? (resOrders.value.data || []) : []);
      setDeliveries(resDeliveries.status === 'fulfilled' ? (resDeliveries.value.data || []) : []);
      setCustomerList(resCustomers.status === 'fulfilled' ? (resCustomers.value.data || []) : []);
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
        machine_hourly_rate: 0,
        subcontract_cost: 0,
        transport_cost: 0,
      });
      setDrawingFile(null);
      loadData();
      showSuccess('Tạo báo giá thành công!', 'Báo giá cho chi tiết "' + partName + '" của khách hàng ' + customerName + ' đã được tạo.');
    } catch (err) {
      showError('Lỗi lập báo giá', err.response?.data?.message || err.message);
    }
  };

  const handleConvertToSO = (quotation) => {
    const qId = typeof quotation === 'object' ? quotation.id : quotation;
    const qCode = typeof quotation === 'object' ? quotation.code : 'BG #' + qId;

    confirmAction({
      type: 'primary',
      title: 'Chuyển Đổi Sang Đơn Hàng (SO)',
      message: 'Bạn có chắc chắn muốn duyệt và chuyển Báo giá "' + qCode + '" thành Đơn đặt hàng (SO) chính thức không?',
      itemName: qCode,
      confirmText: 'Chuyển thành SO',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          await api.post('/sales/quotations/' + qId + '/convert-to-so');
          showSuccess('Chuyển đổi thành công!', 'Báo giá ' + qCode + ' đã được phê duyệt và tạo Đơn đặt hàng (SO) chính thức.', { itemName: qCode });
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
      const machined = Number(found.machined_qty || 0);
      const delivered = Number(found.delivered_qty || 0);
      const available = Math.max(0, machined - delivered);
      setSelectedOrderForDelivery(found);
      setDeliveryForm((prev) => ({
        ...prev,
        so_id: found.id,
        customer_name: found.customer_name,
        drawing_code: found.drawing_code,
        delivery_qty: available > 0 ? available : 1,
      }));
    }
  };

  const handleOpenDeliveryModal = (order) => {
    const machined = Number(order.machined_qty || 0);
    const delivered = Number(order.delivered_qty || 0);
    const available = Math.max(0, machined - delivered);

    if (machined === 0) {
      showError(
        'Chưa thể xuất kho!',
        `Đơn hàng "${order.code}" hiện chưa có thành phẩm nào được xưởng sản xuất hoàn thành & kiểm định QC (Hiện tại: 0/${order.order_qty} cái). Vui lòng chờ bộ phận Sản xuất gia công & bàn giao thành phẩm trước khi xuất kho!`
      );
      return;
    }

    if (available <= 0) {
      showError(
        'Đã xuất hết thành phẩm hiện có!',
        `Đơn hàng "${order.code}" đã xuất kho đủ ${delivered}/${machined} chi tiết đã hoàn thiện. Vui lòng chờ xưởng sản xuất gia công đợt tiếp theo!`
      );
      return;
    }

    setSelectedOrderForDelivery(order);
    setDeliveryForm({
      so_id: order.id,
      customer_name: order.customer_name,
      drawing_code: order.drawing_code,
      delivery_qty: available,
      receiver_name: '',
      note: 'Giao hàng kèm chứng chỉ KCS/QC',
    });
    setIsDeliveryModalOpen(true);
  };

  const handleConfirmExport = (deliveryNote) => {
    confirmAction({
      type: 'primary',
      title: 'Xác Nhận Kiểm Tra & Xuất Kho',
      message: `Thủ kho xác nhận đã kiểm tra đủ số lượng ${deliveryNote.delivery_qty} chi tiết cho khách hàng "${deliveryNote.customer_name}" và chính thức xuất kho?`,
      itemName: deliveryNote.code,
      confirmText: 'Xác nhận xuất kho',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await api.post(`/sales/delivery-notes/${deliveryNote.id}/confirm-export`);
          showSuccess('Xuất kho thành công!', `Thủ kho đã hoàn tất kiểm tra và xuất kho phiếu "${deliveryNote.code}".`);
          loadData();
        } catch (err) {
          showError('Lỗi xác nhận xuất kho', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    if (selectedOrderForDelivery) {
      const machined = Number(selectedOrderForDelivery.machined_qty || 0);
      const delivered = Number(selectedOrderForDelivery.delivered_qty || 0);
      const available = Math.max(0, machined - delivered);
      if (machined === 0) {
        showError('Không thể xuất kho', `Đơn hàng này chưa có chi tiết thành phẩm nào được xưởng sản xuất hoàn thành & QC đạt (0/${selectedOrderForDelivery.order_qty}).`);
        return;
      }
      if (Number(deliveryForm.delivery_qty) > available) {
        showError('Vượt quá tồn kho thành phẩm', `Số lượng xuất (${deliveryForm.delivery_qty}) vượt quá số lượng thành phẩm sẵn sàng trong kho (${available} cái).`);
        return;
      }
    }
    try {
      const res = await api.post('/sales/delivery-notes', deliveryForm);
      setIsDeliveryModalOpen(false);
      loadData();
      showSuccess('Thao tác thành công', res.data?.message || 'Phiếu xuất kho giao hàng đã được tạo thành công.');
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
                      onClick={() => handleConvertToSO(row)}
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
              render: (row) => {
                const machined = Number(row.machined_qty || 0);
                const delivered = Number(row.delivered_qty || 0);
                const available = Math.max(0, machined - delivered);

                return (
                  <div className="flex items-center gap-1.5">
                    {machined === 0 ? (
                      <button
                        onClick={() => handleOpenDeliveryModal(row)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 transition"
                        title="Chưa có thành phẩm nào gia công xong (Chờ sản xuất)"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chờ SX (0/{row.order_qty})</span>
                      </button>
                    ) : available <= 0 ? (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        Đã giao hết ({row.delivered_qty}/{row.order_qty})
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleOpenDeliveryModal(row)}
                        size="sm"
                        variant="primary"
                        icon={Truck}
                      >
                        {user?.role === 'warehouse' ? 'Xuất kho' : 'Đề xuất giao'} ({available})
                      </Button>
                    )}

                    {canManageQuotations && (
                      <button
                        onClick={() => handleDeleteOrder(row.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa đơn hàng SO"
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

      {/* Deliveries SubTab */}
      {activeSubTab === 'deliveries' && (
        <Table
          isLoading={loading}
          data={deliveries}
          columns={[
            { header: 'Mã Phiếu XK', accessor: 'code', cellClassName: 'font-mono font-bold text-emerald-600' },
            { header: 'Khách hàng', accessor: 'customer_name' },
            { header: 'Mã bản vẽ', accessor: 'drawing_code', cellClassName: 'font-mono' },
            { header: 'SL Giao', accessor: 'delivery_qty', cellClassName: 'font-bold text-slate-900' },
            {
              header: 'Trạng thái',
              render: (row) => (
                row.status === 'pending_warehouse' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-500" /> Chờ Thủ kho kiểm hàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã xuất kho
                  </span>
                )
              ),
            },
            {
              header: 'Người lập / Kiểm tra',
              render: (row) => (
                <div className="text-xs">
                  <p className="font-medium text-slate-800">{row.created_by || 'Kinh doanh'}</p>
                  <p className="text-[10px] text-slate-400">{row.checked_by ? `TK: ${row.checked_by}` : 'Chưa kiểm tra'}</p>
                </div>
              ),
            },
            { header: 'Ghi chú / Chứng chỉ', accessor: 'note', cellClassName: 'text-xs text-slate-500 max-w-xs truncate' },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {row.status === 'pending_warehouse' && (user?.role === 'warehouse' || user?.role === 'admin') && (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle2}
                      onClick={() => handleConfirmExport(row)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Kiểm hàng & Xuất kho
                    </Button>
                  )}
                  {row.status === 'pending_warehouse' && user?.role === 'sales' && (
                    <span className="text-xs text-amber-600 italic font-medium px-2 py-1 bg-amber-50/60 rounded border border-amber-100">
                      Chờ Thủ kho xuất
                    </span>
                  )}
                  {canManageDeliveries && (
                    <button
                      onClick={() => handleDeleteDelivery(row.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa phiếu giao hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Khách hàng / Doanh nghiệp <span className="text-rose-500">*</span>
                </label>
                {customerList.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-semibold">
                    ({customerList.length} khách hàng đã tạo)
                  </span>
                )}
              </div>
              <select
                value={customerList.some((c) => c.name === quotationForm.customer_name) ? quotationForm.customer_name : (quotationForm.customer_name ? '__custom__' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    setQuotationForm(prev => ({ ...prev, customer_name: '' }));
                  } else {
                    const found = customerList.find((c) => c.name === val);
                    setQuotationForm((prev) => ({
                      ...prev,
                      customer_name: val,
                      customer_phone: found?.phone || prev.customer_phone,
                    }));
                  }
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                required
              >
                <option value="">-- Chọn khách hàng đã tạo --</option>
                {customerList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.code} - {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
                <option value="__custom__">✏️ Hoặc nhập khách hàng mới khác...</option>
              </select>

              {(!customerList.some((c) => c.name === quotationForm.customer_name) || quotationForm.customer_name === '') && (
                <input
                  type="text"
                  placeholder="Gõ tên khách hàng mới tại đây..."
                  value={quotationForm.customer_name}
                  onChange={(e) => setQuotationForm({ ...quotationForm, customer_name: e.target.value })}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/20"
                />
              )}
            </div>

            <Input
              label="Số điện thoại / Liên hệ"
              placeholder="VD: 0912..."
              value={quotationForm.customer_phone}
              onChange={(e) => setQuotationForm({ ...quotationForm, customer_phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên chi tiết gia công"
              placeholder="VD: Trục truyền động"
              value={quotationForm.part_name}
              onChange={(e) => setQuotationForm({ ...quotationForm, part_name: e.target.value })}
              required
            />
            <Input
              label="Số lượng chi tiết"
              type="number"
              value={quotationForm.quantity}
              onChange={(e) => setQuotationForm({ ...quotationForm, quantity: Number(e.target.value) })}
              required
            />
          </div>

          {/* Bản vẽ kỹ thuật: Tùy chọn nhập mã và/hoặc tải file CAD / PDF */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Bản vẽ kỹ thuật <span className="text-slate-400 font-normal">(Nhập mã hoặc tải file bản vẽ CAD/PDF/ảnh)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn file bản vẽ</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.dwg,.dxf,.step,.stp,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDrawingFile(file);
                      if (!quotationForm.drawing_code) {
                        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        setQuotationForm(prev => ({ ...prev, drawing_code: nameWithoutExt }));
                      }
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Mã bản vẽ kỹ thuật (VD: DWG-SKR-01 hoặc để theo tên file)"
                value={quotationForm.drawing_code}
                onChange={(e) => setQuotationForm({ ...quotationForm, drawing_code: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {drawingFile && (
              <div className="flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{drawingFile.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">({(drawingFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawingFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  title="Gỡ file đính kèm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" /> Cấu thành chi phí gia công
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput
                label="Chi phí phôi (VNĐ)"
                value={quotationForm.raw_material_cost}
                onChange={(val) => setQuotationForm({ ...quotationForm, raw_material_cost: val })}
              />
              <Input
                label="Số giờ chạy máy CNC (h)"
                type="number"
                step="0.5"
                value={quotationForm.machine_hours}
                onChange={(e) => setQuotationForm({ ...quotationForm, machine_hours: Number(e.target.value) })}
              />
              <CurrencyInput
                label="Đơn giá giờ máy (VNĐ/h)"
                value={quotationForm.machine_hourly_rate}
                onChange={(val) => setQuotationForm({ ...quotationForm, machine_hourly_rate: val })}
              />
              <CurrencyInput
                label="Gia công ngoài (Xi mạ, Nhiệt luyện)"
                value={quotationForm.subcontract_cost}
                onChange={(val) => setQuotationForm({ ...quotationForm, subcontract_cost: val })}
              />
            </div>

            <CurrencyInput
              label="Chi phí vận chuyển & bao bì (VNĐ)"
              value={quotationForm.transport_cost}
              onChange={(val) => setQuotationForm({ ...quotationForm, transport_cost: val })}
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
        title={user?.role === 'warehouse' ? 'Kiểm Hàng & Xuất Kho Thành Phẩm' : 'Lập Phiếu Đề Nghị Xuất Kho Cho Thủ Kho'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeliveryModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateDelivery}
              icon={Truck}
              disabled={
                selectedOrderForDelivery &&
                Math.max(0, (Number(selectedOrderForDelivery.machined_qty) || 0) - (Number(selectedOrderForDelivery.delivered_qty) || 0)) <= 0
              }
            >
              {user?.role === 'warehouse' || user?.role === 'admin'
                ? 'Xác Nhận Kiểm Hàng & Xuất Kho'
                : 'Gửi Đề Nghị Xuất Cho Thủ Kho'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCreateDelivery}>
          <div className="space-y-1">
            <Select
              label="Chọn Đơn hàng SO cần xuất hàng (Tự động kiểm tra tiến độ gia công)"
              value={deliveryForm.so_id || ''}
              onChange={(e) => handleSelectSoForDelivery(e.target.value)}
              options={[
                { value: '', label: '-- Chọn Đơn hàng SO --' },
                ...orders.map((o) => {
                  const machined = Number(o.machined_qty) || 0;
                  const delivered = Number(o.delivered_qty) || 0;
                  const avail = Math.max(0, machined - delivered);
                  return {
                    value: o.id,
                    label: `${o.code} - ${o.customer_name} (${o.part_name} | Sẵn sàng: ${avail}/${o.order_qty})`,
                  };
                }),
              ]}
            />
            {selectedOrderForDelivery && (() => {
              const machined = Number(selectedOrderForDelivery.machined_qty || 0);
              const delivered = Number(selectedOrderForDelivery.delivered_qty || 0);
              const available = Math.max(0, machined - delivered);

              return (
                <div className="mt-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Đơn hàng: {selectedOrderForDelivery.code} - {selectedOrderForDelivery.part_name}</span>
                    <span className="text-blue-600 font-mono">Tổng đặt: {selectedOrderForDelivery.order_qty} cái</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-slate-600 pt-1 border-t border-blue-200/60 font-medium">
                    <div>Xưởng SX xong: <strong className="text-emerald-700">{machined}</strong> cái</div>
                    <div>Đã giao trước đó: <strong className="text-slate-800">{delivered}</strong> cái</div>
                    <div>Sẵn sàng xuất: <strong className="text-blue-700 font-bold">{available} cái</strong></div>
                  </div>
                  {machined === 0 && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-1.5 mt-1 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Đơn hàng này chưa có chi tiết nào gia công xong (0/{selectedOrderForDelivery.order_qty}). Chưa thể xuất kho!</span>
                    </div>
                  )}
                  {machined > 0 && available <= 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-1.5 mt-1 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Toàn bộ {delivered} chi tiết thành phẩm hoàn thiện đã được xuất giao hết. Vui lòng chờ xưởng làm thêm!</span>
                    </div>
                  )}
                </div>
              );
            })()}
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
