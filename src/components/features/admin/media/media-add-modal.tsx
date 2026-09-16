'use client';

import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2, PlusCircle, Check } from 'lucide-react';
import { uploadProductImage, sanitizeFileName } from '@/lib/image-utils';
import { MediaItem, AddMediaPayload } from '@/types/media';
import { MediaAddDropzone } from './media-add-dropzone';
import { MediaAddPreview } from './media-add-preview';

interface MediaAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newItem: MediaItem) => void;
}

export function MediaAddModal({ isOpen, onClose, onAdded }: MediaAddModalProps) {
  const [tab, setTab] = useState<'upload' | 'link'>('upload');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<MediaItem['category']>('custom');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setErrorMsg('');
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      setErrorMsg('');
      const uploadedUrl = await uploadProductImage(file);
      setUrl(uploadedUrl);
      if (!title.trim()) {
        const cleanName = sanitizeFileName(file.name).replace(/_/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tải ảnh lên kho lưu trữ.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Vui lòng tải ảnh lên hoặc nhập đường dẫn URL ảnh.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload: AddMediaPayload = {
        title: title.trim() || 'Ảnh thư viện',
        url: url.trim(),
        category,
      };

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi khi lưu ảnh vào thư viện');
      }

      onAdded(data.data);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Thêm Ảnh Vào Thư Viện</h3>
          </div>
          <button type="button" onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tải Ảnh Lên Từ Máy Tính
          </button>
          <button
            type="button"
            onClick={() => setTab('link')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'link' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Từ Đường Dẫn (URL)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'upload' ? (
            url ? (
              <MediaAddPreview url={url} onClear={() => setUrl('')} />
            ) : (
              <MediaAddDropzone
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                onError={(err) => setErrorMsg(err)}
              />
            )
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đường Dẫn Ảnh (URL) *</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/hinh-anh.webp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Form Fields khi đã có URL hoặc đang ở tab URL */}
          {(url || tab === 'link') && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Gợi Nhớ / Tiêu Đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Whey Gold Chuối 5Lbs, Banner Khuyến Mãi..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân Loại Ảnh</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MediaItem['category'])}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900"
                >
                  <option value="custom">Ảnh Tự Thêm (Chung)</option>
                  <option value="product">Sản Phẩm</option>
                  <option value="banner">Hero Banner</option>
                  <option value="blog">Bài Viết Blog</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !url.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? 'Đang Lưu...' : 'Lưu Vào Thư Viện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
