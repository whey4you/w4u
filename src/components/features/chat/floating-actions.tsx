'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZaloIcon, FacebookIcon } from './chat-icons';
import { ChatWindow } from './chat-window';

const ZALO_URL = 'https://zalo.me/g/hqwqsqcnpgik9n3zo0nk';
const FACEBOOK_URL = 'https://www.facebook.com/people/Whey4You/61563177707517/';
const CHAT_OPEN_KEY = 'w4u_chat_open';

export function FloatingActions() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasStickyBar, setHasStickyBar] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHAT_OPEN_KEY) === 'true') {
        setIsChatOpen(true);
      }
    } catch {}
  }, []);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    try {
      sessionStorage.setItem(CHAT_OPEN_KEY, 'true');
    } catch {}
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    try {
      sessionStorage.removeItem(CHAT_OPEN_KEY);
    } catch {}
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ visible: boolean }>;
      setHasStickyBar(Boolean(customEvent.detail?.visible));
    };
    window.addEventListener('sticky-bar-change', handler);
    return () => {
      window.removeEventListener('sticky-bar-change', handler);
    };
  }, []);

  return (
    <>
      {/* 3 Floating Bubble Buttons: Hidden when chat window is open */}
      {!isChatOpen && (
        <div
          className={`fixed right-3 sm:right-5 z-40 flex flex-col items-end gap-2 transition-all duration-300 print:hidden ${
            hasStickyBar ? 'bottom-[4.75rem] lg:bottom-6' : 'bottom-4 sm:bottom-5 lg:bottom-6'
          }`}
        >
          {/* 1. Nút Zalo (Top) */}
          <div className="group relative flex items-center">
            <div className="pointer-events-none absolute right-full mr-2.5 hidden sm:group-hover:flex items-center gap-2 rounded-xl border border-blue-100 bg-white/95 px-2.5 py-1 text-right shadow-md backdrop-blur-sm transition-all duration-200 whitespace-nowrap">
              <div>
                <p className="text-xs font-bold text-slate-800">Cộng đồng Zalo</p>
                <p className="text-[10px] text-slate-400">Nhận ưu đãi & hỏi đáp</p>
              </div>
            </div>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cộng đồng Zalo Whey4You"
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-[0_3px_12px_rgba(0,104,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-108 hover:shadow-[0_6px_18px_rgba(0,104,255,0.45)] active:scale-95 border-2 border-white overflow-hidden"
            >
              <span className="absolute inset-0 -z-10 rounded-full bg-blue-500/20 animate-sonar" />
              <ZaloIcon className="h-full w-full object-contain" />
            </a>
          </div>

          {/* 2. Nút Facebook (Middle) */}
          <div className="group relative flex items-center">
            <div className="pointer-events-none absolute right-full mr-2.5 hidden sm:group-hover:flex items-center gap-2 rounded-xl border border-blue-100 bg-white/95 px-2.5 py-1 text-right shadow-md backdrop-blur-sm transition-all duration-200 whitespace-nowrap">
              <div>
                <p className="text-xs font-bold text-slate-800">Facebook</p>
                <p className="text-[10px] text-slate-400">Fanpage chính thức</p>
              </div>
            </div>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fanpage Facebook Whey4You"
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full shadow-[0_3px_12px_rgba(24,119,242,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-108 hover:shadow-[0_6px_18px_rgba(24,119,242,0.45)] active:scale-95 border-2 border-white overflow-hidden"
            >
              <span className="absolute inset-0 -z-10 rounded-full bg-blue-600/20 animate-sonar [animation-delay:0.6s]" />
              <FacebookIcon className="h-full w-full object-contain" />
            </a>
          </div>

          {/* 3. Nút AI Support Chat (Bottom) */}
          <div className="group relative flex items-center">
            {/* Hover tooltip for AI button (Desktop only) */}
            <div className="pointer-events-none absolute right-full mr-2.5 hidden sm:group-hover:flex items-center gap-2 rounded-xl border border-slate-100 bg-white/95 px-2.5 py-1 text-right shadow-md backdrop-blur-sm transition-all duration-200 whitespace-nowrap">
              <div>
                <p className="text-xs font-bold text-slate-800">AI Support Chat</p>
                <p className="text-[10px] text-emerald-600 font-medium">● Sẵn sàng hỗ trợ 24/7</p>
              </div>
            </div>

            {/* Online green indicator: floats prominently on the top-right */}
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 z-30 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex h-3 w-3 rounded-full border border-white bg-emerald-500 shadow-xs" />
            </span>

            <button
              type="button"
              onClick={handleOpenChat}
              aria-label="Mở AI Support Chat"
              className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-white bg-white shadow-[0_3px_14px_rgba(0,86,210,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-108 hover:shadow-[0_6px_20px_rgba(0,86,210,0.5)] active:scale-95 overflow-hidden"
            >
              <span className="absolute inset-0 -z-10 rounded-full bg-blue-500/25 animate-sonar [animation-delay:1.2s]" />
              <Image
                src="/AI support chat icon.webp"
                alt="AI Support Chat"
                width={48}
                height={48}
                className="h-full w-full object-cover select-none"
                priority
              />
            </button>
          </div>
        </div>
      )}

      {/* AI Chat Window (Anchored at bottom, close via top header X) */}
      <ChatWindow isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}
