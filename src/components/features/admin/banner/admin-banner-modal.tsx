'use client';

import React, { useState, useEffect } from 'react';
import { HeroBannerItem } from '@/config/hero-banners';
import { Product } from '@/types/product';
import { X, Check, ImageIcon, UploadCloud, Globe, Video } from 'lucide-react';
import { AdminBannerUploader } from './admin-banner-uploader';
import { AdminBannerVideoUploader } from './admin-banner-video-uploader';
import { AdminBannerMediaPreview } from './admin-banner-media-preview';
import { AdminBannerLinkSelector } from './admin-banner-link-selector';

interface AdminBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: HeroBannerItem | null;
  onSave: (banner: HeroBannerItem) => void;
  products: Product[];
}

export function AdminBannerModal({ isOpen, onClose, banner, onSave, products }: AdminBannerModalProps) {
  const [formData, setFormData] = useState<HeroBannerItem>({
    id: '',
    title: '',
    image: '',
    media_type: 'image',
    video_url: '',
    href: '',
  });
  const [mediaSourceMode, setMediaSourceMode] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        media_type: banner.media_type || (banner.video_url ? 'video' : 'image'),
        video_url: banner.video_url || '',
      });
      const currentMediaUrl = banner.media_type === 'video' ? banner.video_url : banner.image;
      setMediaSourceMode(currentMediaUrl && !currentMediaUrl.includes('supabase.co/storage') ? 'url' : 'upload');
    } else {
      setFormData({
        id: `banner-${Date.now()}`,
        title: '',
        image: '',
        media_type: 'image',
        video_url: '',
        href: '/products',
      });
      setMediaSourceMode('upload');
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const isVideo = formData.media_type === 'video';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.href.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và liên kết điều hướng');
      return;
    }
    if (isVideo && !formData.video_url?.trim()) {
      alert('Vui lòng tải lên hoặc dán link file video cho banner');
      return;
    }
    if (!isVideo && !formData.image?.trim()) {
      alert('Vui lòng tải lên hoặc dán link hình ảnh cho banner');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {isVideo ? <Video className="w-5 h-5 text-indigo-600" /> : <ImageIcon className="w-5 h-5 text-blue-600" />}
            {banner ? 'Chỉnh Sửa Banner Hero' : 'Thêm Banner Hero Mới'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Lựa chọn định dạng: Hình Ảnh hoặc Video */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Loại Phương Tiện Banner *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, media_type: 'image' }))}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  !isVideo
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Hình Ảnh (Image)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, media_type: 'video' }))}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isVideo
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Clip (MP4/WebM)</span>
              </button>
            </div>
          </div>

          {/* Preview Media (Ảnh hoặc Video) */}
          <AdminBannerMediaPreview
            mediaType={formData.media_type || 'image'}
            imageUrl={formData.image}
            videoUrl={formData.video_url}
          />

          {/* Nguồn Media: Upload vs URL */}
          <div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200">
              <button
                type="button"
                onClick={() => setMediaSourceMode('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mediaSourceMode === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Lên Supabase</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaSourceMode('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mediaSourceMode === 'url' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Dán Đường Link Trực Tiếp</span>
              </button>
            </div>

            {isVideo ? (
              mediaSourceMode === 'upload' ? (
                <AdminBannerVideoUploader
                  currentVideoUrl={formData.video_url || ''}
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
                  onRemoveVideo={() => setFormData((prev) => ({ ...prev, video_url: '' }))}
                />
              ) : (
                <input
                  type="text"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="Dán link video: https://.../video.mp4 hoặc .webm"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-indigo-500 text-xs font-mono"
                />
              )
            ) : (
              mediaSourceMode === 'upload' ? (
                <AdminBannerUploader
                  currentImageUrl={formData.image}
                  onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  onRemoveImage={() => setFormData((prev) => ({ ...prev, image: '' }))}
                />
              ) : (
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Dán link ảnh: https://... hoặc /banners/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-blue-500 text-xs font-mono"
                />
              )
            )}
          </div>

          {/* Nếu là Video, thêm tùy chọn nhập Ảnh Poster / Thumbnail dự phòng */}
          {isVideo && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ảnh Poster / Thumbnail Dự Phòng (Tùy chọn)
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Link ảnh đại diện hiển thị trước khi video load: https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-indigo-500 text-xs font-mono"
              />
            </div>
          )}

          {/* Tiêu đề Banner */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu Đề / Mô Tả Banner *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Whey Isolate Siêu Hấp Thu..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-blue-500 text-xs"
            />
          </div>

          {/* Link điều hướng */}
          <AdminBannerLinkSelector
            value={formData.href}
            onChange={(href) => setFormData((prev) => ({ ...prev, href }))}
            products={products}
          />

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Lưu Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
