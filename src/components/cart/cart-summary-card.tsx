'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, RotateCcw, Truck, X, Loader2, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { applyCouponAction } from '@/app/actions/coupon.actions';

interface CartSummaryCardProps {
  totalAmount: number;
  totalItems: number;
}

export function CartSummaryCard({ totalAmount, totalItems }: CartSummaryCardProps) {
  const { appliedCoupon, applyCoupon, removeCoupon, discountAmount, finalTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setPromoMessage(null);

    try {
      const result = await applyCouponAction(code, totalAmount);
      if (result.valid && result.appliedCoupon) {
        applyCoupon(result.appliedCoupon);
        setPromoCode('');
        setPromoMessage({
          text: `Đã áp dụng mã ${result.appliedCoupon.code}! Giảm ${formatPrice(result.discountAmount || 0)}`,
          isError: false,
        });
      } else {
        setPromoMessage({
          text: result.error || 'Mã giảm giá không hợp lệ hoặc không áp dụng được.',
          isError: true,
        });
      }
    } catch {
      setPromoMessage({ text: 'Có lỗi xảy ra khi kiểm tra mã. Vui lòng thử lại.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const isBelowMinOrder = appliedCoupon && totalAmount < appliedCoupon.minOrderValue;

  return (
    <div className="rounded-2xl bg-white p-6 border border-neutral-200/90 shadow-xs space-y-6 sticky top-24">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
        Tóm tắt đơn hàng
      </h2>

      {/* Voucher Section */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
          Mã giảm giá / Voucher
        </label>

        {appliedCoupon ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-mono tracking-wider">{appliedCoupon.code}</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  {appliedCoupon.discountType === 'percent' ? `-${appliedCoupon.discountValue}%` : `-${formatPrice(appliedCoupon.discountValue)}`}
                </span>
              </div>
              {appliedCoupon.description && (
                <p className="text-[11px] text-emerald-700/90 mt-0.5 truncate">{appliedCoupon.description}</p>
              )}
              {isBelowMinOrder && (
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  Cần mua thêm {formatPrice(appliedCoupon.minOrderValue - totalAmount)} để nhận ưu đãi.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                removeCoupon();
                setPromoMessage(null);
              }}
              className="p-1 rounded-lg text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/80 transition-colors flex-shrink-0"
              title="Hủy mã ưu đãi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyPromo} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoMessage(null);
                  }}
                  placeholder="VD: WHEY4YOU, WHEY10"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 uppercase font-mono focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !promoCode.trim()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-neutral-900 text-white hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Áp dụng</span>
              </button>
            </div>
            {promoMessage && (
              <p className={`text-xs ${promoMessage.isError ? 'text-rose-600' : 'text-emerald-700 font-medium'}`}>
                {promoMessage.text}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-2.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
        <div className="flex justify-between">
          <span>Tiền hàng</span>
          <span className="font-semibold text-neutral-800">{formatPrice(totalAmount)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Giảm giá voucher ({appliedCoupon?.code})</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-900 block truncate">
              Tạm tính tổng
            </span>
            <span className="text-[11px] text-neutral-400 font-normal block">
              Chưa bao gồm cước vận chuyển
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight whitespace-nowrap block">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link href="/checkout" className="block w-full">
        <button
          type="button"
          disabled={totalItems === 0}
          className="w-full py-4 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <span>Tiến hành thanh toán</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </Link>

      {/* Trust guarantees */}
      <div className="pt-3 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-800 flex-shrink-0" />
          <span>Cam kết 100% chính hãng, có tem nhãn phụ</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-neutral-800 flex-shrink-0" />
          <span>Được đồng kiểm tra hàng cùng shipper trước khi nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-3.5 w-3.5 text-neutral-800 flex-shrink-0" />
          <span>Đổi trả sản phẩm linh hoạt trong vòng 7 ngày</span>
        </div>
      </div>
    </div>
  );
}
