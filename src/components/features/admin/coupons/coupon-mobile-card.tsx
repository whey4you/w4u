'use client';

import React, { useState } from 'react';
import { Copy, Check, Trash2, Power, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { formatPrice } from '@/lib/utils';

interface CouponMobileCardProps {
  coupon: Coupon;
  isCopied: boolean;
  isProcessing: boolean;
  onCopy: (code: string, id: string) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, code: string) => void;
  onEdit?: (coupon: Coupon) => void;
}

export function CouponMobileCard({
  coupon,
  isCopied,
  isProcessing,
  onCopy,
  onToggle,
  onDelete,
  onEdit,
}: CouponMobileCardProps) {
  const [showTiers, setShowTiers] = useState(false);

  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
  const isLimitReached =
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    coupon.used_count >= coupon.usage_limit;

  const hasTiers = Boolean(coupon.tiers && coupon.tiers.length > 0);
  const tiers = coupon.tiers || [];

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
      {/* Top row: Code + Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {coupon.code}
          </span>
          <button
            type="button"
            onClick={() => onCopy(coupon.code, coupon.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
            title="Sao chép mã"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
            coupon.is_active && !isExpired && !isLimitReached
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {coupon.is_active && !isExpired && !isLimitReached ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      </div>

      {coupon.description && (
        <p className="text-[11px] text-slate-500 line-clamp-1">{coupon.description}</p>
      )}

      {/* Middle row: Tier summary or single discount */}
      <div className="pt-2 border-t border-slate-100 text-xs">
        {hasTiers ? (
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Đa bậc ({tiers.length} bậc)
              </span>
              <button
                type="button"
                onClick={() => setShowTiers(!showTiers)}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span>{showTiers ? 'Thu gọn' : 'Xem các bậc'}</span>
                {showTiers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Chi tiết từng bậc khi mở rộng */}
            {showTiers ? (
              <div className="space-y-1 pt-1 border-t border-slate-200/60">
                {tiers.map((t, idx) => (
                  <div key={t.id || idx} className="text-[10px] text-slate-600 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-700">B{idx + 1}:</strong>{' '}
                      {t.max_order_value
                        ? `${formatPrice(t.min_order_value)} - ${formatPrice(t.max_order_value)}`
                        : `Từ ${formatPrice(t.min_order_value)}`}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {t.discount_type === 'percent'
                        ? `-${t.discount_value}%`
                        : `-${formatPrice(t.discount_value)}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-600 flex items-center justify-between">
                <span>Đơn từ {formatPrice(Math.min(...tiers.map((t) => Number(t.min_order_value || 0))))}</span>
                <span className="font-bold text-emerald-700">
                  {tiers[0]?.discount_type === 'percent' ? `-${tiers[0].discount_value}%` : `-${formatPrice(tiers[0]?.discount_value || 0)}`}
                  {' ~ '}
                  {tiers[tiers.length - 1]?.discount_type === 'percent'
                    ? `-${tiers[tiers.length - 1].discount_value}%`
                    : `-${formatPrice(tiers[tiers.length - 1]?.discount_value || 0)}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs bg-slate-50/80 rounded-xl px-2.5 py-2 border border-slate-200/60">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Đơn tối thiểu</span>
              <span className="font-semibold text-slate-700 text-[11px]">
                {coupon.min_order_value > 0 ? formatPrice(coupon.min_order_value) : '0đ'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">Mức giảm</span>
              <span className="font-bold text-emerald-700 text-xs">
                {coupon.discount_type === 'percent'
                  ? `-${coupon.discount_value}% ${coupon.max_discount_amount ? `(tối đa ${formatPrice(coupon.max_discount_amount)})` : ''}`
                  : `-${formatPrice(coupon.discount_value)}`}
              </span>
            </div>
          </div>
        )}

        {/* Thông tin phụ: Đã dùng & Hạn dùng */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 px-0.5">
          <span>
            Đã dùng: <strong className="text-slate-800">{coupon.used_count}</strong>/{coupon.usage_limit ?? '∞'}
            {isLimitReached && <span className="text-rose-500 font-bold ml-1">(Hết)</span>}
          </span>
          <span className={isExpired ? 'text-rose-500 font-bold' : ''}>
            Hạn: {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
            {isExpired && ' (Hết)'}
          </span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(coupon)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 text-[11px] font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Sửa</span>
          </button>
        )}

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onToggle(coupon.id, coupon.is_active)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
            coupon.is_active
              ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <Power className="w-3 h-3" />
          <span>{coupon.is_active ? 'Tắt' : 'Bật'}</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onDelete(coupon.id, coupon.code)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 text-[11px] font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}
