import React from 'react';
import { formatPrice } from '@/lib/utils';
import { Loader2, Truck, Weight } from 'lucide-react';

interface CheckoutOrderSummaryProps {
  subtotal: number;
  totalWeightGrams: number;
  shippingFee: number | null;
  loadingShipping: boolean;
  carrierName?: string;
  paymentMethod: 'payos' | 'cod';
  depositAmount: number;
  remainingCod: number;
}

export function CheckoutOrderSummary({
  subtotal,
  totalWeightGrams,
  shippingFee,
  loadingShipping,
  carrierName = 'Vận chuyển tiêu chuẩn',
  paymentMethod,
  depositAmount,
  remainingCod,
}: CheckoutOrderSummaryProps) {
  const isCod = paymentMethod === 'cod';
  const effectiveShipping = shippingFee ?? 0;
  const grandTotal = subtotal + effectiveShipping;
  const weightKgStr = (totalWeightGrams / 1000).toFixed(2).replace(/\.00$/, '');

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-xs text-slate-600">
      <div className="flex justify-between items-center text-slate-700">
        <span>Tạm tính tiền hàng:</span>
        <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
      </div>

      <div className="flex justify-between items-center text-slate-500">
        <span className="flex items-center gap-1.5">
          <Weight className="w-3.5 h-3.5 text-slate-400" />
          <span>Khối lượng kiện hàng:</span>
        </span>
        <span className="font-medium text-slate-700">{weightKgStr} kg ({totalWeightGrams.toLocaleString()}g)</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Truck className="w-3.5 h-3.5 text-orange-600" />
            <span>Phí giao hàng ({carrierName}):</span>
          </span>
          <span className="text-[10px] text-slate-400 block pl-5 font-normal">
            ({isCod ? 'Gộp vào tiền COD' : 'Gộp vào thanh toán VietQR'})
          </span>
        </div>
        {loadingShipping ? (
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Đang tính cước...</span>
          </span>
        ) : shippingFee !== null ? (
          <span className="font-semibold text-slate-900">{formatPrice(shippingFee)}</span>
        ) : (
          <span className="text-slate-400 italic">Chọn địa chỉ để tính</span>
        )}
      </div>

      <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-slate-950">
        <div>
          <span>{isCod ? 'Cọc đơn hàng:' : 'Tổng thanh toán:'}</span>
          <span className="text-[10px] text-slate-400 font-normal block">
            {isCod ? 'Xác nhận đơn qua VietQR' : 'Thanh toán 100% qua VietQR (gồm ship)'}
          </span>
        </div>
        <span className="text-base text-apple-blue font-bold">
          {formatPrice(isCod ? depositAmount : grandTotal)}
        </span>
      </div>

      {isCod && (
        <div className="pt-1.5 border-t border-dashed border-slate-200 space-y-1 text-[11px]">
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Cọc trước qua VietQR:</span>
            <span>{formatPrice(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-amber-700 font-semibold">
            <span>Shipper thu khi nhận (COD):</span>
            <span className="font-bold">
              {formatPrice(remainingCod)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
