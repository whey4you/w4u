'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Trash2, CheckCircle, Info } from 'lucide-react';
import { uploadBannerImage, deleteBannerImage, OPTIMAL_BANNER_SPEC } from '@/lib/banner-storage';
import { useFileDropzone } from '@/hooks/use-file-dropzone';

interface AdminBannerUploaderProps {
  currentImageUrl: string;
  onUploadSuccess: (url: string) => void;
  onRemoveImage?: () => void;
}

export function AdminBannerUploader({
  currentImageUrl,
  onUploadSuccess,
  onRemoveImage,
}: AdminBannerUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSupabaseImage = currentImageUrl?.includes('supabase.co/storage/v1/object/public/');

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Đang nén WebP & tối ưu chuẩn 1920x640px...');

    try {
      setUploadStatus('Đang tải lên Supabase Storage...');
      const publicUrl = await uploadBannerImage(file);
      onUploadSuccess(publicUrl);
      setUploadStatus('Tải lên thành công!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh thất bại';
      alert(msg);
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const { isDragging, dropzoneProps } = useFileDropzone({
    onFilesDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
    accept: ['image/*'],
    maxSizeMB: 10,
    disabled: isUploading,
    onError: (err) => alert(err),
  });

  const handleDeleteFromStorage = async () => {
    if (!isSupabaseImage) return;
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn tệp ảnh này khỏi Supabase Storage?')) return;

    const ok = await deleteBannerImage(currentImageUrl);
    if (ok) {
      alert('Đã xóa tệp ảnh khỏi Supabase Storage');
      if (onRemoveImage) onRemoveImage();
    } else {
      alert('Không thể xóa tệp hoặc tệp đã bị xóa trước đó');
    }
  };

  return (
    <div className="space-y-2">
      {/* Box hướng dẫn kích thước tối ưu */}
      <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-blue-950">
            Kích thước tối ưu khuyến nghị: {OPTIMAL_BANNER_SPEC.width} × {OPTIMAL_BANNER_SPEC.height} px (Tỷ lệ 3:1)
          </p>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Hệ thống sẽ <strong>tự động resize và nén sang chuẩn WebP siêu nhẹ</strong> trước khi upload lên Supabase Storage để trang chủ tải nhanh nhất.
          </p>
        </div>
      </div>

      {/* Vùng Dropzone & Upload Button */}
      <div
        {...dropzoneProps}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isUploading
            ? 'border-blue-400 bg-blue-50/40 pointer-events-none'
            : isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs font-medium text-blue-700">{uploadStatus}</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6 text-slate-500 hover:text-blue-600 transition-colors" />
            <p className="text-xs font-medium text-slate-700">
              Nhấn để chọn ảnh từ máy tính hoặc kéo thả vào đây
            </p>
            <p className="text-[11px] text-slate-400">
              Hỗ trợ PNG, JPG, JPEG, WebP (Tối đa 10MB)
            </p>
          </>
        )}
      </div>

      {/* Trạng thái ảnh Supabase hiện tại */}
      {isSupabaseImage && (
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Ảnh đang lưu trên Supabase Storage
          </span>
          <button
            type="button"
            onClick={handleDeleteFromStorage}
            className="text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 font-semibold text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa khỏi Supabase
          </button>
        </div>
      )}
    </div>
  );
}
