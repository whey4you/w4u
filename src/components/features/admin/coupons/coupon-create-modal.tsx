'use client';

import React, { useState } from 'react';
import { X, Tag, Loader2, Plus } from 'lucide-react';
import { DiscountType, CreateCouponInput, CouponTier } from '@/types/coupon';
import { createCouponAction } from '@/app/actions/coupon.actions';
import { CouponTierEditor } from './coupon-tier-editor';
import { PriceInput } from '@/components/ui/price-input';

interface CouponCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CouponCreateModal({ isOpen, onClose, onSuccess }: CouponCreateModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isTiered, setIsTiered] = useState(false);
  const [tiers, setTiers] = useState<CouponTier[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(50000);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (isTiered) {
      if (tiers.length === 0) {
        setErrorMsg('Vui lòng thêm ít nhất 1 bậc giảm giá.');
        return;
      }
      for (let i = 0; i < tiers.length; i++) {
        if (!tiers[i].discount_value || tiers[i].discount_value <= 0) {
          setErrorMsg(`Bậc ${i + 1} phải có mức giảm lớn hơn 0.`);
          return;
        }
      }
    } else {
      if (discountValue <= 0) {
        setErrorMsg('Giá trị giảm giá phải lớn hơn 0.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);

    const firstTier = tiers[0];
    const input: CreateCouponInput = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      discount_type: isTiered && firstTier ? firstTier.discount_type : discountType,
      discount_value: isTiered && firstTier ? Number(firstTier.discount_value) : Number(discountValue),
      min_order_value: isTiered && firstTier ? Number(firstTier.min_order_value) || 0 : Number(minOrderValue) || 0,
      max_discount_amount: isTiered
        ? null
        : (maxDiscountAmount !== '' ? Number(maxDiscountAmount) : null),
      usage_limit: usageLimit !== '' ? Number(usageLimit) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
      tiers: isTiered ? tiers : [],
    };

    const result = await createCouponAction(input);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Không thể tạo mã giảm giá lúc này.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Tạo Mã Giảm Giá Mới</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mã giảm giá (Code) *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: GIAM50K, TET2026"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-slate-900"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mô tả hiển thị</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Giảm theo bậc đơn hàng"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
            />
          </div>

          {/* Cấu hình giảm giá: 1 Mức cố định HOẶC Đa bậc */}
          <div className="pt-1">
            <label className="font-bold text-slate-700 block mb-1.5">Hình thức giảm giá *</label>
            <div className="flex p-1 bg-slate-100 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setIsTiered(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isTiered ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1 Mức cố định
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTiered(true);
                  if (tiers.length === 0) {
                    setTiers([
                      {
                        id: `tier_${Date.now()}_1`,
                        min_order_value: 0,
                        max_order_value: 500000,
                        discount_type: 'fixed',
                        discount_value: 15000,
                        max_discount_amount: null,
                      },
                      {
                        id: `tier_${Date.now()}_2`,
                        min_order_value: 500001,
                        max_order_value: 1000000,
                        discount_type: 'fixed',
                        discount_value: 20000,
                        max_discount_amount: null,
                      },
                    ]);
                  }
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isTiered ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Theo bậc giá trị đơn
              </button>
            </div>

            {isTiered ? (
              <CouponTierEditor tiers={tiers} onChange={setTiers} />
            ) : (
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Loại giảm giá *</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-900"
                    >
                      <option value="fixed">Số tiền cố định (đ)</option>
                      <option value="percent">Phần trăm (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Giá trị giảm ({discountType === 'fixed' ? 'VNĐ' : '%'}) *
                    </label>
                    {discountType === 'fixed' ? (
                      <PriceInput
                        value={discountValue}
                        onChange={(raw) => setDiscountValue(Number(raw) || 0)}
                        placeholder="50,000"
                        hideWordsText
                        className="bg-white"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(Number(e.target.value))}
                          className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-900"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Đơn tối thiểu (VNĐ)</label>
                    <PriceInput
                      value={minOrderValue}
                      onChange={(raw) => setMinOrderValue(Number(raw) || 0)}
                      placeholder="0"
                      hideWordsText
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giảm tối đa (VNĐ)</label>
                    <PriceInput
                      value={maxDiscountAmount}
                      onChange={(raw) => setMaxDiscountAmount(raw === '' ? '' : Number(raw))}
                      disabled={discountType !== 'percent'}
                      placeholder={discountType === 'percent' ? 'Không giới hạn' : 'Chỉ áp dụng với %'}
                      hideWordsText
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giới hạn số lần dùng</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Không giới hạn"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hạn sử dụng</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0"
            />
            <label htmlFor="isActive" className="font-semibold text-slate-700 cursor-pointer">
              Kích hoạt mã ngay sau khi tạo
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Lưu mã</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
