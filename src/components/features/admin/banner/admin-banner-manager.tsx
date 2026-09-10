'use client';

import React, { useState } from 'react';
import { HeroBannerItem } from '@/config/hero-banners';
import { Product } from '@/types/product';
import { AdminBannerList } from './admin-banner-list';
import { AdminBannerModal } from './admin-banner-modal';
import { Plus, Save, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

interface AdminBannerManagerProps {
  initialBanners: HeroBannerItem[];
  products: Product[];
}

export function AdminBannerManager({ initialBanners, products }: AdminBannerManagerProps) {
  const [banners, setBanners] = useState<HeroBannerItem[]>(initialBanners);
  const [editingBanner, setEditingBanner] = useState<HeroBannerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: HeroBannerItem) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (savedItem: HeroBannerItem) => {
    const exists = banners.some((b) => b.id === savedItem.id);
    const updated = exists
      ? banners.map((b) => (b.id === savedItem.id ? savedItem : b))
      : [...banners, savedItem];

    setBanners(updated);
    setIsModalOpen(false);

    // Tự động lưu trực tiếp vào Supabase
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: updated }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu banner thất bại');
      }
      setHasChanges(false);
      showNotification('success', exists ? 'Đã cập nhật banner thành công!' : 'Đã thêm banner mới thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu banner';
      showNotification('error', msg);
      setHasChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này vĩnh viễn khỏi hệ thống?')) return;
    
    const previousBanners = [...banners];
    const newBanners = banners.filter((b) => b.id !== id);
    setBanners(newBanners);

    try {
      const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Xóa banner thất bại');
      }
      showNotification('success', 'Đã xóa banner vĩnh viễn khỏi hệ thống thành công.');
      setHasChanges(false);
    } catch (err: unknown) {
      // Hoàn tác lại danh sách nếu xảy ra lỗi
      setBanners(previousBanners);
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa banner';
      showNotification('error', msg);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index - 1];
    newBanners[index - 1] = temp;
    setBanners(newBanners);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index + 1];
    newBanners[index + 1] = temp;
    setBanners(newBanners);
    setHasChanges(true);
  };

  const handleSaveAllToSystem = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lưu banner thất bại');
      }
      setHasChanges(false);
      showNotification('success', 'Đã lưu cấu hình banner thành công! Trang chủ đã được cập nhật.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      showNotification('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Danh Sách Banner Trang Chủ</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: {banners.length} banner đang được cấu hình
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Banner Mới</span>
          </button>

          <button
            type="button"
            disabled={!hasChanges || isSaving}
            onClick={handleSaveAllToSystem}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-xs"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{hasChanges ? 'Lưu Thay Đổi' : 'Đã Đồng Bộ'}</span>
          </button>
        </div>
      </div>

      {/* Danh sách các Banner */}
      <AdminBannerList
        banners={banners}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />

      {/* Modal chỉnh sửa */}
      <AdminBannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
        products={products}
      />
    </div>
  );
}
