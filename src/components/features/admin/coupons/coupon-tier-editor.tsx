'use client';

import React from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { CouponTier, DiscountType } from '@/types/coupon';

interface CouponTierEditorProps {
  tiers: CouponTier[];
  onChange: (tiers: CouponTier[]) => void;
}

export function CouponTierEditor({ tiers, onChange }: CouponTierEditorProps) {
  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier && lastTier.max_order_value ? Number(lastTier.max_order_value) : (lastTier ? Number(lastTier.min_order_value) + 500000 : 0);
    const newTier: CouponTier = {
      id: `tier_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      min_order_value: newMin,
      max_order_value: null,
      discount_type: 'fixed',
      discount_value: 20000,
      max_discount_amount: null,
    };
    onChange([...tiers, newTier]);
  };

  const handleUpdateTier = (index: number, updates: Partial<CouponTier>) => {
    const updated = tiers.map((tier, idx) => (idx === index ? { ...tier, ...updates } : tier));
    onChange(updated);
  };

  const handleRemoveTier = (index: number) => {
    onChange(tiers.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Danh sách các bậc giảm giá ({tiers.length} bậc)</span>
        </div>
        <button
          type="button"
          onClick={handleAddTier}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Thêm bậc</span>
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 bg-slate-50/50">
          <p className="text-xs">Chưa có bậc nào. Nhấn &quot;Thêm bậc&quot; để thiết lập mức giảm theo khoảng giá trị đơn.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tiers.map((tier, index) => (
            <div
              key={tier.id || index}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 text-[11px]">
                <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Bậc {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTier(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  title="Xoá bậc này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hàng 1: Khoảng đơn hàng */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Đơn từ (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={tier.min_order_value}
                    onChange={(e) => handleUpdateTier(index, { min_order_value: Number(e.target.value) })}
                    placeholder="VD: 0 hoặc 500000"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Đến dưới (VNĐ) <span className="text-slate-400 font-normal">(bỏ trống = vô hạn)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={tier.max_order_value ?? ''}
                    onChange={(e) =>
                      handleUpdateTier(index, {
                        max_order_value: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Không giới hạn"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Hàng 2: Mức giảm */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Loại giảm
                  </label>
                  <select
                    value={tier.discount_type}
                    onChange={(e) =>
                      handleUpdateTier(index, { discount_type: e.target.value as DiscountType })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-800"
                  >
                    <option value="fixed">Tiền mặt (đ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Mức giảm ({tier.discount_type === 'fixed' ? 'đ' : '%'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tier.discount_value}
                    onChange={(e) => handleUpdateTier(index, { discount_value: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                    Tối đa (nếu là %)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    disabled={tier.discount_type !== 'percent'}
                    value={tier.max_discount_amount ?? ''}
                    onChange={(e) =>
                      handleUpdateTier(index, {
                        max_discount_amount: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Không giới hạn"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
