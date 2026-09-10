import React, { useState } from 'react';
import { SPXTrackingRecord } from '@/types/spx';
import { ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SPXTimelineProps {
  records: SPXTrackingRecord[];
}

function formatUnixTime(timestamp: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp * 1000);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${time} • ${date}`;
}

export function SPXTimeline({ records }: SPXTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRecords = expanded ? records : records.slice(0, 4);
  const hasMore = records.length > 4;

  if (!records || records.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        Chưa có lịch sử cập nhật hành trình
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {displayRecords.map((item, idx) => {
          const isLatest = idx === 0;
          const location = item.current_location?.location_name || item.current_location?.full_address;
          return (
            <div key={`${item.tracking_code}-${item.actual_time}-${idx}`} className="relative group">
              {/* Dot icon */}
              <div
                className={cn(
                  'absolute -left-6 top-1 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center',
                  isLatest
                    ? 'bg-apple-blue border-white ring-4 ring-blue-100'
                    : 'bg-white border-slate-300'
                )}
              >
                {isLatest && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isLatest ? 'text-apple-blue' : 'text-slate-800'
                    )}
                  >
                    {item.buyer_description || item.description || item.tracking_name}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-apple-blue border border-blue-100">
                      Mới nhất
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatUnixTime(item.actual_time)}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3 h-3 text-apple-blue flex-shrink-0" />
                      <span className="truncate max-w-[280px]">{location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 px-4 text-xs font-medium text-apple-blue hover:text-apple-blue-hover bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
        >
          {expanded ? (
            <>
              Thu gọn hành trình <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Xem toàn bộ {records.length} mốc hành trình <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
