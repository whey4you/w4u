import React from 'react';
import Image from 'next/image';
import { RotateCcw, X } from 'lucide-react';

interface ChatHeaderProps {
  onClear: () => void;
  onClose: () => void;
}

export function ChatHeader({ onClear, onClose }: ChatHeaderProps) {
  return (
    <div className="border-b border-slate-100 bg-white/95 px-4 pt-2.5 pb-3 backdrop-blur-md">
      {/* Mobile sheet drag handle indicator */}
      <div className="sm:hidden w-10 h-1 rounded-full bg-slate-300 mx-auto mb-2" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 shadow-xs overflow-hidden">
            <Image
              src="/AI support chat icon.webp"
              alt="Whey4You AI"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-apple-dark leading-tight">Whey4You AI</h3>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-brand-600">
                Advisor
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 leading-tight">
              Tư vấn dinh dưỡng thể hình 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClear}
            title="Làm mới cuộc trò chuyện"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Đóng khung chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
