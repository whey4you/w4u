'use client';

import React from 'react';
import { CartItem } from '@/types/product';
import { PaymentMethod } from '@/types/checkout';
import { CheckoutSummaryDetails } from './checkout-summary-details';

interface CheckoutSummarySidebarProps {
  items: CartItem[];
  totalAmount: number;
  shippingFee: number | null;
  loadingShipping?: boolean;
  paymentMethod: PaymentMethod;
  carrierName?: string;
}

export function CheckoutSummarySidebar({
  items,
  totalAmount,
  shippingFee,
  loadingShipping = false,
  paymentMethod,
  carrierName,
}: CheckoutSummarySidebarProps) {
  return (
    <aside className="rounded-2xl bg-neutral-50/70 p-4 sm:p-6 border border-neutral-200/80 space-y-4 sm:space-y-5 sticky top-24">
      <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
          Đơn hàng của bạn ({items.length})
        </h3>
      </div>

      <CheckoutSummaryDetails
        items={items}
        totalAmount={totalAmount}
        shippingFee={shippingFee}
        loadingShipping={loadingShipping}
        paymentMethod={paymentMethod}
        carrierName={carrierName}
      />
    </aside>
  );
}
