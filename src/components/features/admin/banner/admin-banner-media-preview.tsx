'use client';

import React from 'react';
import Image from 'next/image';
import { Video, ImageIcon } from 'lucide-react';

interface AdminBannerMediaPreviewProps {
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
}

export function AdminBannerMediaPreview({
  mediaType,
  imageUrl,
  videoUrl,
}: AdminBannerMediaPreviewProps) {
  const isVideo = mediaType === 'video';
  const hasVideo = isVideo && !!videoUrl?.trim();
  const hasImage = !!imageUrl?.trim();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          {isVideo ? <Video className="w-3.5 h-3.5 text-indigo-600" /> : <ImageIcon className="w-3.5 h-3.5 text-blue-600" />}
          <span>Khung Xem Trước {isVideo ? 'Video' : 'Ảnh'} (Tỷ lệ 3:1)</span>
        </label>
        {(hasVideo || hasImage) && (
          <span className="text-[10px] text-emerald-600 font-medium">
            {isVideo ? (hasVideo ? 'Đã kết nối video hợp lệ' : 'Đang chờ video') : 'Đã kết nối ảnh hợp lệ'}
          </span>
        )}
      </div>

      <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center group">
        {isVideo ? (
          hasVideo ? (
            <>
              <video
                key={videoUrl}
                src={videoUrl}
                poster={imageUrl || undefined}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                suppressHydrationWarning
                onPlay={(e) => {
                  e.currentTarget.playbackRate = 1.5;
                }}
                onLoadedMetadata={(e) => {
                  e.currentTarget.playbackRate = 1.5;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <Video className="w-3 h-3" />
                <span>VIDEO BANNER (AUTOPLAY)</span>
              </div>
            </>
          ) : (
            <div className="text-center p-4 text-slate-400 text-xs flex flex-col items-center gap-1">
              <Video className="w-6 h-6 text-slate-600 mb-1" />
              <span>Chưa có video. Hãy tải file video lên hoặc dán link video MP4/WebM bên dưới.</span>
            </div>
          )
        ) : (
          hasImage ? (
            <Image src={imageUrl} alt="Banner Preview" fill sizes="500px" className="object-cover" />
          ) : (
            <div className="text-center p-4 text-slate-400 text-xs flex flex-col items-center gap-1">
              <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
              <span>Chưa có ảnh. Hãy tải ảnh lên hoặc dán link ảnh bên dưới.</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
