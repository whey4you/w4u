'use client';

import React from 'react';
import Image from 'next/image';
import { Truck, Clock, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { FormattedShippingRate } from '@/lib/allingo';
import { formatPrice } from '@/lib/utils';

interface OrderCarrierSelectorProps {
  rates: FormattedShippingRate[];
  selectedRateId?: string;
  loading?: boolean;
  hasAddress?: boolean;
  onSelectRate: (rate: FormattedShippingRate) => void;
}

export function OrderCarrierSelector({
  rates,
  selectedRateId,
  loading = false,
  hasAddress = false,
  onSelectRate,
}: OrderCarrierSelectorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-700 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
        <span>Đang tra cứu giá cước các đơn vị vận chuyển từ AllinGo...</span>
      </div>
    );
  }

  if (!hasAddress) {
    return (
      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 italic text-center">
        Vui lòng chọn Tỉnh/Thành và Quận/Huyện để xem danh sách đơn vị vận chuyển khả dụng.
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Không tìm thấy đơn vị vận chuyển phù hợp cho địa chỉ này hoặc hệ thống cước đang cập nhật.</span>
      </div>
    );
  }

  const instantRates = rates.filter((r) => r.category === 'instant');
  const standardRates = rates.filter((r) => r.category !== 'instant');

  const renderRateItem = (rate: FormattedShippingRate) => {
    const isSelected = selectedRateId === rate.id;
    return (
      <div
        key={rate.id}
        role="button"
        tabIndex={0}
        onClick={() => onSelectRate(rate)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelectRate(rate);
        }}
        className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
          isSelected
            ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 shadow-xs'
            : 'border-slate-200 hover:border-slate-300 bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Radio circle */}
          <div
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${
              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
            }`}
          >
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>

          {/* Logo hãng */}
          {rate.logo ? (
            <div className="w-10 h-7 rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={rate.logo}
                alt={rate.carrierName}
                width={36}
                height={22}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs">{rate.carrierName}</span>
              <span className="text-[11px] text-slate-500 font-medium">({rate.serviceName})</span>
              {rate.tag === 'cheapest' && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                  Tiết kiệm nhất
                </span>
              )}
              {rate.tag === 'fastest' && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  Nhanh nhất
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{rate.expected}</span>
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs font-bold text-blue-700 block">{formatPrice(rate.totalFee)}</span>
          <span className="text-[9px] text-slate-400 block">Khách trả shipper</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Đơn Vị Vận Chuyển ({rates.length} hãng khả dụng)</span>
        </label>
        <span className="text-[10px] text-slate-400">Click để chọn hãng mong muốn</span>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
        {instantRates.length > 0 && (
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase">
              <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
              <span>Giao Hỏa Tốc (1 - 2 Giờ)</span>
            </div>
            {instantRates.map(renderRateItem)}
          </div>
        )}

        {standardRates.length > 0 && (
          <div className="space-y-1">
            {instantRates.length > 0 && (
              <div className="text-[10px] font-bold text-slate-600 uppercase pt-1">Giao Tiêu Chuẩn & Nhanh</div>
            )}
            {standardRates.map(renderRateItem)}
          </div>
        )}
      </div>
    </div>
  );
}
