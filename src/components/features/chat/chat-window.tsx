'use client';

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/chat';
import {
  INITIAL_GREETING_MESSAGE,
  streamChatMessage,
} from '@/services/ai-chat.service';
import { ChatHeader } from './chat-header';
import { ChatMessageList } from './chat-message-list';
import { ChatInput } from './chat-input';

const CHAT_STORAGE_KEY = 'w4u_chat_messages';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  // Khôi phục lịch sử chat từ sessionStorage khi component mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.warn('[ChatWindow] Could not restore messages from sessionStorage:', err);
    }
  }, []);

  // Lưu tin nhắn vào sessionStorage bất cứ khi nào hội thoại thay đổi
  useEffect(() => {
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].id !== INITIAL_GREETING_MESSAGE.id)) {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (err) {
      console.warn('[ChatWindow] Could not save messages to sessionStorage:', err);
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (text: string) => {
    if (isLoading || !text.trim()) return;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantMsgId = `ai-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsLoading(true);

    try {
      await streamChatMessage(
        messages,
        text,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        () => {
          setIsLoading(false);
        },
        (err) => {
          console.error('Streaming error:', err);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    error: err instanceof Error ? err.message : 'Kết nối bị gián đoạn. Bạn vui lòng thử lại nhé.',
                  }
                : msg
            )
          );
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([INITIAL_GREETING_MESSAGE]);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (err) {
      console.warn('[ChatWindow] Could not clear messages from sessionStorage:', err);
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay to tap-to-close on phones */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 sm:hidden"
        aria-hidden="true"
      />

      {/* Chat Window container: bottom-sheet on mobile, anchored bottom-corner card on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex h-[88vh] max-h-[88vh] sm:h-[530px] sm:max-h-[calc(100vh-40px)] sm:w-[380px] sm:bottom-5 sm:right-5 sm:inset-x-auto flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        <ChatHeader onClear={handleClear} onClose={onClose} />
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </>
  );
}
