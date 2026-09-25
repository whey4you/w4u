'use client';

import { QrCode, Truck } from 'lucide-react';
import { PaymentMethod } from '@/types/checkout';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-slate-800">Phương thức thanh toán</span>
        <span className="text-[11px] font-medium text-slate-500">Giao hàng tiêu chuẩn toàn quốc</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange('payos')}
          className={`relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
            selected === 'payos'
              ? 'border-apple-blue bg-blue-50/50 shadow-xs ring-1 ring-apple-blue'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`mt-0.5 rounded-lg p-2 ${selected === 'payos' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <QrCode className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-900">VietQR (100%)</p>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Khuyên dùng
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Thanh toán toàn bộ, nhận hàng không cần tiền mặt</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('cod')}
          className={`relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
            selected === 'cod'
              ? 'border-apple-blue bg-blue-50/50 shadow-xs ring-1 ring-apple-blue'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`mt-0.5 rounded-lg p-2 ${selected === 'cod' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Truck className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold text-slate-900">COD (Cọc 100k)</p>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                Cọc trước
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Cọc 100.000đ qua VietQR, trả phần còn lại khi nhận</p>
          </div>
        </button>
      </div>
    </div>
  );
}
