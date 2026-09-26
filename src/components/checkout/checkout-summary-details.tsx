'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Truck, Tag, X, Loader2 } from 'lucide-react';
import { CartItem } from '@/types/product';
import { PaymentMethod } from '@/types/checkout';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { applyCouponAction } from '@/app/actions/coupon.actions';

export interface CheckoutSummaryDetailsProps {
  items: CartItem[];
  totalAmount: number;
  shippingFee: number | null;
  loadingShipping?: boolean;
  paymentMethod: PaymentMethod;
  carrierName?: string;
}

export function CheckoutSummaryDetails({
  items,
  totalAmount,
  shippingFee,
  loadingShipping = false,
  paymentMethod,
}: CheckoutSummaryDetailsProps) {
  const { appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const isCod = paymentMethod === 'cod';
  const effectiveShipping = shippingFee ?? 0;
  const discountedSubtotal = Math.max(0, totalAmount - discountAmount);
  const grandTotal = discountedSubtotal + effectiveShipping;
  const depositAmount = isCod ? Math.min(100000, grandTotal) : grandTotal;
  const codRemaining = isCod ? Math.max(0, grandTotal - depositAmount) : 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setLoadingCoupon(true);
    setCouponError(null);

    try {
      const res = await applyCouponAction(code, totalAmount);
      if (res.valid && res.appliedCoupon) {
        applyCoupon(res.appliedCoupon);
        setCouponInput('');
      } else {
        setCouponError(res.error || 'Mã không hợp lệ.');
      }
    } catch {
      setCouponError('Lỗi kiểm tra mã giảm giá.');
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mini Item List */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-200/40">
        {items.map((item) => (
          <div key={`${item.productId}-${item.flavor.id}-${item.size?.id || 'default'}`} className="pt-3 first:pt-0 flex gap-3 items-center">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-white border border-neutral-200/80 p-1">
              <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-contain" />
              <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-semibold text-neutral-900 truncate">{item.productName}</p>
              <p className="text-neutral-500 text-[11px] truncate">
                {item.flavor.name}{item.size ? ` · ${item.size.name}` : ''}
              </p>
              <p className="font-bold text-neutral-900 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2.5 text-xs text-neutral-600 pt-3 border-t border-neutral-200/60">
        {/* Voucher input or applied voucher */}
        <div className="pb-1.5">
          {appliedCoupon ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold truncate">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-mono">{appliedCoupon.code}</span>
                  <span className="text-[10px] text-emerald-700">(-{formatPrice(discountAmount)})</span>
                </div>
                <button type="button" onClick={removeCoupon} className="text-emerald-600 hover:text-emerald-900 p-0.5 rounded transition-colors" title="Hủy voucher">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {appliedCoupon.nextTier && (
                <p className="text-[10px] text-emerald-800/90 pt-1 border-t border-emerald-200/50">
                  💡 Mua thêm {formatPrice(appliedCoupon.nextTier.amountNeeded)} để được giảm{' '}
                  {appliedCoupon.nextTier.discountType === 'percent'
                    ? `${appliedCoupon.nextTier.discountValue}%`
                    : formatPrice(appliedCoupon.nextTier.discountValue)}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError(null);
                  }}
                  placeholder="Nhập mã giảm giá..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 font-mono uppercase focus:outline-none focus:border-neutral-900 bg-white"
                />
                <button
                  type="submit"
                  disabled={loadingCoupon || !couponInput.trim()}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {loadingCoupon && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Áp dụng</span>
                </button>
              </div>
              {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
            </form>
          )}
        </div>
        <div className="flex justify-between">
          <span>Tạm tính tiền hàng</span>
          <span className="font-semibold text-neutral-900">{formatPrice(totalAmount)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Giảm giá voucher ({appliedCoupon?.code})</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <span>Phí vận chuyển</span>
            <span className="block text-[10px] text-neutral-400">
              {isCod ? 'Gộp vào tiền COD' : 'Gộp vào thanh toán VietQR'}
            </span>
          </div>
          {loadingShipping ? (
            <span className="text-neutral-500 font-medium italic">Đang tính...</span>
          ) : shippingFee !== null ? (
            <span className="font-semibold text-neutral-900">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
          ) : (
            <span className="text-neutral-400 italic">Vui lòng nhập địa chỉ</span>
          )}
        </div>

        <div className="flex justify-between text-neutral-900 font-semibold pt-1 border-t border-dashed border-neutral-200/80">
          <span>Tổng đơn hàng</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>

        {isCod && (
          <>
            <div className="flex justify-between text-neutral-800 font-medium">
              <span>Cọc trước VietQR</span>
              <span className="font-bold">{formatPrice(depositAmount)}</span>
            </div>
            <div className="flex justify-between text-neutral-800 font-medium">
              <div>
                <span>Shipper thu khi nhận (COD)</span>
                <span className="block text-[10px] text-neutral-400 font-normal">Đã bao gồm phí ship</span>
              </div>
              <span className="font-bold text-amber-700">{formatPrice(codRemaining)}</span>
            </div>
          </>
        )}

        <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm">
          <div>
            <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs block">
              {isCod ? 'Cọc đơn hàng' : 'Tổng thanh toán'}
            </span>
            <span className="text-[10px] text-neutral-400 font-normal">
              {isCod ? 'Xác nhận đơn qua VietQR' : 'Thanh toán 100% qua VietQR (gồm ship)'}
            </span>
          </div>
          <span className="text-2xl font-black text-neutral-900 tracking-tight">{formatPrice(depositAmount)}</span>
        </div>
      </div>

      {/* Trust guarantees */}
      <div className="pt-3 border-t border-neutral-200/60 space-y-1.5 text-[11px] text-neutral-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-800 flex-shrink-0" />
          <span>Cam kết 100% chính hãng, có tem nhãn phụ</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-neutral-800 flex-shrink-0" />
          <span>Được đồng kiểm tra hàng trước khi nhận</span>
        </div>
      </div>
    </div>
  );
}
