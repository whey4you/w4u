'use client';

import React from 'react';
import Image from 'next/image';
import { HeroBannerItem } from '@/config/hero-banners';
import { ChevronUp, ChevronDown, Edit2, Trash2, ExternalLink, Video } from 'lucide-react';

interface AdminBannerListProps {
  banners: HeroBannerItem[];
  onEdit: (banner: HeroBannerItem) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function AdminBannerList({
  banners,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: AdminBannerListProps) {
  if (banners.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
        <p className="text-slate-500 text-sm">Chưa có banner nào. Hãy bấm &quot;Thêm Banner Mới&quot; để tạo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {banners.map((item, index) => {
        const isVideo = item.media_type === 'video';

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
          >
            {/* Thứ tự & nút di chuyển */}
            <div className="flex items-center gap-1 sm:flex-col justify-center">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMoveUp(index)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors"
                title="Di chuyển lên"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-500 w-5 text-center">#{index + 1}</span>
              <button
                type="button"
                disabled={index === banners.length - 1}
                onClick={() => onMoveDown(index)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 hover:bg-slate-100 transition-colors"
                title="Di chuyển xuống"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail media */}
            <div className="relative w-36 sm:w-48 h-20 sm:h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0">
              {isVideo ? (
                item.video_url ? (
                  <>
                    <video
                      src={item.video_url}
                      poster={item.image || undefined}
                      muted
                      playsInline
                      preload="metadata"
                      suppressHydrationWarning
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-indigo-600/95 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                      <Video className="w-2.5 h-2.5" />
                      <span>VIDEO</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    <Video className="w-6 h-6" />
                  </div>
                )
              ) : (
                item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Chưa có ảnh
                  </div>
                )
              )}
            </div>

          {/* Thông tin Banner */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-mono mt-1 bg-blue-50/60 px-2.5 py-1 rounded-md max-w-fit border border-blue-100/50">
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{item.href}</span>
            </div>
          </div>

          {/* Thao tác */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      );
    })}
    </div>
  );
}
