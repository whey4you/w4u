'use client';

import React, { useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useFileDropzone } from '@/hooks/use-file-dropzone';

interface MediaAddDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  onError?: (err: string) => void;
}

export function MediaAddDropzone({ onFileSelect, isUploading, onError }: MediaAddDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragging, dropzoneProps } = useFileDropzone({
    onFilesDrop: (files) => {
      if (files[0]) onFileSelect(files[0]);
    },
    accept: ['image/*'],
    disabled: isUploading,
    onError: (err) => onError?.(err),
  });

  return (
    <div
      {...dropzoneProps}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`py-8 px-4 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
          : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-slate-100/70'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />
      <Upload
        className={`w-10 h-10 mb-3 transition-all ${
          isDragging ? 'text-blue-600 scale-110' : 'text-slate-400'
        }`}
      />
      <p className="text-sm font-semibold text-slate-700">
        {isDragging ? 'Thả ảnh vào đây để tải lên' : 'Bấm hoặc kéo thả ảnh vào đây'}
      </p>
      <p className="text-xs text-slate-400 mt-1 mb-4">
        Hỗ trợ JPG, PNG, WebP. Tự động nén WebP chuẩn nét cao lưu vào Storage
      </p>
      <button
        type="button"
        disabled={isUploading}
        className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50 pointer-events-none"
      >
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Upload className="w-4 h-4" />}
        <span>{isUploading ? 'Đang Xử Lý Nén WebP...' : 'Chọn File Ảnh Từ Máy Tính'}</span>
      </button>
    </div>
  );
}
