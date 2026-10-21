'use client';

import { t } from '../i18n';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertTriangle, Info, Trash2 } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: t('toast.confirm_delete_title'),
    message: '',
    itemName: '',
    confirmText: t('toast.confirm_btn'),
    cancelText: t('toast.cancel_btn'),
    onConfirm: null,
    loading: false,
  });

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((title, message) => {
    showToast({ type: 'success', title: title || t('common.success'), message });
  }, [showToast]);

  const showError = useCallback((title, message) => {
    showToast({ type: 'error', title: title || t('common.error'), message });
  }, [showToast]);

  const showInfo = useCallback((title, message) => {
    showToast({ type: 'info', title: title || t('common.info'), message });
  }, [showToast]);

  const confirmDelete = useCallback(({ title, message, itemName, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title: title || t('toast.confirm_delete_title'),
      message: message || `Bạn có chắc chắn muốn xóa "${itemName || 'mục này'}" khỏi hệ thống không?`,
      itemName: itemName || '',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      onConfirm,
      loading: false,
    });
  }, []);

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.onConfirm) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await confirmModal.onConfirm();
      closeConfirmModal();
    } catch (err) {
      showError('Lỗi thực hiện', err.message || 'Không thể xóa dữ liệu');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        confirmDelete,
      }}
    >
      {children}

      {/* 1. TOAST NOTIFICATIONS CONTAINER (Top-Right, matching user design) */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-lg backdrop-blur-xs transition-all duration-200 animate-in slide-in-from-top-4 fade-in flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-[#edfbf2] border-[#86efac] text-[#14532d] shadow-emerald-600/10'
                : toast.type === 'error'
                ? 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b] shadow-rose-600/10'
                : 'bg-[#eff6ff] border-[#93c5fd] text-[#1e40af] shadow-blue-600/10'
            }`}
          >
            {/* Round Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-6 h-6 rounded-full bg-[#dc2626] text-white flex items-center justify-center shadow-xs">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                  <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-bold leading-tight tracking-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                  {toast.message}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition p-1 -mr-1 -mt-1 rounded-lg shrink-0 cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 2. CONFIRM DELETE MODAL DIALOG */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={closeConfirmModal}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {confirmModal.message}
                </p>
                {confirmModal.itemName && (
                  <div className="mt-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-700 break-all">
                    {confirmModal.itemName}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {t('toast.confirm_delete_warning')}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={confirmModal.loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmModal.loading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {confirmModal.loading ? (
                  <span>Đang xóa...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmModal.confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
