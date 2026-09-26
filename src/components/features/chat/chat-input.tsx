'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động focus trên máy tính khi mở chat
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 640) {
      textareaRef.current?.focus();
    }
  }, []);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter để gửi, Shift + Enter để xuống dòng mới
    if (e.key === 'Enter' && !e.shiftKey) {
      // Chặn gửi khi đang gõ tiếng Việt Telex/VNI (IME composition)
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSubmit();
    }
  };

  const isMultiLine = text.includes('\n');

  return (
    <div className="border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <form
        onSubmit={handleSubmit}
        className={`flex ${
          isMultiLine ? 'items-end' : 'items-center'
        } gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500 transition-colors`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi hoặc nội dung cần tư vấn..."
          disabled={isLoading}
          rows={1}
          className="block w-full flex-1 resize-none bg-transparent py-1 text-base sm:text-sm text-apple-dark placeholder:text-slate-400 focus:outline-none leading-5 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Gửi tin nhắn"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </button>
      </form>
      <p className="mt-1.5 text-center text-[10px] text-slate-400">
        Whey4You AI cung cấp thông tin dinh dưỡng thể hình tham khảo.
      </p>
    </div>
  );
}

