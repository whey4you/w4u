import React from 'react';
import { Camera } from 'lucide-react';
import { parseInlineFormatting } from './markdown-parser';

interface BlogInlineImageProps {
  src: string;
  caption?: string;
  alt?: string;
}

export function BlogInlineImage({ src, caption, alt }: BlogInlineImageProps) {
  if (!src) return null;

  const displayCaption = caption || alt || '';

  return (
    <figure className="my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 bg-stone-50/60 shadow-xs">
      <div className="relative w-full flex items-center justify-center p-2 sm:p-4 bg-white/80">
        {/* Dùng thẻ img để hỗ trợ linh hoạt cả ảnh local và ảnh từ URL bên ngoài, giữ nguyên kích thước & tỉ lệ gốc */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || caption || 'Hình minh họa bài viết'}
          loading="lazy"
          className="w-auto max-w-full h-auto object-contain mx-auto rounded-lg sm:rounded-xl shadow-xs"
        />
      </div>

      {displayCaption && (
        <figcaption className="px-5 py-3 bg-stone-100/80 border-t border-stone-200/70 text-xs sm:text-sm text-stone-600 text-center flex items-center justify-center gap-2">
          <Camera className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="italic font-medium">
            {parseInlineFormatting(displayCaption)}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
