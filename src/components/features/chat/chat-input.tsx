'use client';

import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hỏi về Whey, Mass, Creatine..."
          disabled={isLoading}
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm sm:text-xs text-apple-dark placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Gửi tin nhắn"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-1.5 text-center text-[10px] text-slate-400">
        Whey4You AI cung cấp thông tin dinh dưỡng thể hình tham khảo.
      </p>
    </div>
  );
}
