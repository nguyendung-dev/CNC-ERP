'use client';

import { t } from '../../i18n';

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
  Trash2,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../../api';

export default function NotificationDropdown({ onSelectModule }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch real notifications from database
  const loadNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [lowStockRes, advancesRes, quotesRes, subRes] = await Promise.allSettled([
        api.get('/inventory/materials/alerts/low-stock'),
        api.get('/finance/advances'),
        api.get('/sales/quotations'),
        api.get('/production/subcontracting'),
      ]);

      const items = [];

      // 1. Cảnh báo tồn kho dưới định mức an toàn (MySQL: materials table)
      if (lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value?.data)) {
        lowStockRes.value.data.forEach((m) => {
          items.push({
            id: `stock-${m.id}`,
            title: 'Cảnh báo tồn kho thiếu (MRP)',
            message: `Vật tư "${m.name}" (${m.code}) hiện còn ${m.quantity} / mức tối thiểu ${m.min_stock} ${m.unit || 'cái'}.`,
            type: 'inventory',
            time: 'Hiện tại',
            unread: true,
            targetNav: 'inventory',
          });
        });
      }

      // 2. Đề nghị tạm ứng chờ phê duyệt (MySQL: advances table status = pending)
      if (advancesRes.status === 'fulfilled' && Array.isArray(advancesRes.value?.data)) {
        advancesRes.value.data
          .filter((a) => a.status === 'pending')
          .forEach((a) => {
            items.push({
              id: `advance-${a.id}`,
              title: 'Đề nghị tạm ứng chờ duyệt',
              message: `${a.requester || 'Nhân viên'} đề nghị tạm ứng ${Number(a.amount).toLocaleString()}đ cho "${a.purpose}".`,
              type: 'finance',
              time: a.created_at ? new Date(a.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              unread: true,
              targetNav: 'finance',
            });
          });
      }

      // 3. Báo giá CNC chờ phê duyệt (MySQL: quotations table status = pending)
      if (quotesRes.status === 'fulfilled' && Array.isArray(quotesRes.value?.data)) {
        quotesRes.value.data
          .filter((q) => q.status === 'draft' || q.status === 'pending')
          .forEach((q) => {
            items.push({
              id: `quote-${q.id}`,
              title: 'Báo giá CNC chờ gửi khách',
              message: `Báo giá ${q.code} - Khách "${q.customer_name}" (${q.part_name}) trị giá ${Number(q.total_amount).toLocaleString()}đ.`,
              type: 'sales',
              time: q.created_at ? new Date(q.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              unread: true,
              targetNav: 'sales',
            });
          });
      }

      // 4. Gia công ngoài đang tiến hành (MySQL: subcontracting_orders status = sent)
      if (subRes.status === 'fulfilled' && Array.isArray(subRes.value?.data)) {
        subRes.value.data
          .filter((s) => s.status === 'sent')
          .forEach((s) => {
            items.push({
              id: `sub-${s.id}`,
              title: 'Gia công ngoài đang thực hiện',
              message: `Đơn gia công ${s.code} tại "${s.partner_name || s.vendor_name}" hẹn giao trả ${s.promise_date ? new Date(s.promise_date).toLocaleDateString('vi-VN') : 'sớm nhất'}.`,
              type: 'production',
              time: 'Đang theo dõi',
              unread: false,
              targetNav: 'production',
            });
          });
      }

      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications from database:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // {t('notifications.realtime')} Polling Sync: Auto refresh from MySQL every 8 seconds
  useEffect(() => {
    loadNotifications(false);

    const timer = setInterval(() => {
      loadNotifications(true);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

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
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(false);
        }}
        title="Thông báo xưởng"
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu (Wide & spacious to prevent any wrapping) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] sm:w-[430px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header - Redesigned, spacious, clean, no text breaking */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 whitespace-nowrap">
                Thông báo xưởng
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-200 whitespace-nowrap">
                  {unreadCount} {t('notifications.unread_suffix')}
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 whitespace-nowrap">
                  0 {t('notifications.unread_suffix')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadNotifications(false)}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title={t('notifications.sync_now')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t('notifications.mark_all_read')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 text-xs bg-white">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('notifications.tab_all')} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('notifications.tab_unread')} ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('inventory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'inventory'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('notifications.tab_inventory')}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                {t('notifications.checking')}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {t('notifications.empty')}
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
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                        title={t('notifications.delete_tooltip')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Realtime Live Sync Status */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
            </span>

          </div>
        </div>
      )}
    </div>
  );
}
