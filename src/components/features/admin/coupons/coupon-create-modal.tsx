'use client';

import React, { useState } from 'react';
import { X, Tag, Loader2, Plus } from 'lucide-react';
import { DiscountType, CreateCouponInput } from '@/types/coupon';
import { createCouponAction } from '@/app/actions/coupon.actions';

interface CouponCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CouponCreateModal({ isOpen, onClose, onSuccess }: CouponCreateModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
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
    if (discountValue <= 0) {
      setErrorMsg('Giá trị giảm giá phải lớn hơn 0.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const input: CreateCouponInput = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_value: Number(minOrderValue) || 0,
      max_discount_amount: maxDiscountAmount !== '' ? Number(maxDiscountAmount) : null,
      usage_limit: usageLimit !== '' ? Number(usageLimit) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Tạo Mã Giảm Giá Mới</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
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
              placeholder="VD: Giảm 50k cho đơn từ 500k"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
            />
          </div>

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
              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Đơn tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="10000"
                disabled={discountType !== 'percent'}
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={discountType === 'percent' ? 'Không giới hạn' : 'Chỉ áp dụng với %'}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giới hạn số lần dùng</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Không giới hạn"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hạn sử dụng</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
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
