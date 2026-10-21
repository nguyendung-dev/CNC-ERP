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
  ExternalLink,
  Trash2
} from 'lucide-react';
import api from '../../api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';

export default function ProductionModule() {
  const [subTab, setSubTab] = useState('lsx'); // 'lsx' | 'wip' | 'subcontract'
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [subcontracts, setSubcontracts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isLsxModalOpen, setIsLsxModalOpen] = useState(false);
  const [isWipModalOpen, setIsWipModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Forms
  const [lsxForm, setLsxForm] = useState({
    code: '',
    so_id: '',
    part_name: '',
    drawing_code: '',
    target_qty: 50,
    current_step: 'Cắt phôi',
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
      const [resLsx, resWip, resSub, resSo] = await Promise.all([
        api.get('/production/orders'),
        api.get('/production/wip-movements'),
        api.get('/production/subcontracting'),
        api.get('/sales/orders').catch(() => ({ data: [] })),
      ]);
      setOrders(resLsx.data || []);
      setMovements(resWip.data || []);
      setSubcontracts(resSub.data || []);
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
      setWipForm((prev) => ({
        ...prev,
        production_order_id: found.id,
        from_step: found.current_step || prev.from_step,
        qty_passed: remaining,
      }));
    }
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
      alert('Tạo Lệnh sản xuất (LSX) thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleCreateWip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/wip-movements', wipForm);
      setIsWipModalOpen(false);
      loadData();
      alert('Lập phiếu chuyển công đoạn và ghi nhận đạt/lỗi (NG) thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleCreateSubcontract = async (e) => {
    e.preventDefault();
    try {
      await api.post('/production/subcontracting', subForm);
      setIsSubModalOpen(false);
      loadData();
      alert('Lập phiếu gửi gia công ngoài thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
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
      alert('Cập nhật nhận hàng gia công ngoài thành công!');
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteLsx = async (lsxId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Lệnh sản xuất (LSX) này không?')) return;
    try {
      await api.delete(`/production/orders/${lsxId}`);
      alert('Đã xóa lệnh sản xuất LSX thành công!');
      loadData();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteWip = async (wipId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Phiếu luân chuyển BTP này không?')) return;
    try {
      await api.delete(`/production/wip-movements/${wipId}`);
      alert('Đã xóa phiếu luân chuyển BTP thành công!');
      loadData();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDeleteSubcontract = async (subId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Phiếu gia công ngoài này không?')) return;
    try {
      await api.delete(`/production/subcontracting/${subId}`);
      alert('Đã xóa phiếu gia công ngoài thành công!');
      loadData();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
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
        </div>

        <div className="flex items-center gap-2.5">
          {subTab === 'lsx' && (
            <Button size="md" icon={Plus} onClick={() => setIsLsxModalOpen(true)}>
              Tạo LSX mới
            </Button>
          )}
          {subTab === 'wip' && (
            <Button size="md" icon={Workflow} onClick={() => setIsWipModalOpen(true)}>
              Phiếu chuyển công đoạn
            </Button>
          )}
          {subTab === 'subcontract' && (
            <Button size="md" icon={Truck} onClick={() => setIsSubModalOpen(true)}>
              Gửi gia công ngoài
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
            { header: 'Chi tiết gia công', accessor: 'part_name' },
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
                <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {row.current_step}
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
                <button
                  onClick={() => handleDeleteLsx(row.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa lệnh sản xuất LSX"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ),
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
                  {row.status === 'sent' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReceiveSubcontract(row.id)}
                    >
                      Nhận hàng & QC
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận & QC
                    </span>
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Từ công đoạn"
              value={wipForm.from_step}
              onChange={(e) => setWipForm({ ...wipForm, from_step: e.target.value })}
              required
            />
            <Input
              label="Đến công đoạn"
              value={wipForm.to_step}
              onChange={(e) => setWipForm({ ...wipForm, to_step: e.target.value })}
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
            <Input
              label="Đơn giá gia công ngoài (VNĐ/cái)"
              type="number"
              value={subForm.unit_cost}
              onChange={(e) => setSubForm({ ...subForm, unit_cost: Number(e.target.value) })}
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
    </div>
  );
}
