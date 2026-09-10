import React, { useState } from 'react';
import { SPXTrackingResult } from '@/types/spx';
import { SPXStepper } from './spx-stepper';
import { SPXTimeline } from './spx-timeline';
import { Copy, Check, Calendar, Truck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SPXTrackingViewProps {
  result: SPXTrackingResult;
}

export function SPXTrackingView({ result }: SPXTrackingViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result.tracking_number) {
      navigator.clipboard.writeText(result.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (result.status_category) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_transit':
        return 'bg-blue-50 text-apple-blue border-blue-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'returned':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatEdd = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!result.success) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-amber-900">Không tìm thấy thông tin vận đơn</h4>
        <p className="text-xs text-amber-700 max-w-md mx-auto">
          {result.error_message || 'Mã vận đơn không tồn tại hoặc chưa được đồng bộ từ SPX Express.'}
        </p>
      </div>
    );
  }

  const latest = result.latest_record;
  const isLastMile = latest?.milestone_code === 5 && latest?.tracking_code === 'F599';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-apple-blue" />
              SPX Express
            </span>
            <span className={cn('text-[11px] font-semibold px-2.5 py-0.5 rounded-full border', getStatusBadge())}>
              {result.status_label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{result.tracking_number}</h3>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-apple-blue hover:bg-white transition-colors"
              title="Sao chép mã"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {result.sls_tn && (
            <p className="text-[11px] text-slate-400">Mã SLS Shopee: {result.sls_tn}</p>
          )}
        </div>

        {/* Estimated delivery date */}
        {result.edd_info?.edd_max && (
          <div className="sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-100">
            <div className="flex sm:justify-end items-center gap-1 text-[11px] font-medium text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-apple-blue" />
              <span>Dự kiến giao hàng</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 capitalize mt-0.5">
              {formatEdd(result.edd_info.edd_max)}
            </p>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      <SPXStepper
        statusCategory={result.status_category}
        milestoneCode={latest?.milestone_code}
        isLastMile={isLastMile}
      />

      {/* Timeline Section */}
      <div className="pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Chi tiết hành trình bưu cục
        </h4>
        <SPXTimeline records={result.records} />
      </div>
    </div>
  );
}
