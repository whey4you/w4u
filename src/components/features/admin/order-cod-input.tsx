import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

interface OrderCodInputProps {
  subtotal: number;
  shippingFee?: number;
  value: number; // Tiền thu COD hiện tại
  onChange: (calculatedCod: number) => void;
  initialDeposit?: number;
  className?: string;
}

export function OrderCodInput({
  subtotal,
  shippingFee = 0,
  value,
  onChange,
  initialDeposit,
  className = '',
}: OrderCodInputProps) {
  const fee = Math.max(0, Number(shippingFee || 0));
  const totalOrder = subtotal + fee;

  // depositInput có thể là chuỗi số (vd: "200000") hoặc "Full"
  const [depositInput, setDepositInput] = useState<string>(() => {
    if (typeof initialDeposit === 'number' && initialDeposit > 0) {
      return initialDeposit >= totalOrder && totalOrder > 0 ? 'Full' : String(initialDeposit);
    }
    if (value === 0 && totalOrder > 0) {
      return 'Full';
    }
    return '';
  });

  // Tính toán tiền cọc thực tế và tiền COD thu khách
  const isFull = depositInput.trim().toLowerCase() === 'full';
  const numericDeposit = isFull
    ? totalOrder
    : Math.max(0, Number(depositInput.replace(/[^0-9]/g, '')) || 0);

  const actualDeposit = Math.min(totalOrder, numericDeposit);
  const calculatedCod = isFull ? 0 : Math.max(0, totalOrder - actualDeposit);

  // Khi totalOrder hoặc deposit thay đổi, tự động sync tiền COD ra ngoài
  useEffect(() => {
    onChange(calculatedCod);
  }, [calculatedCod, onChange]);

  return (
    <div className={`bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 ${className}`}>
      {/* Hàng 1: Tổng tiền đơn hàng */}
      <div>
        <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider mb-1">
          1. Tổng Giá Trị Đơn {fee > 0 ? `(Tiền hàng ${formatPrice(subtotal)} + Cước ship ${formatPrice(fee)})` : '(Tiền Hàng)'}
        </label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={formatPrice(totalOrder)}
            className="w-full pl-3 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-800 text-sm cursor-not-allowed select-none"
          />
        </div>
      </div>

      {/* Hàng 2: Tiền cọc */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
            2. Tiền Cọc (Nhập số hoặc &quot;Full&quot;)
          </label>
          <button
            type="button"
            onClick={() => setDepositInput('Full')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              isFull
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Gõ nhanh Full
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={depositInput}
            onChange={(e) => setDepositInput(e.target.value)}
            placeholder="Nhập số tiền hoặc 'Full'"
            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:border-blue-500 font-bold text-slate-900 text-sm bg-white"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
            {isFull ? '' : 'đ'}
          </span>
        </div>
      </div>

      {/* Hàng 3: Tiền thu khách */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider mb-1">
          3. Tiền Thu COD Khi Nhận (Hàng 1 - Hàng 2)
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={formatPrice(calculatedCod)}
              className="w-full pl-3 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-100 font-bold text-blue-700 text-sm cursor-not-allowed select-none"
            />
          </div>

          {calculatedCod === 0 ? (
            <div className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap">
              <span>✅ Đã CK full</span>
            </div>
          ) : (
            <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap">
              <span>📦 Thu COD: {formatPrice(calculatedCod)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
