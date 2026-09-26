'use client';

import React from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem } from '@/types/product';
import { PaymentMethod } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { CheckoutSummaryDetails } from './checkout-summary-details';

interface CheckoutMobileOrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
  shippingFee: number | null;
  loadingShipping?: boolean;
  paymentMethod: PaymentMethod;
  carrierName?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function CheckoutMobileOrderSummary({
  items,
  totalAmount,
  shippingFee,
  loadingShipping = false,
  paymentMethod,
  carrierName,
  isOpen,
  onToggle,
}: CheckoutMobileOrderSummaryProps) {
  const { discountAmount } = useCart();

  const isCod = paymentMethod === 'cod';
  const effectiveShipping = shippingFee ?? 0;
  const discountedSubtotal = Math.max(0, totalAmount - discountAmount);
  const grandTotal = discountedSubtotal + effectiveShipping;
  const depositAmount = isCod ? Math.min(100000, grandTotal) : grandTotal;
  const codRemaining = isCod ? Math.max(0, grandTotal - depositAmount) : 0;

  return (
    <div className="lg:hidden rounded-2xl bg-white p-4 sm:p-5 border border-neutral-200/90 shadow-2xs transition-all">
      {/* Header Row: Icon + Title on Left & Toggle Action on Right (Matches Steps 1 & 2 pattern) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold">
            <ShoppingBag className="h-2.5 w-2.5" />
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
            Đơn hàng của bạn ({items.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-black shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <span>{isOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Collapsed State: Tóm tắt số tiền (indented pl-7 like Step 1 and Step 2) */}
      {!isOpen && (
        <div className="pt-2 pl-7 flex items-center justify-between text-xs text-neutral-600 flex-wrap gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-neutral-500">
              {isCod ? 'Cọc đơn hàng:' : 'Tổng thanh toán:'}
            </span>
            <span className="font-bold text-neutral-900 text-sm tabular-nums">
              {formatPrice(depositAmount)}
            </span>
            {isCod && (
              <span className="text-neutral-500 text-[11px]">
                (COD: {formatPrice(codRemaining)})
              </span>
            )}
          </div>
          <span className="text-neutral-400 text-[11px] shrink-0">
            {shippingFee !== null ? (shippingFee === 0 ? 'Freeship' : `Ship ${formatPrice(shippingFee)}`) : 'Chưa tính ship'}
          </span>
        </div>
      )}

      {/* Expanded State: Full Details (Identical to Desktop Sidebar via CheckoutSummaryDetails) */}
      {isOpen && (
        <div className="pt-4 border-t border-neutral-100 mt-3 animate-in fade-in duration-200">
          <CheckoutSummaryDetails
            items={items}
            totalAmount={totalAmount}
            shippingFee={shippingFee}
            loadingShipping={loadingShipping}
            paymentMethod={paymentMethod}
            carrierName={carrierName}
          />
        </div>
      )}
    </div>
  );
}
