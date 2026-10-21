'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { useToast } from '../../context/ToastContext';

export default function FinanceModule() {
  const { showSuccess, showError, confirmDelete } = useToast();
  const [subTab, setSubTab] = useState('advances'); // 'advances' | 'payments' | 'debts'
  const [advances, setAdvances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Forms
  const [advanceForm, setAdvanceForm] = useState({
    requester: '',
    purpose: '',
    amount: 1000000,
  });

  const [paymentForm, setPaymentForm] = useState({
    recipient: '',
    advance_id: '',
    category: 'Xưởng gia công ngoài',
    gross_amount: 5000000,
    deduct_advance_amount: 0,
    note: '',
  });

  const [debtForm, setDebtForm] = useState({
    partner_name: '',
    type: 'receivable',
    total_amount: 10000000,
    due_date: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resAdv, resPay, resDebts] = await Promise.all([
        api.get('/finance/advances'),
        api.get('/finance/payments'),
        api.get('/finance/debts'),
      ]);
      setAdvances(resAdv.data || []);
      setPayments(resPay.data || []);
      setDebts(resDebts.data || []);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/advances', advanceForm);
      setIsAdvanceModalOpen(false);
      setAdvanceForm({ requester: '', purpose: '', amount: 1000000 });
      loadData();
      showSuccess('Tạo tạm ứng thành công', `Đề nghị tạm ứng cho ${advanceForm.requester} đã được tạo.`);
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleApproveAdvance = async (id) => {
    try {
      await api.patch(`/finance/advances/${id}/approve`);
      loadData();
      showSuccess('Phê duyệt thành công', 'Phiếu tạm ứng đã được phê duyệt hợp lệ.');
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleSelectAdvanceForPayment = (advId) => {
    if (!advId) {
      setPaymentForm((prev) => ({
        ...prev,
        advance_id: '',
        deduct_advance_amount: 0,
      }));
      return;
    }
    const adv = advances.find((a) => String(a.id) === String(advId));
    if (adv) {
      setPaymentForm((prev) => {
        const autoNote = `Cấn trừ tạm ứng: ${adv.code} (${adv.purpose})`;
        return {
          ...prev,
          advance_id: adv.id,
          deduct_advance_amount: Number(adv.amount) || 0,
          recipient: prev.recipient || adv.requester || '',
          note: prev.note ? (prev.note.includes(adv.code) ? prev.note : `${prev.note} | ${autoNote}`) : autoNote,
        };
      });
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/payments', paymentForm);
      setIsPaymentModalOpen(false);
      setPaymentForm({
        recipient: '',
        advance_id: '',
        category: 'Xưởng gia công ngoài',
        gross_amount: 5000000,
        deduct_advance_amount: 0,
        note: '',
      });
      loadData();
      showSuccess('Tạo thanh toán thành công!', 'Đề nghị thanh toán chi phí đã được gửi phê duyệt.');
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handlePayDebt = async (debtId) => {
    const amountStr = prompt('Nhập số tiền thanh toán (VNĐ):');
    if (!amountStr) return;
    try {
      await api.post(`/finance/debts/${debtId}/pay`, { amount: Number(amountStr) });
      loadData();
      showSuccess('Thanh toán thành công!', 'Số tiền công nợ đã được khấu trừ cập nhật.');
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleCreateDebt = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/debts', debtForm);
      setIsDebtModalOpen(false);
      setDebtForm({
        partner_name: '',
        type: 'receivable',
        total_amount: 10000000,
        due_date: '',
      });
      loadData();
      showSuccess('Lưu công nợ thành công', `Hồ sơ công nợ của ${debtForm.partner_name} đã được cập nhật.`);
    } catch (err) {
      showError('Có lỗi xảy ra', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteAdvance = (id) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Phiếu Tạm Ứng',
      itemName: 'Phiếu tạm ứng #' + id,
      message: 'Bạn có chắc chắn muốn xóa Phiếu tạm ứng này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/finance/advances/' + id);
          loadData();
          showSuccess('Đã xóa thành công!', 'Phiếu tạm ứng đã được xóa khỏi hệ thống.');
        } catch (err) {
          showError('Lỗi xóa phiếu tạm ứng', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeletePayment = (id) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Đề Nghị Thanh Toán',
      itemName: 'Phiếu thanh toán #' + id,
      message: 'Bạn có chắc chắn muốn xóa Đề nghị thanh toán này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/finance/payments/' + id);
          loadData();
          showSuccess('Đã xóa thành công!', 'Phiếu thanh toán đã được xóa khỏi hệ thống.');
        } catch (err) {
          showError('Lỗi xóa phiếu thanh toán', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const handleDeleteDebt = (id) => {
    confirmDelete({
      title: 'Xác Nhận Xóa Hồ Sơ Công Nợ',
      itemName: 'Hồ sơ công nợ #' + id,
      message: 'Bạn có chắc chắn muốn xóa Hồ sơ công nợ này khỏi hệ thống không?',
      onConfirm: async () => {
        try {
          await api.delete('/finance/debts/' + id);
          loadData();
          showSuccess('Đã xóa thành công!', 'Hồ sơ công nợ đã được xóa khỏi hệ thống.');
        } catch (err) {
          showError('Lỗi xóa công nợ', err.response?.data?.message || err.message);
        }
      },
    });
  };

  const netPayment = Math.max(
    0,
    Number(paymentForm.gross_amount || 0) - Number(paymentForm.deduct_advance_amount || 0)
  );

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setSubTab('advances')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'advances'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Đề Nghị Tạm Ứng</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'advances' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {advances.length}
            </span>
          </button>
          <button
            onClick={() => setSubTab('payments')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'payments'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Đề Nghị Thanh Toán</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'payments' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {payments.length}
            </span>
          </button>
          <button
            onClick={() => setSubTab('debts')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'debts'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span>Sổ Quản Lý Công Nợ</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${subTab === 'debts' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-600'}`}>
              {debts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {subTab === 'advances' && (
            <Button size="md" icon={Plus} onClick={() => setIsAdvanceModalOpen(true)}>
              Tạo phiếu tạm ứng
            </Button>
          )}
          {subTab === 'payments' && (
            <Button size="md" icon={Plus} onClick={() => setIsPaymentModalOpen(true)}>
              Lập phiếu thanh toán
            </Button>
          )}
          {subTab === 'debts' && (
            <Button size="md" icon={Plus} onClick={() => setIsDebtModalOpen(true)}>
              Tạo công nợ mới
            </Button>
          )}
        </div>
      </div>

      {/* Advances SubTab */}
      {subTab === 'advances' && (
        <Table
          isLoading={loading}
          data={advances}
          columns={[
            { header: 'Mã Phiếu', accessor: 'code', cellClassName: 'font-mono font-medium text-blue-600' },
            { header: 'Người đề nghị', accessor: 'requester', cellClassName: 'font-semibold' },
            { header: 'Mục đích tạm ứng', accessor: 'purpose' },
            {
              header: 'Số tiền',
              render: (row) => `${Number(row.amount).toLocaleString()} đ`,
              cellClassName: 'font-bold text-slate-900',
            },
            {
              header: 'Người duyệt',
              render: (row) => row.approved_by || <span className="text-slate-400 italic">Chờ duyệt</span>,
            },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {row.status === 'pending' ? (
                    <Button size="sm" variant="success" onClick={() => handleApproveAdvance(row.id)}>
                      Duyệt chi
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteAdvance(row.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa phiếu tạm ứng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Payments SubTab */}
      {subTab === 'payments' && (
        <Table
          isLoading={loading}
          data={payments}
          columns={[
            { header: 'Mã TT', accessor: 'code', cellClassName: 'font-mono font-medium text-emerald-600' },
            { header: 'Đơn vị thụ hưởng', accessor: 'recipient', cellClassName: 'font-semibold' },
            { header: 'Phân loại', accessor: 'category' },
            {
              header: 'Tổng tiền đề nghị',
              render: (row) => `${Number(row.gross_amount).toLocaleString()} đ`,
            },
            {
              header: 'Trừ lùi tạm ứng',
              render: (row) => (
                <span className="text-rose-600 font-medium">
                  -{Number(row.deduct_advance_amount).toLocaleString()} đ
                </span>
              ),
            },
            {
              header: 'Thực chi thanh toán',
              render: (row) => (
                <span className="font-bold text-slate-900">
                  {Number(row.net_amount).toLocaleString()} đ
                </span>
              ),
            },
            { header: 'Ghi chú', accessor: 'note', cellClassName: 'text-xs text-slate-500' },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <button
                  onClick={() => handleDeletePayment(row.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa phiếu thanh toán"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
            },
          ]}
        />
      )}

      {/* Debts SubTab */}
      {subTab === 'debts' && (
        <Table
          isLoading={loading}
          data={debts}
          columns={[
            { header: 'Đối tác / Doanh nghiệp', accessor: 'partner_name', cellClassName: 'font-semibold text-slate-900' },
            {
              header: 'Loại công nợ',
              render: (row) => (
                row.type === 'receivable' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                    <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" /> Phải thu khách hàng
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" /> Phải trả xưởng/NCC
                  </span>
                )
              ),
            },
            {
              header: 'Tổng công nợ',
              render: (row) => `${Number(row.total_amount).toLocaleString()} đ`,
            },
            {
              header: 'Đã thanh toán',
              render: (row) => `${Number(row.paid_amount).toLocaleString()} đ`,
              cellClassName: 'text-emerald-600 font-medium',
            },
            {
              header: 'Còn nợ lại',
              render: (row) => (
                <span className="font-bold text-rose-600">
                  {Number(row.remaining_amount).toLocaleString()} đ
                </span>
              ),
            },
            { header: 'Hạn thanh toán', accessor: 'due_date', cellClassName: 'text-xs font-mono' },
            {
              header: 'Trạng thái',
              render: (row) => <Badge status={row.status}>{row.status}</Badge>,
            },
            {
              header: 'Thao tác',
              render: (row) => (
                <div className="flex items-center gap-1.5">
                  {row.remaining_amount > 0 ? (
                    <Button size="sm" variant="secondary" onClick={() => handlePayDebt(row.id)}>
                      Ghi nhận trả
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Đã tất toán</span>
                  )}
                  <button
                    onClick={() => handleDeleteDebt(row.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa hồ sơ công nợ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Advance Modal */}
      <Modal
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        title="Tạo Phiếu Đề Nghị Tạm Ứng"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAdvanceModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreateAdvance}>Gửi Đề Nghị</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Người đề nghị tạm ứng"
            placeholder="VD: Nguyễn Văn Tuấn (Trưởng xưởng)"
            value={advanceForm.requester}
            onChange={(e) => setAdvanceForm({ ...advanceForm, requester: e.target.value })}
            required
          />
          <Input
            label="Mục đích tạm ứng"
            placeholder="Mua phôi nhôm gấp, tạm ứng nhiệt luyện..."
            value={advanceForm.purpose}
            onChange={(e) => setAdvanceForm({ ...advanceForm, purpose: e.target.value })}
            required
          />
          <Input
            label="Số tiền tạm ứng (VNĐ)"
            type="number"
            value={advanceForm.amount}
            onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
            required
          />
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Lập Đề Nghị Thanh Toán (Tự Động Trừ Tạm Ứng)"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleCreatePayment}>Xác Nhận Đề Nghị</Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1">
            <Select
              label="Cấn trừ phiếu tạm ứng đã duyệt (Tự động điền & trừ tiền)"
              value={paymentForm.advance_id || ''}
              onChange={(e) => handleSelectAdvanceForPayment(e.target.value)}
              options={[
                { value: '', label: '-- Không cấn trừ tạm ứng --' },
                ...advances
                  .filter((a) => a.status === 'approved')
                  .map((a) => ({
                    value: a.id,
                    label: `${a.code} - ${a.requester} (${Number(a.amount).toLocaleString()} VNĐ - ${a.purpose})`,
                  })),
              ]}
            />
            {paymentForm.advance_id && (
              <p className="text-xs text-blue-600 font-medium mt-1">
                ✨ Đã tự động cấn trừ số tiền tạm ứng vào phiếu đề nghị thanh toán này.
              </p>
            )}
          </div>
          <Input
            label="Đơn vị thụ hưởng (NCC Phôi / Xưởng ngoài)"
            placeholder="Xưởng Anode Kim Phát / Cty Thép Phương Nam"
            value={paymentForm.recipient}
            onChange={(e) => setPaymentForm({ ...paymentForm, recipient: e.target.value })}
            required
          />

          <Select
            label="Danh mục thanh toán"
            value={paymentForm.category}
            onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
            options={[
              { value: 'Xưởng gia công ngoài', label: 'Xưởng gia công ngoài (Xi mạ/Nhiệt luyện)' },
              { value: 'NCC Phôi/Vật tư', label: 'NCC Phôi kim loại & Dao cụ' },
              { value: 'Chi phí vận hành xưởng', label: 'Chi phí vận hành xưởng & dầu mỡ' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số tiền thanh toán đề nghị (Gross)"
              type="number"
              value={paymentForm.gross_amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, gross_amount: Number(e.target.value) })}
              required
            />
            <Input
              label="Số tiền trừ lùi tạm ứng đã nhận"
              type="number"
              value={paymentForm.deduct_advance_amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, deduct_advance_amount: Number(e.target.value) })}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-700">Số tiền thực chi sau khi trừ tạm ứng:</span>
            <span className="text-lg font-bold text-blue-700">{netPayment.toLocaleString()} VNĐ</span>
          </div>

          <Input
            label="Ghi chú đính kèm hóa đơn / chứng từ"
            placeholder="Số hóa đơn VAT, phiếu giao hàng kèm theo..."
            value={paymentForm.note}
            onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
          />
        </form>
      </Modal>

      {/* Create Debt Modal */}
      {isDebtModalOpen && (
        <Modal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          title="Tạo Hồ Sơ Quản Lý Công Nợ Mới"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsDebtModalOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleCreateDebt}>Lưu Hồ Sơ Công Nợ</Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Tên Đối tác / Khách hàng / Nhà cung cấp"
              placeholder="VD: Cty TNHH Sakura Precision..."
              value={debtForm.partner_name}
              onChange={(e) => setDebtForm({ ...debtForm, partner_name: e.target.value })}
              required
            />

            <Select
              label="Phân loại công nợ"
              value={debtForm.type}
              onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value })}
              options={[
                { value: 'receivable', label: 'Phải thu khách hàng (Receivable - Bán hàng/Gia công)' },
                { value: 'payable', label: 'Phải trả xưởng / NCC (Payable - Mua phôi/Gia công ngoài)' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tổng số tiền công nợ (VNĐ)"
                type="number"
                value={debtForm.total_amount}
                onChange={(e) => setDebtForm({ ...debtForm, total_amount: Number(e.target.value) })}
                required
              />
              <Input
                label="Hạn thanh toán dự kiến"
                type="date"
                value={debtForm.due_date}
                onChange={(e) => setDebtForm({ ...debtForm, due_date: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
