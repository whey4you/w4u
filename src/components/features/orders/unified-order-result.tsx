'use client';

import React, { useState } from 'react';
import { Truck, FileText } from 'lucide-react';
import { Order } from '@/services/order.service';
import { SPXTrackingResult } from '@/types/spx';
import { OrderShippingCard } from './order-shipping-card';
import { OrderInvoiceCard } from './order-invoice-card';

interface UnifiedOrderResultProps {
  order?: Order | null;
  spxResult?: SPXTrackingResult | null;
}

export function UnifiedOrderResult({ order, spxResult }: UnifiedOrderResultProps) {
  const [mobileTab, setMobileTab] = useState<'shipping' | 'invoice'>('shipping');

  if (!order && !spxResult) return null;

  // Trường hợp chỉ có kết quả vận đơn bưu cục (không có hóa đơn Whey4You)
  if (!order && spxResult) {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
        <OrderShippingCard spxResult={spxResult} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Mobile Tab Switcher (chỉ hiện trên màn hình nhỏ dưới lg) */}
      <div className="flex lg:hidden justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-200/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMobileTab('shipping')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              mobileTab === 'shipping'
                ? 'bg-white text-apple-blue font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Hành trình & Giao nhận
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('invoice')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              mobileTab === 'invoice'
                ? 'bg-white text-apple-blue font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Hóa đơn điện tử
          </button>
        </div>
      </div>

      {/* Layout hiển thị song song 2 cột trên Desktop (lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột 1: Thông tin đơn hàng & Hành trình vận chuyển */}
        <div className={`lg:col-span-6 space-y-6 ${mobileTab === 'shipping' ? 'block' : 'hidden lg:block'}`}>
          <OrderShippingCard order={order} spxResult={spxResult} />
        </div>

        {/* Cột 2: Hóa đơn điện tử chính thức */}
        {order && (
          <div className={`lg:col-span-6 space-y-6 ${mobileTab === 'invoice' ? 'block' : 'hidden lg:block'}`}>
            <OrderInvoiceCard order={order} />
          </div>
        )}
      </div>
    </div>
  );
}
