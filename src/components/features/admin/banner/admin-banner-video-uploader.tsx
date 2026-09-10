'use client';

import React, { useState, useRef } from 'react';
import { Video, Loader2, Trash2, CheckCircle, Info } from 'lucide-react';
import { uploadBannerVideo, deleteBannerMedia, OPTIMAL_VIDEO_SPEC } from '@/lib/banner-storage';

interface AdminBannerVideoUploaderProps {
  currentVideoUrl: string;
  onUploadSuccess: (url: string) => void;
  onRemoveVideo?: () => void;
}

export function AdminBannerVideoUploader({
  currentVideoUrl,
  onUploadSuccess,
  onRemoveVideo,
}: AdminBannerVideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSupabaseVideo = currentVideoUrl?.includes('supabase.co/storage/v1/object/public/');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra dung lượng
    if (file.size > OPTIMAL_VIDEO_SPEC.maxSizeMB * 1024 * 1024) {
      alert(`Dung lượng video (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa ${OPTIMAL_VIDEO_SPEC.maxSizeMB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadStatus('Đang tải video lên Supabase Storage...');

    try {
      const publicUrl = await uploadBannerVideo(file);
      onUploadSuccess(publicUrl);
      setUploadStatus('Tải video lên thành công!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải video thất bại';
      alert(msg);
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFromStorage = async () => {
    if (!isSupabaseVideo) return;
    if (!confirm('Bạn có chắc muốn xóa tệp video này khỏi Supabase Storage?')) return;

    const ok = await deleteBannerMedia(currentVideoUrl);
    if (ok) {
      alert('Đã xóa tệp video khỏi Supabase Storage');
      if (onRemoveVideo) onRemoveVideo();
    } else {
      alert('Không thể xóa tệp hoặc tệp đã bị xóa trước đó');
    }
  };

  return (
    <div className="space-y-2">
      {/* Box hướng dẫn video tối ưu */}
      <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-indigo-950 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-indigo-950">
            Tiêu chuẩn video: {OPTIMAL_VIDEO_SPEC.aspectRatio} | MP4, WebM | Tối đa {OPTIMAL_VIDEO_SPEC.maxSizeMB}MB
          </p>
          <p className="text-[11px] text-indigo-800 leading-relaxed">
            Nên dùng video clip ngắn (10-30s), tỉ lệ ngang, chuẩn H.264/AAC để chạy mượt và tự động phát trên mọi thiết bị.
          </p>
        </div>
      </div>

      {/* Vùng Dropzone Upload Video */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
          isUploading
            ? 'border-indigo-400 bg-indigo-50/40 pointer-events-none'
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs font-medium text-indigo-700">{uploadStatus}</span>
          </>
        ) : (
          <>
            <Video className="w-6 h-6 text-slate-500 hover:text-indigo-600 transition-colors" />
            <p className="text-xs font-medium text-slate-700">
              Nhấn để chọn file video từ máy tính (.mp4, .webm)
            </p>
            <p className="text-[11px] text-slate-400">
              Dung lượng tối đa {OPTIMAL_VIDEO_SPEC.maxSizeMB}MB (khuyên dùng dưới 25MB)
            </p>
          </>
        )}
      </div>

      {/* Trạng thái Video Supabase */}
      {isSupabaseVideo && (
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Video đang lưu trên Supabase Storage
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
