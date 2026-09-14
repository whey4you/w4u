'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Check, Sparkles } from 'lucide-react';
import { uploadProductImage } from '@/lib/image-utils';
import { useFileDropzone } from '@/hooks/use-file-dropzone';

interface FlavorImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  availableImages: string[];
}

export function FlavorImageSelector({
  value,
  onChange,
  availableImages,
}: FlavorImageSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadProductImage(file);
      onChange(url);
    } catch {
      alert('Không thể tải ảnh vị lên. Vui lòng thử lại!');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Chọn Ảnh Cho Hương Vị Này:</span>
        </label>
        <span className="text-[10px] text-slate-400">
          {availableImages.length > 0 ? 'Chọn nhanh từ ảnh sản phẩm hoặc tải mới' : 'Dán link hoặc tải ảnh mới'}
        </span>
      </div>

      {/* Available Images Quick Picker */}
      {availableImages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 pr-1">
          {/* Default Image Option */}
          <button
            type="button"
            onClick={() => onChange('')}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              !value
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-100 shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ảnh mặc định
          </button>

          {/* Thumbnails from Thông Tin & SEO */}
          {availableImages.map((img, idx) => {
            const isSelected = value === img;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => onChange(img)}
                className={`relative w-10 h-10 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-400/50 shadow-xs scale-105'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                title={idx === 0 ? 'Ảnh đại diện sản phẩm' : `Ảnh phụ #${idx + 1}`}
              >
                <Image src={img} alt="Product option" fill className="object-contain p-0.5" sizes="40px" />
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                )}
                {idx === 0 && !isSelected && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom URL or Upload option */}
      <div
        {...dropzoneProps}
        className={`flex items-center gap-2 p-1 rounded-xl transition-all ${
          isDragging ? 'bg-blue-50/80 ring-2 ring-blue-500 ring-dashed' : ''
        }`}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hoặc dán URL ảnh riêng cho vị này..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-blue-500"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex-shrink-0 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>Tải ảnh</span>
        </button>
      </div>
    </div>
  );
}
