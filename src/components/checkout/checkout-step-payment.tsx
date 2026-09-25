'use client';

import React from 'react';
import { Loader2, QrCode, Truck } from 'lucide-react';
import { PaymentMethod } from '@/types/checkout';

interface CheckoutStepPaymentProps {
  isActive: boolean;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  submitting: boolean;
  errorMsg: string | null;
  onSubmit: () => void;
}

export function CheckoutStepPayment({
  isActive,
  paymentMethod,
  setPaymentMethod,
  submitting,
  errorMsg,
  onSubmit,
}: CheckoutStepPaymentProps) {
  // Inactive state (Steps 1 or 2 not completed)
  if (!isActive) {
    return (
      <div className="rounded-2xl bg-neutral-50/70 p-5 border border-neutral-200/60 transition-all opacity-60">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-[11px] font-bold">
            3
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            3. Phương thức thanh toán
          </h3>
        </div>
      </div>
    );
  }

  // Active Expanded State
  return (
    <div className="rounded-2xl bg-white p-5 sm:p-7 border border-neutral-900 ring-1 ring-neutral-900 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
          3
        </span>
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
          Phương thức thanh toán
        </h2>
      </div>

      <div className="space-y-3">
        {/* Option 1: VietQR 100% */}
        <button
          type="button"
          onClick={() => setPaymentMethod('payos')}
          className={`w-full flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
            paymentMethod === 'payos'
              ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
              : 'border-neutral-200 hover:border-neutral-300 bg-white'
          }`}
        >
          <div className={`mt-0.5 rounded-lg p-2 ${paymentMethod === 'payos' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
            <QrCode className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-neutral-900">VietQR Ngân Hàng (100%)</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-1.5 py-0.5 rounded">
                Khuyên dùng
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Quét mã QR từ mọi ứng dụng ngân hàng, thanh toán 100% (gồm tiền hàng & cước ship), nhận hàng không cần trả thêm tiền.
            </p>
          </div>
        </button>

        {/* Option 2: COD cọc 100k */}
        <button
          type="button"
          onClick={() => setPaymentMethod('cod')}
          className={`w-full flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all ${
            paymentMethod === 'cod'
              ? 'border-neutral-900 bg-neutral-50/70 ring-1 ring-neutral-900'
              : 'border-neutral-200 hover:border-neutral-300 bg-white'
          }`}
        >
          <div className={`mt-0.5 rounded-lg p-2 ${paymentMethod === 'cod' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
            <Truck className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-neutral-900">COD (Cọc 100.000đ qua VietQR)</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded">
                Đặt cọc trước
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cọc 100.000đ kích hoạt đơn, số tiền COD còn lại (gồm tiền hàng & cước ship) trả trực tiếp cho shipper khi nhận hàng.
            </p>
          </div>
        </button>

        <p className="text-[11px] text-neutral-500 pt-1">
          ✓ Quý khách được quyền đồng kiểm, mở gói hàng kiểm tra tem niêm phong cùng shipper trước khi thanh toán.
        </p>


        {errorMsg && (
          <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Integrated Action Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full mt-6 py-4 rounded-full bg-neutral-900 hover:bg-black text-white font-bold text-sm sm:text-base transition-all active:scale-[0.99] shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tạo hóa đơn...</span>
          </>
        ) : (
          <span>Đặt hàng & Xuất hóa đơn VietQR</span>
        )}
      </button>
    </div>
  );
}
