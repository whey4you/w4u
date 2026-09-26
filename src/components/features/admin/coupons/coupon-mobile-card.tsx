'use client';

import React from 'react';
import { Copy, Check, Trash2, Power, Edit3 } from 'lucide-react';
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
  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
  const isLimitReached =
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    coupon.used_count >= coupon.usage_limit;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      {/* Top row: Code & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {coupon.code}
          </span>
          <button
            type="button"
            onClick={() => onCopy(coupon.code, coupon.id)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sao chép mã"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            coupon.is_active && !isExpired && !isLimitReached
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {coupon.is_active && !isExpired && !isLimitReached ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      </div>

      {coupon.description && (
        <p className="text-xs text-slate-500">{coupon.description}</p>
      )}

      {/* Middle row: Discount & Limit Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Mức giảm</span>
          <span className="font-bold text-emerald-700">
            {coupon.discount_type === 'percent'
              ? `-${coupon.discount_value}% ${coupon.max_discount_amount ? `(tối đa ${formatPrice(coupon.max_discount_amount)})` : ''}`
              : `-${formatPrice(coupon.discount_value)}`}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Đơn tối thiểu</span>
          <span className="font-semibold text-slate-700">
            {coupon.min_order_value > 0 ? formatPrice(coupon.min_order_value) : '0đ'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Lượt đã dùng</span>
          <span className="font-semibold text-slate-800">
            {coupon.used_count} / {coupon.usage_limit ?? '∞'}
          </span>
          {isLimitReached && (
            <span className="text-[10px] text-rose-500 font-semibold ml-1">(Hết lượt)</span>
          )}
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Hạn dùng</span>
          <span className={`text-[11px] ${isExpired ? 'text-rose-500 font-semibold' : 'text-slate-600'}`}>
            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
            {isExpired && ' (Hết hạn)'}
          </span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(coupon)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
        )}

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onToggle(coupon.id, coupon.is_active)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            coupon.is_active
              ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{coupon.is_active ? 'Tạm dừng' : 'Kích hoạt'}</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onDelete(coupon.id, coupon.code)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}
