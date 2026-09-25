'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Loader2, ExternalLink } from 'lucide-react';
import { PayOSPaymentData } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';

export interface PaidSuccessData {
  trackingCode?: string | null;
  carrierName?: string | null;
  trackingUrl?: string | null;
}

interface CheckoutBillVietQrProps {
  orderCode: string;
  payos: PayOSPaymentData;
  isPaid: boolean;
  onPaidSuccess: (data?: PaidSuccessData) => void;
}

export function CheckoutBillVietQr({ orderCode, payos, isPaid, onPaidSuccess }: CheckoutBillVietQrProps) {
  const [copiedField, setCopiedField] = useState<'account' | 'desc' | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  const qrImageUrl = `https://img.vietqr.io/image/${payos.bin}-${payos.accountNumber}-compact2.png?amount=${payos.amount}&addInfo=${encodeURIComponent(payos.description)}&accountName=${encodeURIComponent(payos.accountName)}`;

  const handleCopy = (text: string, field: 'account' | 'desc') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (secondsLeft <= 0 || isPaid) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isPaid]);

  useEffect(() => {
    if (isPaid) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderCode}/status`);
        const json = await res.json();
        if (json.success && json.isPaid) {
          onPaidSuccess({
            trackingCode: json.trackingCode,
            carrierName: json.carrierName,
            trackingUrl: json.trackingUrl,
          });
        }
      } catch (err) {
        console.error('Lỗi polling đơn hàng:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderCode, isPaid, onPaidSuccess]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/60 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Quét mã VietQR chuyển khoản tức thì</h4>
          <p className="text-xs text-neutral-500">Mở ứng dụng ngân hàng bất kỳ để quét mã thanh toán tự động</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-white px-2.5 py-1 rounded-full border border-neutral-200">
          <Loader2 className="h-3 w-3 animate-spin text-neutral-900" />
          <span>Hết hạn: <strong className="font-mono">{timeFormatted}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* QR Code */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
          <img src={qrImageUrl} alt="Mã VietQR" className="h-44 w-44 object-contain" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mt-1.5">Hệ thống Napas247 / VietQR</span>
        </div>

        {/* Transfer details */}
        <div className="md:col-span-7 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
            <span className="text-neutral-500">Chủ tài khoản:</span>
            <span className="font-bold text-neutral-900 uppercase">{payos.accountName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
            <span className="text-neutral-500">Số tài khoản:</span>
            <button
              type="button"
              onClick={() => handleCopy(payos.accountNumber, 'account')}
              className="inline-flex items-center gap-1 font-mono font-bold text-neutral-900 hover:underline"
            >
              <span>{payos.accountNumber}</span>
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
            <span className="text-neutral-500">Số tiền cần chuyển:</span>
            <span className="font-black text-neutral-900 text-sm">{formatPrice(payos.amount)}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
            <span className="text-neutral-500">Nội dung chuyển:</span>
            <button
              type="button"
              onClick={() => handleCopy(payos.description, 'desc')}
              className="inline-flex items-center gap-1 font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200 hover:border-black"
            >
              <span>{payos.description}</span>
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>

          {copiedField && (
            <p className="text-[11px] text-center text-emerald-600 font-semibold pt-1">
              Đã sao chép {copiedField === 'account' ? 'số tài khoản' : 'nội dung chuyển tiền'}!
            </p>
          )}

          <div className="pt-2">
            <a
              href={payos.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2.5 transition-all"
            >
              <span>Mở cổng PayOS chuyển tiền trực tiếp</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
