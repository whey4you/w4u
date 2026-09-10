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

  const banners = initialBanners && initialBanners.length > 0 ? initialBanners : HERO_BANNERS;
  const totalBanners = banners.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const current = banners[currentIndex];
  const isCurrentVideo = current?.media_type === 'video' && !!(current.video_url || current.image);

  // Tự động chuyển slide:
  // - Nếu là banner ảnh: chuyển sau 5 giây
  // - Nếu là banner video: đợi video chạy hết toàn bộ nội dung (qua onEnded) mới chuyển slide
  useEffect(() => {
    if (isPaused || totalBanners <= 1) return;

    // Nếu slide hiện tại là Video, không dùng timer 5s để tránh cắt video giữa chừng
    if (isCurrentVideo) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

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
    <section className="pt-3 sm:pt-4 pb-8 bg-apple-canvas">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative group w-full rounded-2xl sm:rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500 border border-black/[0.06] bg-[#070b14]
            aspect-[16/7] sm:aspect-[2.5/1] lg:aspect-[3/1]"
        >
          {/* Banner chính dẫn link tới điểm đến cấu hình (Sản phẩm, Vitamins, Blog...) */}
          <Link
            href={current.href}
            aria-label={current.title}
            className="relative block w-full h-full cursor-pointer"
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
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              />
            )}
          </Link>

          {/* Nút điều hướng Slide Trước / Sau (Hiển thị mượt khi rê chuột) */}
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
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg border border-white/10"
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
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 shadow-lg border border-white/10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Dải chấm định vị Slide phong cách Apple sang trọng */}
          {totalBanners > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20 pointer-events-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10">
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
                          ? 'w-7 h-2 bg-white shadow-xs'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/80'
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

