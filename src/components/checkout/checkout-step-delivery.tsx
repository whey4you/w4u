'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Loader2, Weight, Clock, ShieldCheck, Truck, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { CarrierInfo } from '@/hooks/use-checkout-flow';
import { FormattedShippingRate } from '@/lib/allingo';

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
      <div className="rounded-2xl bg-neutral-50/70 p-5 border border-neutral-200/60 transition-all opacity-60">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 text-[11px] font-bold">
            2
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            2. Phương thức vận chuyển
          </h3>
        </div>
      </div>
    );
  }

  // Trạng thái đã hoàn thành (thu gọn, hiển thị hãng đã chọn)
  if (!isActive && isCompleted) {
    return (
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-neutral-200/90 transition-all flex items-center justify-between gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white text-[11px] font-bold">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              2. Phương thức vận chuyển
            </h3>
          </div>
          <div className="pl-7 flex items-center gap-2 text-xs text-neutral-600">
            {carrierInfo.logo && (
              <div className="w-8 h-5 rounded bg-neutral-100 p-0.5 inline-flex items-center justify-center flex-shrink-0">
                <Image src={carrierInfo.logo} alt={carrierInfo.carrierName} width={28} height={16} className="object-contain max-h-full max-w-full" />
              </div>
            )}
            <span>
              {carrierInfo.carrierName} ({carrierInfo.service || 'Tiêu chuẩn'}) ·{' '}
              <strong className="text-neutral-900">
                {shippingFee !== null ? formatPrice(shippingFee) : 'Chưa tính'}
              </strong>{' '}
              · {carrierInfo.expected || '1 - 3 ngày'} ({weightKgStr} kg)
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-black flex-shrink-0"
        >
          Chỉnh sửa
        </button>
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
        <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
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

          const renderRateCard = (rate: FormattedShippingRate) => {
            const isSelected = selectedRate?.id === rate.id;
            return (
              <div
                key={rate.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectRate?.(rate)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRate?.(rate); }}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50/90 ring-1 ring-neutral-900 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Radio Indicator */}
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  {/* Official Carrier Logo */}
                  {rate.logo && (
                    <div className="w-12 h-8 rounded-lg bg-neutral-100/90 border border-neutral-200/60 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={rate.logo}
                        alt={rate.carrierName}
                        width={44}
                        height={26}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        {rate.carrierName}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium">
                        ({rate.serviceName})
                      </span>
                      {rate.tag === 'cheapest' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          Tiết kiệm nhất
                        </span>
                      )}
                      {rate.tag === 'fastest' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                          Giao nhanh nhất
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{rate.expected}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-neutral-900 block">
                    {formatPrice(rate.totalFee)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal block">
                    Gộp vào thanh toán
                  </span>
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-4">
              {/* Nhóm 1: Hỏa tốc nội thành (Ưu tiên đầu tiên khi có) */}
              {instantRates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                        Giao Hỏa Tốc Nội Thành (1 - 2 Giờ)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                      Ưu tiên nhận ngay
                    </span>
                  </div>
                  <div className="space-y-2">
                    {instantRates.map(renderRateCard)}
                  </div>
                </div>
              )}

              {/* Nhóm 2: Tiêu chuẩn & Nhanh */}
              {standardRates.length > 0 && (
                <div className="space-y-2">
                  {instantRates.length > 0 && (
                    <div className="flex items-center gap-1.5 px-1 pt-1.5 border-t border-neutral-100">
                      <Truck className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Giao Tiêu Chuẩn & Nhanh (1 - 3 Ngày)
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {standardRates.map(renderRateCard)}
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
