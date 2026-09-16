'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RefreshCw, Image as ImageIcon } from 'lucide-react';

interface MediaAddPreviewProps {
  url: string;
  onClear: () => void;
}

export function MediaAddPreview({ url, onClear }: MediaAddPreviewProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
      <div className="relative w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {hasError ? (
          <ImageIcon className="w-5 h-5 text-slate-400" />
        ) : (
          <Image
            src={url}
            alt="Preview"
            fill
            className="object-contain"
            sizes="56px"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-emerald-700">✓ Đã tải ảnh thành công</p>
        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={url}>
          {url}
        </p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors inline-flex items-center gap-1"
        title="Đổi ảnh khác"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Đổi ảnh</span>
      </button>
    </div>
  );
}
