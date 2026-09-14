'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types/chat';
import Image from 'next/image';
import { User, ChevronDown } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const prevMsgCountRef = useRef(0);

  // Phát hiện khi người dùng chủ động cuộn lên / xuống
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= 80;
    isAtBottomRef.current = atBottom;
    setShowScrollBottom(!atBottom);
  };

  // Cuộn xuống đáy khi mới mở danh sách tin nhắn
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isNewMessageAdded = messages.length > prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;

    // 1. Khi có tin nhắn mới (user vừa gửi hoặc tin nhắn mới xuất hiện):
    // Luôn ưu tiên cuộn xuống đáy để xem tin nhắn mới
    if (isNewMessageAdded) {
      isAtBottomRef.current = true;
      setShowScrollBottom(false);
      el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight;
      });
      return;
    }

    // 2. Khi tin nhắn đang streaming nội dung:
    // CHỈ tự cuộn theo nếu người dùng đang ở sát đáy (không cuộn lên đọc tin cũ)
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    isAtBottomRef.current = true;
    setShowScrollBottom(false);
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setTimeout(() => {
      isAtBottomRef.current = true;
      if (el) el.scrollTop = el.scrollHeight;
    }, 300);
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm"
      >
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

      </div>

      {/* Nút cuộn nhanh xuống tin nhắn mới nhất khi đang xem nội dung phía trên */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Cuộn xuống tin nhắn mới nhất"
          className="absolute bottom-2 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-600 shadow-md border border-slate-200/90 hover:bg-slate-50 hover:text-brand-600 active:scale-90 transition-all animate-in fade-in zoom-in-90 duration-150"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

