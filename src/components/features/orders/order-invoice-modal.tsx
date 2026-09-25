'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';
import { Order } from '@/services/order.service';
import { CheckoutReceiptCard } from '@/components/checkout/checkout-receipt-card';

interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function OrderInvoiceModal({ isOpen, onClose, order }: OrderInvoiceModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-invoice');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('printing-invoice');
      window.print();
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/orders?code=${encodeURIComponent(order.order_code)}&invoice=true`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback nếu không truy cập được clipboard API
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      id="order-invoice-portal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 print:static print:p-0 print:bg-transparent print:overflow-visible print:block"
    >
      <div className="relative w-full max-w-xl my-auto print:max-w-none print:w-full print:m-0">
        {/* Thanh công cụ Modal (ẩn hoàn toàn khi in) */}
        <div className="flex items-center justify-between gap-2 p-3.5 mb-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-black/5 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Hóa đơn điện tử · {order.order_code}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs active:scale-[0.98]"
              title="In hóa đơn hoặc lưu PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In / Lưu PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs active:scale-[0.98]"
              title="Sao chép liên kết hóa đơn"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nội dung Hóa Đơn - DÙNG CHUNG 100% VỚI CHECKOUT RECEIPT */}
        <div className="max-h-[82vh] overflow-y-auto rounded-3xl print:max-h-none print:overflow-visible">
          <CheckoutReceiptCard order={order} />
        </div>
      </div>
    </div>,
    document.body
  );
}
