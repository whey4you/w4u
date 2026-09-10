'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import { MediaItem, MediaCategory } from '@/types/media';
import { MediaCard } from './media-card';
import { MediaFilterBar } from './media-filter-bar';
import { MediaPreviewModal } from './media-preview-modal';
import { MediaAddModal } from './media-add-modal';

interface MediaManagerProps {
  initialItems: MediaItem[];
}

export function MediaManager({ initialItems }: MediaManagerProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [category, setCategory] = useState<MediaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Tính số lượng cho từng tab bộ lọc
  const counts = useMemo(() => {
    const res: Record<MediaCategory, number> = {
      all: items.length,
      custom: 0,
      product: 0,
      banner: 0,
      blog: 0,
    };
    items.forEach((it) => {
      if (res[it.category] !== undefined) {
        res[it.category]++;
      }
    });
    return res;
  }, [items]);

  // Lọc và tìm kiếm
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = category === 'all' || item.category === category;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, category, searchQuery]);

  // Xử lý thêm ảnh mới
  const handleAdded = (newItem: MediaItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Xử lý xóa ảnh (gỡ khỏi thư viện & xóa tệp storage nếu có)
  const handleDelete = async (target: MediaItem) => {
    const isStorage = target.url.includes('supabase.co/storage/v1/object/public/');
    const confirmMsg = isStorage
      ? `Bạn có chắc muốn xóa ảnh "${target.title}"? Thao tác này sẽ gỡ ảnh khỏi thư viện và xóa vĩnh viễn tệp lưu trữ trên Supabase Storage.`
      : `Bạn có chắc muốn xóa ảnh "${target.title}" khỏi thư viện dùng chung không?`;

    if (!confirm(confirmMsg)) return;

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('id', target.id);
      if (target.url) queryParams.set('url', target.url);

      const res = await fetch(`/api/admin/media?${queryParams.toString()}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Không thể xóa ảnh');
        return;
      }
      setItems((prev) => prev.filter((it) => it.id !== target.id && it.url !== target.url));
      if (previewItem?.id === target.id) {
        setPreviewItem(null);
      }
    } catch {
      alert('Lỗi kết nối khi xóa ảnh');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Callout & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold">Kho Ảnh Dùng Chung (Tái Sử Dụng Link)</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Tự động gom toàn bộ ảnh sản phẩm, banner, blog và ảnh lưu từ URL. Bấm &quot;Sao Chép Link&quot; để dán vào bất cứ form nào mà không cần tải lên lại.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ảnh Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <MediaFilterBar
        currentCategory={category}
        onSelectCategory={setCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* Grid Danh Sách Ảnh */}
      {filteredItems.length === 0 ? (
        <div className="py-20 rounded-2xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">Không tìm thấy ảnh nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để xem ảnh có sẵn trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onPreview={setPreviewItem}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Xem Phóng To */}
      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDelete={handleDelete}
      />

      {/* Modal Thêm Ảnh */}
      <MediaAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
