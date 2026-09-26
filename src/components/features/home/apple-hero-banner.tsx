'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS, HeroBannerItem } from '@/config/hero-banners';

interface AppleHeroBannerProps {
  initialBanners?: HeroBannerItem[];
}

export function AppleHeroBanner({ initialBanners }: AppleHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const touchStartX = useRef<number | null>(null);

  const banners = initialBanners && initialBanners.length > 0 ? initialBanners : HERO_BANNERS;
  const totalBanners = banners.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const current = banners[currentIndex];
  const isCurrentVideo = current?.media_type === 'video' && !!(current.video_url || current.image);

  // Tự động chuyển slide: ảnh sau 5s, video đợi phát hết
  useEffect(() => {
    if (isPaused || totalBanners <= 1 || isCurrentVideo) return;
    const timer = setInterval(() => handleNext(), 5000);
    return () => clearInterval(timer);
  }, [isPaused, totalBanners, handleNext, isCurrentVideo]);

  // Thiết lập video: tắt tiếng và tăng tốc độ phát lên x1.5
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.playbackRate = 1.5;
    }
  }, [currentIndex, isCurrentVideo]);

  // Tạm dừng video khi rê chuột vào, phát tiếp khi rê chuột ra
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="pt-3 sm:pt-4 pb-4 sm:pb-8 bg-apple-canvas">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group w-full rounded-2xl sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500 border border-black/[0.06] bg-[#070b14] aspect-[3/1]"
        >
          {/* Banner chính dẫn link tới điểm đến cấu hình (Sản phẩm, Vitamins, Blog...) */}
          <Link
            href={current.href}
            aria-label={current.title}
            className="relative block w-full h-full cursor-pointer select-none"
          >
            {isCurrentVideo ? (
              <video
                ref={videoRef}
                key={current.id}
                src={current.video_url || current.image}
                poster={current.image || undefined}
                autoPlay
                loop={totalBanners <= 1}
                muted
                playsInline
                preload="metadata"
                suppressHydrationWarning
                onPlay={(e) => {
                  e.currentTarget.playbackRate = 1.5;
                }}
                onLoadedMetadata={(e) => {
                  e.currentTarget.playbackRate = 1.5;
                }}
                onEnded={() => {
                  // Video đã chạy xong toàn bộ nội dung -> chuyển sang slide tiếp theo
                  if (totalBanners > 1) {
                    handleNext();
                  }
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
            ) : (
              <Image
                key={current.id}
                src={current.image}
                alt={current.title}
                fill
                priority
                quality={85}
                sizes="(max-width: 640px) 100vw, (max-width: 1440px) 100vw, 1440px"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
            )}
          </Link>

          {/* Nút điều hướng Slide Trước / Sau (chỉ hiển thị trên màn hình có chuột rê hover) */}
          {totalBanners > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Slide trước"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md hidden sm:flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg border border-white/10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Slide tiếp theo"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md hidden sm:flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg border border-white/10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Dải chấm định vị Slide phong cách Apple sang trọng */}
          {totalBanners > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20 pointer-events-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10">
                {banners.map((item, idx) => {
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      aria-label={`Chuyển tới slide ${idx + 1}: ${item.title}`}
                      className={`transition-all duration-300 rounded-full ${
                        isActive
                          ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-white shadow-xs'
                          : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

