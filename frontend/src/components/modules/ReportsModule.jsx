'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  PieChart, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  Factory 
} from 'lucide-react';
import api from '../../api';
import StatCard from '../ui/StatCard';
import Button from '../ui/Button';
import ExportButton from '../ui/ExportButton';
import * as XLSX from 'xlsx';

export default function ReportsModule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleExportFullReport = () => {
    if (!data) return;

    const kpiSummary = [
      { 'Chỉ số KPI Quản trị': 'Tổng giá trị đơn hàng (SO)', 'Giá trị': `${data.sales.total_order_value.toLocaleString()} VNĐ` },
      { 'Chỉ số KPI Quản trị': 'Tổng số đơn hàng', 'Giá trị': `${data.sales.total_orders} đơn` },
      { 'Chỉ số KPI Quản trị': 'Số chi tiết đã giao', 'Giá trị': `${data.sales.total_delivered_qty} / ${data.sales.total_order_qty} cái` },
      { 'Chỉ số KPI Quản trị': 'Lệnh sản xuất LSX đang chạy', 'Giá trị': `${data.production.active_lsx_count} lệnh` },
      { 'Chỉ số KPI Quản trị': 'Tỷ lệ phế phẩm (NG)', 'Giá trị': `${data.production.ng_rate_percent}% (${data.production.ng_qty} cái)` },
      { 'Chỉ số KPI Quản trị': 'Tổng giá trị tồn kho phôi/dao cụ', 'Giá trị': `${data.inventory.total_inventory_value.toLocaleString()} VNĐ` },
      { 'Chỉ số KPI Quản trị': 'Số mã vật tư cảnh báo thiếu', 'Giá trị': `${data.inventory.low_stock_count} mã` },
      { 'Chỉ số KPI Quản trị': 'Tổng chi phí gia công ngoài', 'Giá trị': `${data.subcontracting.total_cost.toLocaleString()} VNĐ` },
      { 'Chỉ số KPI Quản trị': 'Công nợ phải thu khách hàng', 'Giá trị': `${data.finance.total_receivable.toLocaleString()} VNĐ` },
      { 'Chỉ số KPI Quản trị': 'Công nợ phải trả NCC/Xưởng ngoài', 'Giá trị': `${data.finance.total_payable.toLocaleString()} VNĐ` },
    ];

    const ws = XLSX.utils.json_to_sheet(kpiSummary);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tong_Quan_KPI_CNC');
    XLSX.writeFile(wb, `Bao_Cao_Tong_Quan_CNC_ERP_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading || !data) {
    return (
      <div className="py-12 text-center text-slate-500">
        Đang tổng hợp số liệu báo cáo thời gian thực...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Báo Cáo Quản Trị & Phân Tích Điều Hành CNC</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp trực tiếp từ cơ sở dữ liệu MySQL (Đơn hàng, Lệnh SX, Tồn kho, Tài chính)
          </p>
        </div>

        <ExportButton onClick={handleExportFullReport}>
          Xuất Báo Cáo Excel Quản Trị (XLSX)
        </ExportButton>
      </div>

      {/* Grid of Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Doanh số Đơn hàng (SO)"
          value={`${(data.sales.total_order_value / 1000000).toFixed(1)} tr`}
          subtext={`${data.sales.total_orders} đơn hàng đã lập`}
          icon={DollarSign}
          color="blue"
        />

        <StatCard
          title="Tỷ Lệ Phế Phẩm (NG)"
          value={`${data.production.ng_rate_percent}%`}
          subtext={`Ghi nhận ${data.production.ng_qty} sản phẩm lỗi`}
          icon={AlertCircle}
          color={data.production.ng_rate_percent > 3 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Giá Trị Kho Phôi & Dao Cụ"
          value={`${(data.inventory.total_inventory_value / 1000000).toFixed(1)} tr`}
          subtext={`${data.inventory.low_stock_count} vật tư dưới mức min`}
          icon={Layers}
          color="indigo"
        />

        <StatCard
          title="Chi Phí Gia Công Ngoài"
          value={`${(data.subcontracting.total_cost / 1000000).toFixed(1)} tr`}
          subtext={`${data.subcontracting.total_subcontracts} đợt gửi ngoài`}
          icon={Factory}
          color="amber"
        />
      </div>

      {/* Analytical Visual Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Production Delivery Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" /> Tiến độ giao hàng theo đơn SO
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {data.sales.total_delivered_qty} / {data.sales.total_order_qty} SP
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Tỷ lệ hoàn thành giao hàng</span>
                <span className="font-bold text-blue-600">
                  {data.sales.total_order_qty > 0
                    ? Math.round((data.sales.total_delivered_qty / data.sales.total_order_qty) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{
                    width: `${
                      data.sales.total_order_qty > 0
                        ? (data.sales.total_delivered_qty / data.sales.total_order_qty) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">LSX đang chạy:</span>
                <p className="text-base font-bold text-slate-800 mt-0.5">{data.production.active_lsx_count} lệnh</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Đã hoàn thành QC:</span>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{data.production.completed_qty} SP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Finance & Cashflow Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Cân đối công nợ & dòng tiền
            </h3>
            <span className="text-xs text-slate-400">Thời gian thực</span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <div>
                <span className="text-xs text-blue-700 font-medium">Công nợ phải thu từ khách hàng:</span>
                <p className="text-lg font-bold text-blue-900">
                  {Number(data.finance.total_receivable).toLocaleString()} VNĐ
                </p>
              </div>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-semibold">Tài sản</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
              <div>
                <span className="text-xs text-amber-700 font-medium">Công nợ phải trả NCC phôi & xưởng ngoài:</span>
                <p className="text-lg font-bold text-amber-900">
                  {Number(data.finance.total_payable).toLocaleString()} VNĐ
                </p>
              </div>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded font-semibold">Nghĩa vụ trả</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span>Chênh lệch thặng dư công nợ:</span>
              <span className="font-bold text-slate-900">
                {(data.finance.total_receivable - data.finance.total_payable).toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
