'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import { MediaItem } from '@/types/media';

interface MediaPreviewModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onDelete?: (item: MediaItem) => void;
}

export function MediaPreviewModal({ item, onClose, onDelete }: MediaPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(item);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.source}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative w-full aspect-video sm:aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
          <Image
            src={item.url}
            alt={item.title}
            fill
            unoptimized
            className="object-contain p-4"
          />
        </div>

        {/* URL Box & Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono truncate select-all">
            {item.url}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã Chép Link' : 'Sao Chép Link'}</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Mở tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-all cursor-pointer"
                title="Xóa ảnh này khỏi thư viện và gỡ tệp lưu trữ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
