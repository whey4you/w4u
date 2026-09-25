'use client';

import React, { useState } from 'react';
import { Printer, Copy, Check, FileText } from 'lucide-react';
import { Order } from '@/services/order.service';
import { CheckoutReceiptCard } from '@/components/checkout/checkout-receipt-card';

interface OrderInvoiceCardProps {
  order: Order;
}

export function OrderInvoiceCard({ order }: OrderInvoiceCardProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      document.body.classList.add('printing-invoice');
      window.print();
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/orders?code=${encodeURIComponent(order.order_code)}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard fallback error
    }
  };

  return (
    <div className="space-y-3">
      {/* Thanh công cụ Hóa đơn (In / Lưu PDF, Copy link) */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-white shadow-2xs border border-black/[0.06] print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Hóa đơn điện tử</span>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Thẻ Hóa Đơn Bán Hàng */}
      <div className="rounded-2xl overflow-hidden shadow-xs">
        <CheckoutReceiptCard order={order} />
      </div>
    </div>
  );
}
