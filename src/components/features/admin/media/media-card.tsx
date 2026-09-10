'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check, Eye, Trash2, Tag } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaCardProps {
  item: MediaItem;
  onPreview: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  onSelect?: (url: string) => void;
  isSelecting?: boolean;
}

const CATEGORY_BADGES: Record<MediaItem['category'], { label: string; className: string }> = {
  custom: { label: 'Tự Thêm', className: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
  product: { label: 'Sản Phẩm', className: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  banner: { label: 'Banner', className: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  blog: { label: 'Blog', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
};

export function MediaCard({ item, onPreview, onDelete, onSelect, isSelecting }: MediaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback nếu không hỗ trợ clipboard API
      const input = document.createElement('input');
      input.value = item.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badge = CATEGORY_BADGES[item.category] || CATEGORY_BADGES.custom;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Khung Ảnh */}
      <div
        onClick={() => onPreview(item)}
        className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center border border-slate-100"
      >
        <Image
          src={item.url}
          alt={item.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge Danh mục */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.className} backdrop-blur-xs bg-white/90`}>
            <Tag className="w-2.5 h-2.5" />
            {badge.label}
          </span>
        </div>

        {/* Nút Xem Phóng To */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(item);
            }}
            title="Xem kích thước lớn"
            className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thông tin & Thao tác */}
      <div className="mt-2.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 line-clamp-1" title={item.title}>
            {item.title}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={item.source}>
            {item.source}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
          {isSelecting && onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(item.url)}
              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Chọn Ảnh Này
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="font-semibold">Đã Chép Link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép Link</span>
                </>
              )}
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              title="Xóa ảnh này (gỡ khỏi kho và xóa tệp lưu trữ)"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
