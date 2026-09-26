'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, Trash2, Power, Edit3 } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { formatPrice } from '@/lib/utils';
import { toggleCouponAction, deleteCouponAction } from '@/app/actions/coupon.actions';
import { CouponMobileCard } from './coupon-mobile-card';

interface CouponTableProps {
  coupons: Coupon[];
  onRefresh: () => void;
  onEdit?: (coupon: Coupon) => void;
}

export function CouponTable({ coupons, onRefresh, onEdit }: CouponTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    await toggleCouponAction(id, !currentStatus);
    setProcessingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`)) return;
    setProcessingId(id);
    await deleteCouponAction(id);
    setProcessingId(null);
    onRefresh();
  };

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center text-slate-500">
        <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">Chưa có mã giảm giá nào</p>
        <p className="text-xs text-slate-400 mt-1">Hãy nhấn &quot;Tạo mã mới&quot; để bắt đầu thiết lập chương trình ưu đãi.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List (hiển thị trên màn hình nhỏ < md) */}
      <div className="md:hidden space-y-3">
        {coupons.map((c) => (
          <CouponMobileCard
            key={c.id}
            coupon={c}
            isCopied={copiedId === c.id}
            isProcessing={processingId === c.id}
            onCopy={handleCopyCode}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Desktop Table (hiển thị từ tablet/desktop >= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã Code</th>
                <th className="py-3 px-4">Mức Giảm</th>
                <th className="py-3 px-4">Đơn Tối Thiểu</th>
                <th className="py-3 px-4">Lượt Dùng</th>
                <th className="py-3 px-4">Hạn Dùng</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {coupons.map((c) => {
              const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
              const isLimitReached = c.usage_limit !== null && c.usage_limit !== undefined && c.used_count >= c.usage_limit;

              return (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code, c.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded"
                        title="Sao chép mã"
                      >
                        {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {c.description && <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {c.discount_type === 'percent'
                      ? `-${c.discount_value}% ${c.max_discount_amount ? `(tối đa ${formatPrice(c.max_discount_amount)})` : ''}`
                      : `-${formatPrice(c.discount_value)}`}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {c.min_order_value > 0 ? formatPrice(c.min_order_value) : '0đ'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{c.used_count}</span>
                    <span className="text-slate-400 text-[11px]"> / {c.usage_limit ?? '∞'}</span>
                    {isLimitReached && <span className="block text-[10px] text-rose-500 font-semibold">Hết lượt</span>}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {c.expires_at ? (
                      <span className={isExpired ? 'text-rose-500 font-semibold' : ''}>
                        {new Date(c.expires_at).toLocaleDateString('vi-VN')}
                        {isExpired && ' (Hết hạn)'}
                      </span>
                    ) : (
                      <span className="text-slate-400">Vĩnh viễn</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active && !isExpired && !isLimitReached
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {c.is_active && !isExpired && !isLimitReached ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(c)}
                          className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Chỉnh sửa mã"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={processingId === c.id}
                        onClick={() => handleToggle(c.id, c.is_active)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          c.is_active
                            ? 'text-amber-700 border-amber-200 hover:bg-amber-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                        title={c.is_active ? 'Tạm dừng mã' : 'Kích hoạt mã'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={processingId === c.id}
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa mã"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>
);
}
