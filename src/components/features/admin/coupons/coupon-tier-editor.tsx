'use client';

import React from 'react';
import { Plus, Trash2, Layers, Link as LinkIcon } from 'lucide-react';
import { CouponTier, DiscountType } from '@/types/coupon';
import { PriceInput, formatWithCommas } from '@/components/ui/price-input';

interface CouponTierEditorProps {
  tiers: CouponTier[];
  onChange: (tiers: CouponTier[]) => void;
}

export function CouponTierEditor({ tiers, onChange }: CouponTierEditorProps) {
  const handleAddTier = () => {
    const updated = [...tiers];
    const lastIndex = updated.length - 1;
    let newMin = 0;

    if (lastIndex >= 0) {
      const lastTier = { ...updated[lastIndex] };
      if (!lastTier.max_order_value || Number(lastTier.max_order_value) <= Number(lastTier.min_order_value || 0)) {
        // Tự động gán mốc tới cho bậc liền trước nếu chưa có
        const prevMin = Number(lastTier.min_order_value || 0);
        lastTier.max_order_value = prevMin > 0 ? prevMin + 500000 : 500000;
        updated[lastIndex] = lastTier;
      }
      newMin = Number(updated[lastIndex].max_order_value) + 1;
    }

    const newTier: CouponTier = {
      id: `tier_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      min_order_value: newMin,
      max_order_value: null,
      discount_type: 'fixed',
      discount_value: 20000,
      max_discount_amount: null,
    };

    onChange([...updated, newTier]);
  };

  const handleUpdateTier = (index: number, updates: Partial<CouponTier>) => {
    const updated = tiers.map((tier, idx) => (idx === index ? { ...tier, ...updates } : { ...tier }));

    // Tự động cập nhật mốc 'từ' của bậc kế tiếp = (mốc 'tới' của bậc hiện tại + 1)
    if (updates.max_order_value !== undefined) {
      for (let i = 0; i < updated.length - 1; i++) {
        const curMax = updated[i].max_order_value;
        if (curMax !== null && curMax !== undefined && Number(curMax) > 0) {
          updated[i + 1].min_order_value = Number(curMax) + 1;
        }
      }
    }

    onChange(updated);
  };

  const handleRemoveTier = (index: number) => {
    const filtered = tiers.filter((_, idx) => idx !== index);
    for (let i = 0; i < filtered.length - 1; i++) {
      const curMax = filtered[i].max_order_value;
      if (curMax !== null && curMax !== undefined && Number(curMax) > 0) {
        filtered[i + 1].min_order_value = Number(curMax) + 1;
      }
    }
    onChange(filtered);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Thiết lập các bậc giảm giá ({tiers.length} bậc)</span>
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
          <p className="text-xs">Chưa có bậc nào. Nhấn &quot;Thêm bậc&quot; để tạo khoảng giảm giá theo giá trị đơn.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, index) => {
            const isAutoLinked = index > 0;
            return (
              <div
                key={tier.id || index}
                className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2.5 relative shadow-2xs"
              >
                {/* Header bậc */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      Bậc {index + 1}
                    </span>
                    {isAutoLinked && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                        <LinkIcon className="w-2.5 h-2.5" />
                        Tự nối tiếp Bậc {index} (+1đ)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(index)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Xoá bậc này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hàng 1: Khoảng đơn hàng (Từ - Đến) có dấu phẩy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Đơn từ (VNĐ) *
                    </label>
                    <PriceInput
                      value={tier.min_order_value}
                      onChange={(raw) => handleUpdateTier(index, { min_order_value: Number(raw) || 0 })}
                      placeholder="0"
                      hideWordsText
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Đến mức (VNĐ) <span className="text-slate-400 font-normal">(để trống = vô hạn)</span>
                    </label>
                    <PriceInput
                      value={tier.max_order_value ?? ''}
                      onChange={(raw) =>
                        handleUpdateTier(index, {
                          max_order_value: raw === '' ? null : Number(raw),
                        })
                      }
                      placeholder="Không giới hạn"
                      hideWordsText
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Hàng 2: Mức giảm gọn gàng trên điện thoại */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-2 text-xs pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Hình thức
                    </label>
                    <select
                      value={tier.discount_type}
                      onChange={(e) =>
                        handleUpdateTier(index, { discount_type: e.target.value as DiscountType })
                      }
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-800"
                    >
                      <option value="fixed">Tiền mặt (đ)</option>
                      <option value="percent">Phần trăm (%)</option>
                    </select>
                  </div>
                  <div className={tier.discount_type === 'percent' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Mức giảm ({tier.discount_type === 'fixed' ? 'VNĐ' : '%'}) *
                    </label>
                    {tier.discount_type === 'fixed' ? (
                      <PriceInput
                        value={tier.discount_value}
                        onChange={(raw) => handleUpdateTier(index, { discount_value: Number(raw) || 0 })}
                        placeholder="VD: 15,000"
                        hideWordsText
                        className="bg-white font-bold text-emerald-700"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={tier.discount_value}
                          onChange={(e) => handleUpdateTier(index, { discount_value: Number(e.target.value) })}
                          placeholder="VD: 10"
                          className="w-full px-2.5 py-2 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:border-slate-800"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          %
                        </span>
                      </div>
                    )}
                  </div>
                  {tier.discount_type === 'percent' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">
                        Giảm tối đa (VNĐ)
                      </label>
                      <PriceInput
                        value={tier.max_discount_amount ?? ''}
                        onChange={(raw) =>
                          handleUpdateTier(index, {
                            max_discount_amount: raw === '' ? null : Number(raw),
                          })
                        }
                        placeholder="Không giới hạn"
                        hideWordsText
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
