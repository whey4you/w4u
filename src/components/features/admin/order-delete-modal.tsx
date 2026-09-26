'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Edit3, X, Loader2 } from 'lucide-react';
import { Order } from '@/services/order.service';
import { deleteAdminOrderAction } from '@/app/actions/admin-order.actions';

interface OrderDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onEditOrder?: (order: Order) => void;
  onDeleted: () => void;
}

export function OrderDeleteModal({
  isOpen,
  onClose,
  order,
  onEditOrder,
  onDeleted,
}: OrderDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const hasAllinGo = Boolean(order.allingo_order_id || order.tracking_code || order.allingo_track_id);
  const trackingCode = order.tracking_code || order.allingo_track_id;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setErrorMsg(null);
    try {
      const res = await deleteAdminOrderAction(order.id);
      if (res.success) {
        onDeleted();
        onClose();
      } else {
        setErrorMsg(res.error || 'Không thể xóa đơn hàng.');
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (
        err?.name === 'UnrecognizedActionError' ||
        errMsg.includes('Server Action') ||
        errMsg.includes('not found on the server') ||
        errMsg.includes('Failed to load resource')
      ) {
        setErrorMsg('Phiên bản web vừa được cập nhật. Đang tự động tải lại trang...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setErrorMsg(errMsg || 'Không thể xóa đơn hàng.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSwitchToEdit = () => {
    onClose();
    if (onEditOrder) {
      onEditOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${
          hasAllinGo ? 'bg-amber-50/80 border-amber-200/70' : 'bg-rose-50/80 border-rose-200/70'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl ${
              hasAllinGo ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {hasAllinGo ? <AlertTriangle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </span>
            <div>
              <h3 className={`font-bold text-sm ${hasAllinGo ? 'text-amber-900' : 'text-rose-900'}`}>
                {hasAllinGo ? 'Đơn Đã Có Mã Vận Đơn AllinGo' : 'Xác Nhận Xóa Đơn Hàng'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Mã đơn: {order.order_code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-3.5 text-sm text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {hasAllinGo ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <p className="font-semibold">⚠️ Vận đơn đã được tạo trên hệ thống:</p>
                <p>• Mã vận đơn: <strong className="font-mono">{trackingCode || 'Đã liên kết sàn'}</strong></p>
                {order.carrier_name && <p>• Đơn vị giao: <strong>{order.carrier_name}</strong></p>}
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                Đơn hàng này đang có mã vận đơn hoạt động. Bạn muốn <strong>Chuyển sang Chỉnh Sửa</strong> (để hủy vận đơn và sửa thông tin) hay <strong>Xác Nhận Xóa Vĩnh Viễn</strong> (hệ thống sẽ tự động hủy đơn trên AllinGo để hoàn tiền cước vào ví)?
              </p>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-slate-600">
              Bạn có chắc chắn muốn xóa đơn hàng của khách hàng <strong>{order.customer_name}</strong>? Thao tác này sẽ xóa đơn hoàn toàn khỏi hệ thống và không thể khôi phục.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>

          {hasAllinGo && (
            <button
              type="button"
              onClick={handleSwitchToEdit}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chuyển Sang Chỉnh Sửa</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{hasAllinGo ? 'Xác Nhận Xóa Vĩnh Viễn' : 'Xóa Đơn Hàng'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
