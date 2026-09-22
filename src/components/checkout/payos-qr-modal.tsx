'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, Loader2, X } from 'lucide-react';
import { PayOSPaymentData } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PayosQrModalProps {
  orderCode: string;
  payosData: PayOSPaymentData;
  onSuccess: () => void;
  onClose: () => void;
}

export function PayosQrModal({ orderCode, payosData, onSuccess, onClose }: PayosQrModalProps) {
  const [copiedField, setCopiedField] = useState<'account' | 'desc' | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  // VietQR Image fallback
  const vietQrImgUrl = `https://img.vietqr.io/image/${payosData.bin}-${payosData.accountNumber}-compact2.png?amount=${payosData.amount}&addInfo=${encodeURIComponent(payosData.description)}&accountName=${encodeURIComponent(payosData.accountName)}`;

  const handleCopy = (text: string, field: 'account' | 'desc') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0 || isPaid) return;
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isPaid]);

  // Polling order status every 3s
  useEffect(() => {
    if (isPaid) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderCode}/status`);
        const json = await res.json();
        if (json.success && json.isPaid) {
          setIsPaid(true);
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái thanh toán:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderCode, isPaid, onSuccess]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-sm flex-col rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {isPaid ? (
          <div className="flex flex-col items-center py-8 text-center animate-in fade-in">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">Thanh toán thành công!</h3>
            <p className="mt-1 text-sm text-slate-500">Đơn hàng {orderCode} đã được xác nhận</p>
            <p className="mt-4 text-xs text-slate-400">Đang chuyển sang trang chi tiết...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Quét mã VietQR để thanh toán</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mở app ngân hàng bất kỳ để quét QR
              </p>
            </div>

            {/* QR Image */}
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-slate-50 p-3 border border-slate-100">
              <img
                src={vietQrImgUrl}
                alt="Mã QR thanh toán PayOS"
                className="h-56 w-56 object-contain rounded-lg shadow-2xs"
              />
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Loader2 className="h-3 w-3 animate-spin text-apple-blue" />
                <span>Hết hạn sau: <strong className="text-rose-600 font-mono">{timeFormatted}</strong></span>
              </div>
            </div>

            {/* Thông tin chuyển khoản */}
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-semibold text-slate-900 uppercase">{payosData.accountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tài khoản:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(payosData.accountNumber, 'account')}
                  className="flex items-center gap-1 font-mono font-bold text-blue-600 hover:underline"
                >
                  <span>{payosData.accountNumber}</span>
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-rose-600 text-sm">{formatPrice(payosData.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nội dung CK:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(payosData.description, 'desc')}
                  className="flex items-center gap-1 font-mono font-bold text-slate-800 hover:underline"
                >
                  <span>{payosData.description}</span>
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              {copiedField && (
                <p className="text-[11px] text-center text-emerald-600 font-medium">
                  Đã sao chép {copiedField === 'account' ? 'số tài khoản' : 'nội dung'}!
                </p>
              )}
            </div>

            {/* Direct PayOS Link button */}
            <div className="mt-4 flex gap-2">
              <a
                href={payosData.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Mở cổng PayOS</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl py-2.5 text-xs"
              >
                Đóng
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
