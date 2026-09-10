'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface BlogImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string, caption: string) => void;
}

export function BlogImageModal({ isOpen, onClose, onInsert }: BlogImageModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    onInsert(imageUrl.trim(), caption.trim());
    setImageUrl('');
    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Chèn Hình Ảnh Minh Họa</h3>
              <p className="text-xs text-slate-500">Dán liên kết ảnh và chú thích vào bài viết</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Đường Dẫn Hình Ảnh (URL)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... hoặc /blogs/whey-timing.jpg"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              autoFocus
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Chú Thích Hình Ảnh (Caption)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ví dụ: Hình 1: Biểu đồ hấp thu protein và cơ chế kích hoạt mTOR..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Live Preview */}
          {imageUrl.trim() && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Xem trước:</span>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-44 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!imageUrl.trim()}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Chèn Vào Bài Viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
