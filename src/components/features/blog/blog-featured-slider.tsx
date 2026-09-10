'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { BlogFeaturedCard } from './blog-featured-card';

const SLIDE_DURATION = 6000;

interface BlogFeaturedSliderProps {
  posts: BlogPost[];
}

export function BlogFeaturedSlider({ posts }: BlogFeaturedSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const total = posts.length;
  const currentPost = posts[activeIndex] || posts[0];

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
    const targetThumb = thumbnailRefs.current[index];
    if (targetThumb && scrollContainerRef.current) {
      targetThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, []);

  const handleNext = useCallback(() => {
    handleSelect((activeIndex + 1) % total);
  }, [activeIndex, total, handleSelect]);

  const handlePrev = useCallback(() => {
    handleSelect((activeIndex - 1 + total) % total);
  }, [activeIndex, total, handleSelect]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(handleNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  if (!posts || posts.length === 0) return null;

  return (
    <div
      className="space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Active Featured Card with Smooth Fade In */}
      <div key={currentPost.slug} className="animate-[fadeIn_0.4s_ease-out]">
        <BlogFeaturedCard post={currentPost} />
      </div>

      {/* Interactive Story Switcher Strip */}
      {total > 1 && (
        <div className="relative pt-2">
          {/* Controls Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Bộ Sưu Tập Nổi Bật
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-semibold">
                {activeIndex + 1} / {total}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Bài trước"
                className="p-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Bài kế tiếp"
                className="p-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Scroll Track */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-2 px-2"
          >
            {posts.map((post, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={post.slug}
                  ref={(el) => {
                    thumbnailRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`group relative text-left shrink-0 w-[240px] sm:w-[280px] p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isActive
                      ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'bg-white/70 hover:bg-white border-stone-200/90 shadow-xs hover:shadow-sm opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Progress bar indicator for active slide */}
                  {isActive && !isPaused && (
                    <div
                      key={`progress-${idx}-${activeIndex}`}
                      className="absolute top-0 left-0 h-1 bg-blue-600 animate-[progress_6s_linear]"
                    />
                  )}
                  {isActive && isPaused && (
                    <div className="absolute top-0 left-0 h-1 w-full bg-blue-600" />
                  )}

                  <div className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <Image
                        src={post.image || '/blogs/whey-timing.jpg'}
                        alt={post.title}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block truncate">
                        {post.category}
                      </span>
                      <p className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug mt-0.5 group-hover:text-blue-700 transition-colors">
                        {post.title}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
