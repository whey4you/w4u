'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MediaItem, MediaCategory } from '@/types/media';
import { MediaCard } from './media-card';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MediaCategory>('all');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    fetch('/api/admin/media')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setItems(data.data);
        }
      })
      .catch((err) => console.error('Lỗi tải media picker:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = category === 'all' || item.category === category;
      const matchQuery =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.url.toLowerCase().includes(search.toLowerCase()) ||
        item.source.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [items, category, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Chọn Ảnh Có Sẵn Từ Kho</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            {(['all', 'custom', 'product', 'banner', 'blog'] as MediaCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  category === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm ảnh..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-xs">Đang tải kho ảnh...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Không tìm thấy ảnh nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isSelecting
                  onSelect={(url) => {
                    onSelect(url);
                    onClose();
                  }}
                  onPreview={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
