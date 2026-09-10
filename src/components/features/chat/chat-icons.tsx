import React from 'react';

/**
 * Biểu tượng Zalo chính hãng sắc nét chuẩn thương hiệu
 */
export function ZaloIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#0068FF" />
      <path
        d="M24 8C14.611 8 7 14.716 7 23c0 4.502 2.247 8.536 5.811 11.306-.271 2.805-1.127 5.755-1.157 5.86a.75.75 0 001.034.848c3.27-1.55 6.012-3.155 7.156-3.85A18.8 18.8 0 0024 38c9.389 0 17-6.716 17-15S33.389 8 24 8z"
        fill="#FFFFFF"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="#0068FF"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="12.5"
        letterSpacing="-0.6px"
      >
        Zalo
      </text>
    </svg>
  );
}

/**
 * Biểu tượng Facebook chính hãng sắc nét chuẩn thương hiệu
 */
export function FacebookIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#1877F2" />
      <path
        d="M29.5 25.2l.9-5.9h-5.7v-3.8c0-1.6.8-3.2 3.3-3.2h2.6V7.3s-2.3-.4-4.6-.4c-4.7 0-7.8 2.8-7.8 8v4.4h-5.2v5.9h5.2V40c1.1.2 2.1.3 3.2.3s2.2-.1 3.2-.3V25.2h5.1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Biểu tượng Facebook Messenger chính hãng (giữ để tái sử dụng nếu cần)
 */
export function MessengerIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msg-bubble-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00B2FF" />
          <stop offset="50%" stopColor="#006AFF" />
          <stop offset="100%" stopColor="#A033FF" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="18" fill="url(#msg-bubble-gradient)" />
      <path
        fill="#FFFFFF"
        d="M18 7C11.925 7 7 11.583 7 17.241c0 3.224 1.6 6.096 4.1 7.974V29l3.75-2.062c1.003.278 2.062.427 3.15.427 6.075 0 11-4.583 11-10.241C29 11.583 24.075 7 18 7zm1.092 13.722l-2.802-2.988-5.467 2.988 6.013-6.386 2.87 2.988 5.4-2.988-6.014 6.386z"
      />
    </svg>
  );
}
