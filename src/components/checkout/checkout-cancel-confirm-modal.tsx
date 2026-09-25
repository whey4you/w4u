'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface CheckoutCancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  isCancelling?: boolean;
}

export function CheckoutCancelConfirmModal({
  isOpen,
  onClose,
  onConfirmCancel,
  isCancelling = false,
}: CheckoutCancelConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100 text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
          <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-neutral-900">
            Hủy thanh toán đơn hàng?
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Mã QR VietQR cho đơn hàng này sẽ bị đóng. Bạn có chắc chắn muốn hủy và quay lại giỏ hàng không?
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="w-full py-3 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-[0.99] disabled:opacity-50"
          >
            Tiếp tục thanh toán VietQR
          </button>

          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={isCancelling}
            className="w-full py-2.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isCancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Xác nhận hủy & Về giỏ hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
