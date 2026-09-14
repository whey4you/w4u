'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Loader2, Plus, Images } from 'lucide-react';
import { uploadProductImage } from '@/lib/image-utils';
import { MediaPickerModal } from '@/components/features/admin/media/media-picker-modal';
import { useFileDropzone } from '@/hooks/use-file-dropzone';
import { ProductImageCard } from './product-image-card';

interface ProductImageManagerProps {
  defaultImage: string;
  setDefaultImage: (val: string) => void;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ProductImageManager({
  defaultImage,
  setDefaultImage,
  images,
  setImages,
}: ProductImageManagerProps) {
  const [newUrl, setNewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách toàn bộ ảnh với ảnh đầu tiên là defaultImage
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (defaultImage) list.push(defaultImage);
    images.forEach((img) => {
      if (img && !list.includes(img)) list.push(img);
    });
    return list;
  }, [defaultImage, images]);

  const syncImages = (newList: string[]) => {
    if (newList.length === 0) {
      setDefaultImage('/products/r1-protein.jpg');
      setImages([]);
    } else {
      setDefaultImage(newList[0]);
      setImages(newList.slice(1));
    }
  };

  const handleAddImage = (urlToAdd: string) => {
    const cleanUrl = urlToAdd.trim();
    if (!cleanUrl || allImages.includes(cleanUrl)) return;
    syncImages([...allImages, cleanUrl]);
    setNewUrl('');
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        uploadedUrls.push(url);
      }
      const uniqueNew = uploadedUrls.filter((u) => !allImages.includes(u));
      if (uniqueNew.length > 0) {
        syncImages([...allImages, ...uniqueNew]);
      }
    } catch {
      alert('Không thể tải ảnh lên. Vui lòng kiểm tra lại kết nối!');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length > 0) {
      processFiles(rawFiles);
    }
  };

  const { isDragging, dropzoneProps } = useFileDropzone({
    onFilesDrop: (files) => {
      processFiles(files);
    },
    accept: ['image/*'],
    multiple: true,
    disabled: uploading,
    onError: (err) => alert(err),
  });

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= allImages.length) return;
    const updated = [...allImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    syncImages(updated);
  };

  const handleSetPrimary = (index: number) => {
    moveImage(index, 0);
  };

  const handleRemoveImage = (index: number) => {
    const updated = allImages.filter((_, i) => i !== index);
    syncImages(updated);
  };

  return (
    <div
      {...dropzoneProps}
      className={`space-y-3 rounded-2xl border p-3.5 text-xs transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/30'
          : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span>Bộ Sưu Tập Hình Ảnh Sản Phẩm ({allImages.length})</span>
            {isDragging && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold animate-pulse">
                Thả ảnh vào đây!
              </span>
            )}
          </label>
          <span className="text-[10px] text-slate-400">
            Ảnh #1 là đại diện • Kéo thả hoặc bấm mũi tên để đổi vị trí
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {isDragging
            ? 'Thả một hoặc nhiều ảnh vào đây để tự động nén WebP và thêm vào bộ sưu tập.'
            : 'Tải ảnh lên hoặc dán link URL. Bấm "Đại diện" hoặc di chuyển ảnh về ô đầu tiên để làm ảnh chính.'}
        </p>
      </div>

      {/* Upload / Link Input Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage(newUrl))}
            placeholder="Dán link ảnh và bấm Thêm hoặc Enter..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 text-slate-900 text-xs"
          />
        </div>

        {newUrl.trim() && (
          <button
            type="button"
            onClick={() => handleAddImage(newUrl)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold inline-flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 shadow-2xs flex-shrink-0 cursor-pointer"
          title="Chọn ảnh có sẵn từ Thư Viện Ảnh"
        >
          <Images className="w-3.5 h-3.5 text-blue-600" />
          <span>Kho Ảnh</span>
        </button>

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black font-semibold shadow-2xs disabled:opacity-50 flex-shrink-0 cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Nén WebP...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Tải Ảnh Lên</span>
            </>
          )}
        </button>
      </div>

      {/* Modal Chọn Ảnh Có Sẵn */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(selectedUrl) => handleAddImage(selectedUrl)}
      />

      {/* Images Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {allImages.map((img, idx) => (
            <ProductImageCard
              key={`${img}-${idx}`}
              image={img}
              index={idx}
              totalCount={allImages.length}
              isPrimary={idx === 0}
              isDragging={draggedIndex === idx}
              onDragStart={() => setDraggedIndex(idx)}
              onDrop={() => {
                if (draggedIndex !== null && draggedIndex !== idx) {
                  moveImage(draggedIndex, idx);
                }
                setDraggedIndex(null);
              }}
              onMoveLeft={() => moveImage(idx, idx - 1)}
              onMoveRight={() => moveImage(idx, idx + 1)}
              onSetPrimary={() => handleSetPrimary(idx)}
              onRemove={() => handleRemoveImage(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
