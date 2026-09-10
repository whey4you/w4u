'use client';

import React, { useState, useRef } from 'react';
import { X, Link as LinkIcon, Upload, Loader2, PlusCircle } from 'lucide-react';
import { uploadProductImage } from '@/lib/image-utils';
import { MediaItem, AddMediaPayload } from '@/types/media';

interface MediaAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newItem: MediaItem) => void;
}

export function MediaAddModal({ isOpen, onClose, onAdded }: MediaAddModalProps) {
  const [tab, setTab] = useState<'link' | 'upload'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<MediaItem['category']>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setErrorMsg('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn URL ảnh.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload: AddMediaPayload = {
        title: title.trim() || 'Ảnh liên kết',
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
        throw new Error(data.error || 'Lỗi khi lưu ảnh');
      }

      onAdded(data.data);
      handleClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối tới máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const uploadedUrl = await uploadProductImage(file);
      setUrl(uploadedUrl);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setTab('link'); // Chuyển về tab link để xem trước và xác nhận lưu
    } catch {
      setErrorMsg('Không thể tải ảnh lên Supabase Storage. Vui lòng kiểm tra lại!');
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Thêm Ảnh Vào Thư Viện</h3>
          </div>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('link')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'link' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Từ Đường Dẫn (URL)
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tải Ảnh Lên Máy Tính
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {errorMsg}
          </div>
        )}

        {tab === 'upload' ? (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Tải ảnh lên Supabase Storage</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Tự động nén WebP chuẩn nét cao và lưu link tái sử dụng</p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{isSubmitting ? 'Đang Xử Lý Nén...' : 'Chọn File Ảnh'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">Phân Loại</label>
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

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Lưu Vào Kho Ảnh</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
