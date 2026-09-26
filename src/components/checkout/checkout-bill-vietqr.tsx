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
    <div className="rounded-2xl border-2 border-neutral-900 bg-white p-4 sm:p-6 space-y-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded-full">
              Bước 1: Quét mã QR thanh toán
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-900">Chuyển khoản VietQR tức thì</h3>
          <p className="text-xs text-neutral-500">Mở app ngân hàng quét mã hoặc sao chép thông tin bên dưới</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-900" />
          <span>Hết hạn: <strong className="font-mono text-neutral-900">{timeFormatted}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* QR Code */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/90 shadow-2xs">
          <div className="bg-white p-2 rounded-lg border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt="Mã VietQR" className="h-44 w-44 sm:h-48 sm:w-48 object-contain" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mt-2">Hệ thống Napas247 / VietQR</span>
        </div>

        {/* Transfer details */}
        <div className="md:col-span-7 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
            <span className="text-neutral-500">Chủ tài khoản:</span>
            <span className="font-bold text-neutral-900 uppercase text-right">{payos.accountName}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
            <span className="text-neutral-500">Số tài khoản:</span>
            <button
              type="button"
              onClick={() => handleCopy(payos.accountNumber, 'account')}
              className="inline-flex items-center gap-1.5 font-mono font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>{payos.accountNumber}</span>
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
            <span className="text-neutral-500">Số tiền cần chuyển:</span>
            <span className="font-black text-rose-600 text-base tabular-nums">{formatPrice(payos.amount)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
            <span className="text-neutral-500">Nội dung chuyển:</span>
            <button
              type="button"
              onClick={() => handleCopy(payos.description, 'desc')}
              className="inline-flex items-center gap-1.5 font-mono font-bold text-neutral-900 bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span>{payos.description}</span>
              <Copy className="h-3.5 w-3.5 text-amber-700" />
            </button>
          </div>

          {copiedField && (
            <p className="text-[11px] text-center text-emerald-600 font-semibold pt-1">
              ✓ Đã sao chép {copiedField === 'account' ? 'số tài khoản' : 'nội dung chuyển tiền'}!
            </p>
          )}

          <div className="pt-2">
            <a
              href={payos.checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-3 transition-all active:scale-[0.99]"
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
