'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Loader2, Weight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { CarrierInfo } from '@/hooks/use-checkout-flow';
import { FormattedShippingRate } from '@/lib/allingo';
import { CarrierRateCard } from './carrier-rate-card';

interface CheckoutStepDeliveryProps {
  isActive: boolean;
  isCompleted: boolean;
  shippingFee: number | null;
  loadingShipping?: boolean;
  carrierInfo?: CarrierInfo;
  availableRates?: FormattedShippingRate[];
  selectedRate?: FormattedShippingRate | null;
  onSelectRate?: (rate: FormattedShippingRate) => void;
  totalWeightGrams?: number;
  onNext: () => void;
  onEdit: () => void;
}

export function CheckoutStepDelivery({
  isActive,
  isCompleted,
  shippingFee,
  loadingShipping = false,
  carrierInfo = { carrierName: 'Giao hàng tiêu chuẩn', service: 'Tiêu chuẩn', expected: 'Dự kiến 1 - 3 ngày' },
  availableRates = [],
  selectedRate = null,
  onSelectRate,
  totalWeightGrams = 1000,
  onNext,
  onEdit,
}: CheckoutStepDeliveryProps) {
  const weightKgStr = (totalWeightGrams / 1000).toFixed(2).replace(/\.00$/, '');

  // Trạng thái thu gọn chưa đến lượt
  if (!isActive && !isCompleted) {
    return (
      <div className="rounded-2xl bg-neutral-50/70 p-4 sm:p-5 border border-neutral-200/60 transition-all opacity-60">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-[11px] font-bold">
            2
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-400">
            2. Phương thức vận chuyển
          </h3>
        </div>
      </div>
    );
  }

  // Trạng thái đã hoàn thành (thu gọn, hiển thị hãng đã chọn)
  if (!isActive && isCompleted) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-neutral-200/90 shadow-2xs transition-all">
        {/* Header row: Checkmark + Step Title (Left) & Chỉnh sửa (Right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
              2. Phương thức vận chuyển
            </h3>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-black shrink-0"
          >
            Chỉnh sửa
          </button>
        </div>

        {/* Content body row */}
        <div className="pt-2 pl-7 flex items-center gap-2.5 text-xs text-neutral-600">
          {carrierInfo.logo && (
            <div className="w-7 h-5 rounded bg-neutral-50 p-0.5 inline-flex items-center justify-center shrink-0 border border-neutral-200/80">
              <Image
                src={carrierInfo.logo}
                alt={carrierInfo.carrierName}
                width={26}
                height={16}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap text-xs min-w-0">
            <span className="font-bold text-neutral-900">{carrierInfo.carrierName}</span>
            <span className="text-neutral-300">·</span>
            <span className="font-bold text-neutral-900">
              {shippingFee !== null ? (shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)) : 'Chưa tính'}
            </span>
            {carrierInfo.expected && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500">{carrierInfo.expected}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái đang hoạt động (Hiển thị danh sách các hãng khả dụng)
  return (
    <div className={`rounded-2xl bg-white p-5 sm:p-7 border ${isActive ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-sm' : 'border-neutral-200'}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
            2
          </span>
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
            Phương thức vận chuyển
          </h2>
        </div>
        <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1 shrink-0">
          <Weight className="w-3.5 h-3.5" />
          <span>Kiện hàng: <strong>{weightKgStr} kg</strong></span>
        </span>
      </div>

      <p className="text-xs text-neutral-500 mb-3">
        {availableRates.length > 1
          ? 'Chọn đơn vị vận chuyển phù hợp với nhu cầu giao hàng của bạn:'
          : 'Đơn vị vận chuyển phụ trách giao hàng:'}
      </p>

      {loadingShipping ? (
        <div className="p-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-neutral-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
          <span>Đang tính cước vận chuyển giao hàng...</span>
        </div>
      ) : availableRates.length > 0 ? (
        (() => {
          const instantRates = availableRates.filter((r) => r.category === 'instant');
          const standardRates = availableRates.filter((r) => r.category !== 'instant');

          return (
            <div className="space-y-3.5">
              {/* Nhóm 1: Hỏa tốc nội thành (Ưu tiên đầu tiên khi có) */}
              {instantRates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">
                        Hỏa Tốc Nội Thành (1 - 2 Giờ)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                      Nhận ngay
                    </span>
                  </div>
                  <div className="space-y-2">
                    {instantRates.map((rate) => (
                      <CarrierRateCard
                        key={rate.id}
                        rate={rate}
                        isSelected={selectedRate?.id === rate.id}
                        onSelect={(r) => onSelectRate?.(r)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Nhóm 2: Tiêu chuẩn & Nhanh */}
              {standardRates.length > 0 && (
                <div className="space-y-2">
                  {instantRates.length > 0 && (
                    <div className="flex items-center gap-1.5 px-1 pt-2 border-t border-neutral-100">
                      <Truck className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Tiêu Chuẩn & Nhanh (1 - 3 Ngày)
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {standardRates.map((rate) => (
                      <CarrierRateCard
                        key={rate.id}
                        rate={rate}
                        isSelected={selectedRate?.id === rate.id}
                        onSelect={(r) => onSelectRate?.(r)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-500 text-center">
          Vui lòng nhập địa chỉ ở bước 1 để tải danh sách các hãng vận chuyển.
        </div>
      )}

      <div className="pt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0" />
        <span>Đồng kiểm tra hàng trước khi nhận · Bảo hiểm hàng hóa 100%</span>
      </div>

      {/* Integrated Action Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={loadingShipping || (!selectedRate && availableRates.length > 0)}
        className="w-full mt-5 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-sm transition-all active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingShipping ? 'Đang tính cước vận chuyển...' : 'Tiếp tục đến phương thức thanh toán'}
      </button>
    </div>
  );
}
