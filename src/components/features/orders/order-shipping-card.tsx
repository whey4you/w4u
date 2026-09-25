'use client';

import React from 'react';
import { User, Phone, MapPin, Truck, ExternalLink, PackageCheck, Clock } from 'lucide-react';
import { Order } from '@/services/order.service';
import { SPXTrackingResult } from '@/types/spx';
import { SPXStepper } from './spx-stepper';
import { SPXTimeline } from './spx-timeline';

interface OrderShippingCardProps {
  order?: Order | null;
  spxResult?: SPXTrackingResult | null;
}

export function OrderShippingCard({ order, spxResult }: OrderShippingCardProps) {
  const trackingCode = order?.tracking_code || spxResult?.tracking_number;
  const carrierName = order?.carrier_name || (spxResult ? 'SPX Express' : 'Đơn vị vận chuyển');
  const allingoTrackId = order?.allingo_track_id;
  const directTrackUrl = order?.tracking_url || (allingoTrackId ? `https://business.allingo.vn/track/${allingoTrackId}#/track/${allingoTrackId}` : null);

  const getStatusBadge = () => {
    if (order?.status === 'completed' || spxResult?.status_category === 'delivered') {
      return { label: 'Giao hàng thành công', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (order?.status === 'shipping' || spxResult?.status_category === 'in_transit') {
      return { label: 'Đang vận chuyển', color: 'bg-blue-50 text-apple-blue border-blue-200' };
    }
    if (order?.status === 'processing' || spxResult?.status_category === 'preparing') {
      return { label: 'Đang chuẩn bị hàng', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Đã tiếp nhận đơn', color: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-black/[0.06] space-y-6">
      {/* Header trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hành trình giao hàng</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            {order ? `Đơn hàng ${order.order_code}` : `Vận đơn ${trackingCode}`}
          </h2>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Thông tin người nhận */}
      {order && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 p-4 rounded-2xl bg-slate-50 border border-slate-100/80">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-apple-blue shrink-0" />
            <span className="truncate">Người nhận: <strong className="text-slate-900">{order.customer_name}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-apple-blue shrink-0" />
            <span>SĐT: <strong className="text-slate-900">{order.customer_phone}</strong></span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-apple-blue shrink-0" />
            <span className="truncate">Địa chỉ: <strong className="text-slate-900">{order.customer_address}</strong></span>
          </div>
        </div>
      )}

      {/* Thông tin đơn vị vận chuyển & Mã vận đơn */}
      {trackingCode && (
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-apple-blue shadow-2xs border border-blue-100/60">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{carrierName}</span>
              <p className="text-[11px] text-slate-500 font-mono">Mã vận đơn: {trackingCode}</p>
            </div>
          </div>
          {directTrackUrl && (
            <a
              href={directTrackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-apple-blue text-white font-medium text-[11px] hover:bg-apple-blue-hover transition-colors shadow-2xs shrink-0"
            >
              <span>Chi tiết bưu tá</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Stepper tiến trình vận chuyển */}
      <div className="pt-1">
        <SPXStepper
          statusCategory={spxResult?.status_category || (order?.status === 'completed' ? 'delivered' : order?.status === 'shipping' ? 'in_transit' : 'preparing')}
          milestoneCode={spxResult?.latest_record?.milestone_code || (order?.status === 'completed' ? 8 : order?.status === 'shipping' ? 5 : 1)}
        />
      </div>

      {/* Timeline chi tiết các bưu cục */}
      {spxResult && spxResult.records.length > 0 ? (
        <div className="pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-apple-blue" />
            Lộ trình cập nhật thời gian thực
          </h3>
          <SPXTimeline records={spxResult.records} />
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 space-y-1">
          <PackageCheck className="w-5 h-5 mx-auto text-apple-blue" />
          <p className="font-semibold text-slate-700">Đơn hàng đang trong quy trình xử lý tại kho Whey4You</p>
          <p className="text-[11px] text-slate-400">
            Hành trình chi tiết của bưu cục sẽ tự động cập nhật ngay khi shipper tiếp nhận bưu phẩm.
          </p>
        </div>
      )}
    </div>
  );
}
