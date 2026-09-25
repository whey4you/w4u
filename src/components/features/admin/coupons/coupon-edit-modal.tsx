'use client';

import React, { useState, useEffect } from 'react';
import { X, Tag, Loader2, Save } from 'lucide-react';
import { Coupon, DiscountType, CreateCouponInput } from '@/types/coupon';
import { updateCouponAction } from '@/app/actions/coupon.actions';

interface CouponEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSuccess: () => void;
}

export function CouponEditModal({ isOpen, onClose, coupon, onSuccess }: CouponEditModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || '');
      setDescription(coupon.description || '');
      setDiscountType(coupon.discount_type || 'fixed');
      setDiscountValue(Number(coupon.discount_value || 0));
      setMinOrderValue(Number(coupon.min_order_value || 0));
      setMaxDiscountAmount(coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined ? Number(coupon.max_discount_amount) : '');
      setUsageLimit(coupon.usage_limit !== null && coupon.usage_limit !== undefined ? Number(coupon.usage_limit) : '');
      setIsActive(coupon.is_active ?? true);
      setErrorMsg(null);

      if (coupon.expires_at) {
        const dateObj = new Date(coupon.expires_at);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        setExpiresAt(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      } else {
        setExpiresAt('');
      }
    }
  }, [coupon]);

  if (!isOpen || !coupon) return null;

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

    const input: Partial<CreateCouponInput> = {
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

    const result = await updateCouponAction(coupon.id, input);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Không thể cập nhật mã giảm giá lúc này.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Chỉnh Sửa Mã Giảm Giá ({coupon.code})</h2>
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
              id="isActiveEdit"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0"
            />
            <label htmlFor="isActiveEdit" className="font-semibold text-slate-700 cursor-pointer">
              Đang hoạt động (Kích hoạt cho khách nhập)
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
