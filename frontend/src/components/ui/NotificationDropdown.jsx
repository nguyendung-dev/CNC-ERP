'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Factory, 
  Clock, 
  ChevronRight, 
  Trash2 
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Cảnh báo tồn kho thiếu (MRP)',
    message: 'Dao phay ngón Endmill D6 x 50L tồn kho dưới mức tối thiểu (còn 4/10 cái).',
    type: 'inventory',
    time: '5 phút trước',
    unread: true,
    targetNav: 'inventory',
  },
  {
    id: 2,
    title: 'Đề nghị tạm ứng chờ phê duyệt',
    message: 'Trưởng xưởng đề nghị tạm ứng 4,250,000đ mua phôi nhôm 6061 gấp cho đơn hàng Alpha Tech.',
    type: 'finance',
    time: '25 phút trước',
    unread: true,
    targetNav: 'finance',
  },
  {
    id: 3,
    title: 'Gia công ngoài đến hạn giao trả',
    message: 'Xưởng Anode Kim Phát hẹn giao trả 70 chi tiết Gối đỡ vòng bi hôm nay.',
    type: 'production',
    time: '1 giờ trước',
    unread: true,
    targetNav: 'production',
  },
  {
    id: 4,
    title: 'Tiến độ Đơn hàng SO-2026-001',
    message: 'Đã hoàn thành xuất kho đợt 1 (40/100 sản phẩm) kèm chứng chỉ CMM kiểm tra kích thước.',
    type: 'sales',
    time: '2 giờ trước',
    unread: true,
    targetNav: 'sales',
  },
  {
    id: 5,
    title: 'Báo cáo kiểm tra chất lượng QC',
    message: 'Ghi nhận 2 sản phẩm phế phẩm NG tại máy Tiện Doosan do sai dung sai trục Z.',
    type: 'production',
    time: 'Hôm qua',
    unread: false,
    targetNav: 'production',
  },
];

export default function NotificationDropdown({ onSelectModule }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'inventory'
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleItemClick = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (onSelectModule && item.targetNav) {
      onSelectModule(item.targetNav);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    if (filter === 'inventory') return n.type === 'inventory';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'inventory':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'finance':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'production':
        return <Factory className="w-4 h-4 text-blue-600" />;
      case 'sales':
        return <Package className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo xưởng"
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Thông báo xưởng & đơn hàng</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 flex items-center gap-1.5 border-b border-slate-100 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('inventory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'inventory'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cảnh báo kho
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Không có thông báo nào
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition hover:bg-slate-50 ${
                    item.unread ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${item.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </p>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.time}
                      </span>
                      <button
                        onClick={(e) => deleteNotification(item.id, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-xs font-medium text-slate-500">
              Đồng bộ dữ liệu xưởng thời gian thực
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
