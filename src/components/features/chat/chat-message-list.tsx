'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import Image from 'next/image';
import { User } from 'lucide-react';
import { ChatMarkdown } from './chat-markdown';


interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage?: (text: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  onSendMessage,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const isLast = idx === messages.length - 1;
        const isStreaming = isLoading && isLast && !isUser;

        // Ẩn bubble trợ lý khi chưa có ký tự nào để hiển thị typing indicator bên dưới
        if (!isUser && msg.content === '' && isLoading) {
          return null;
        }

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs overflow-hidden ${
                isUser ? 'bg-slate-200 text-slate-700' : 'border border-blue-100 shadow-2xs'
              }`}
            >
              {isUser ? (
                <User className="h-4 w-4" />
              ) : (
                <Image
                  src="/AI support chat icon.webp"
                  alt="AI"
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div
              className={`rounded-2xl px-3.5 py-2.5 leading-relaxed text-[13px] ${
                isUser
                  ? 'max-w-[78%] bg-brand-600 text-white rounded-tr-xs shadow-xs'
                  : 'max-w-[88%] sm:max-w-[85%] bg-slate-100/90 text-slate-800 rounded-tl-xs border border-slate-200/50'
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-line">{msg.content}</p>
              ) : (
                <>
                  <ChatMarkdown
                    content={msg.content}
                    isStreaming={isStreaming}
                    onSelectSuggestion={(query) => onSendMessage?.(query)}
                  />
                  {msg.error && <p role="alert" className="mt-2 text-xs text-red-700">{msg.error}</p>}
                  {isStreaming && (
                    <span className="inline-block h-3.5 w-1.5 ml-0.5 bg-brand-600 animate-pulse rounded-xs align-middle" />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator chỉ hiện khi đang chờ phản hồi ban đầu */}
      {isLoading && messages[messages.length - 1]?.content === '' && (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 overflow-hidden shadow-2xs">
            <Image
              src="/AI support chat icon.webp"
              alt="AI"
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs bg-slate-100 px-4 py-3 border border-slate-200/50">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
          </div>
        </div>
      )}


      <div ref={bottomRef} />
    </div>
  );
}
