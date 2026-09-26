'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { FormattedShippingRate } from '@/lib/allingo';

interface CarrierRateCardProps {
  rate: FormattedShippingRate;
  isSelected: boolean;
  onSelect: (rate: FormattedShippingRate) => void;
}

export function CarrierRateCard({ rate, isSelected, onSelect }: CarrierRateCardProps) {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(rate)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(rate);
        }
      }}
      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 sm:gap-3.5 ${
        isSelected
          ? 'border-neutral-900 bg-neutral-50/90 ring-1 ring-neutral-900 shadow-xs'
          : 'border-neutral-200 hover:border-neutral-300 bg-white'
      }`}
    >
      {/* Radio Indicator (căn ngay ngắn ngang hàng với tên hãng) */}
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      {/* Official Carrier Logo / Fallback */}
      <div className="w-9 h-6 sm:w-11 sm:h-7 rounded-md bg-neutral-100/90 border border-neutral-200/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
        {rate.logo ? (
          <Image
            src={rate.logo}
            alt={rate.carrierName}
            width={40}
            height={24}
            className="object-contain max-h-full max-w-full"
          />
        ) : (
          <Truck className="w-3.5 h-3.5 text-neutral-500" />
        )}
      </div>

      {/* Cấu trúc thông tin 3 tầng rõ ràng, đầy đủ không bị cắt cụt chữ */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Hàng 1: Tên hãng + Tag nổi bật & Giá cước */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {rate.carrierName}
            </span>
            {rate.tag === 'cheapest' && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                Tiết kiệm nhất
              </span>
            )}
            {rate.tag === 'fastest' && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                Giao nhanh nhất
              </span>
            )}
          </div>

          <span className="text-xs sm:text-sm font-bold text-neutral-900 shrink-0 text-right">
            {formatPrice(rate.totalFee)}
          </span>
        </div>

        {/* Hàng 2: Gói dịch vụ chi tiết (hiển thị đầy đủ, không bị cắt dấu ...) */}
        {rate.serviceName && (
          <div className="text-[11px] text-neutral-600 leading-tight">
            <span className="text-neutral-500">Dịch vụ: </span>
            <span className="font-medium text-neutral-800">{rate.serviceName}</span>
          </div>
        )}

        {/* Hàng 3: Thời gian giao hàng dự kiến */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 leading-tight pt-0.5">
          <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
          <span>{rate.expected}</span>
        </div>
      </div>
    </div>
  );
}
