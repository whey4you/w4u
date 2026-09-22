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
      <span className="block text-sm font-medium text-slate-800">Phương thức thanh toán</span>
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
              <p className="text-sm font-semibold text-slate-900">QR Ngân hàng</p>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Nhanh 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Quét VietQR qua PayOS</p>
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
            <p className="text-sm font-semibold text-slate-900">COD khi nhận</p>
            <p className="text-xs text-slate-500 mt-0.5">Trả tiền mặt cho shipper</p>
          </div>
        </button>
      </div>
    </div>
  );
}
