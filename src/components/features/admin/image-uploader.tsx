'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon, Images } from 'lucide-react';
import { uploadProductImage } from '@/lib/image-utils';
import { MediaPickerModal } from '@/components/features/admin/media/media-picker-modal';
import { useFileDropzone } from '@/hooks/use-file-dropzone';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUploader({ label, value, onChange, placeholder }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      const publicUrl = await uploadProductImage(file);
      onChange(publicUrl);
    } catch {
      alert('Không thể tải ảnh lên Supabase Storage. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const { isDragging, dropzoneProps } = useFileDropzone({
    onFilesDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
    accept: ['image/*'],
    disabled: uploading,
    onError: (err) => alert(err),
  });

  return (
    <div className="space-y-2 text-xs">
      <label className="block font-semibold text-slate-700">{label}</label>
      <div
        {...dropzoneProps}
        className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all ${
          isDragging ? 'bg-blue-50/80 ring-2 ring-blue-500 ring-dashed' : ''
        }`}
      >
        {/* Thumbnail Preview */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative w-12 h-12 rounded-xl bg-slate-100 border overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-blue-500 ring-2 ring-blue-400/50 scale-105' : 'border-slate-200'
          }`}
          title="Bấm hoặc kéo thả ảnh vào đây"
        >
          {value ? (
            <Image src={value} alt="Preview" fill className="object-contain" sizes="48px" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* URL Input */}
        <div className="flex-1 relative">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Dán đường dẫn ảnh URL hoặc bấm tải lên...'}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900 text-xs"
          />
        </div>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-semibold border border-blue-200 flex-shrink-0 cursor-pointer"
          title="Chọn ảnh có sẵn từ Kho Ảnh thư viện"
        >
          <Images className="w-3.5 h-3.5 text-blue-600" />
          <span>Kho Ảnh</span>
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-black transition-colors font-semibold shadow-2xs disabled:opacity-50 flex-shrink-0 cursor-pointer"
          title="Tải ảnh từ máy tính (Tự động nén WebP & lưu Supabase)"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Nén WebP...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Tải Lên</span>
            </>
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-400">
        Tự động nén sang định dạng <strong>WebP</strong> chuẩn SEO trước khi tải lên Supabase Storage
      </p>

      {/* Modal Chọn Ảnh Có Sẵn */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(selectedUrl) => onChange(selectedUrl)}
      />
    </div>
  );
}
