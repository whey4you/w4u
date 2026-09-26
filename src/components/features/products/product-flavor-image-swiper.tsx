'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductFlavor } from '@/types/product';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';

interface ProductFlavorImageSwiperProps {
  productName: string;
  defaultImage: string;
  flavors?: ProductFlavor[];
  selectedFlavor: ProductFlavor;
  onSelectFlavor: (flavor: ProductFlavor) => void;
  productUrl: string;
  inStock?: boolean;
}

export function ProductFlavorImageSwiper({
  productName,
  defaultImage,
  flavors = [],
  selectedFlavor,
  onSelectFlavor,
  productUrl,
  inStock = true,
}: ProductFlavorImageSwiperProps) {
  const hasMultipleFlavors = flavors.length > 1;
  const currentIndex = Math.max(
    0,
    flavors.findIndex((f) => f.id === selectedFlavor.id)
  );

  const goToFlavor = useCallback(
    (index: number) => {
      if (!hasMultipleFlavors) return;
      const nextIndex = (index + flavors.length) % flavors.length;
      onSelectFlavor(flavors[nextIndex]);
    },
    [flavors, hasMultipleFlavors, onSelectFlavor]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      goToFlavor(currentIndex + 1);
    },
    [currentIndex, goToFlavor]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      goToFlavor(currentIndex - 1);
    },
    [currentIndex, goToFlavor]
  );

  const { hasSwiped, onTouchStart, onTouchEnd, onMouseDown, onMouseUp, onWheel } =
    useSwipeGesture({
      onSwipeLeft: () => goToFlavor(currentIndex + 1),
      onSwipeRight: () => goToFlavor(currentIndex - 1),
      disabled: !hasMultipleFlavors,
    });

  const currentImage = selectedFlavor.image || defaultImage;

  return (
    <div
      className="relative group/swiper h-36 sm:h-52 lg:h-56 w-full my-1 sm:my-2 select-none touch-pan-y"
      onWheel={onWheel}
    >
      <Link
        href={productUrl}
        onClick={(e) => {
          if (hasSwiped.current) {
            e.preventDefault();
          }
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className="relative h-full w-full flex items-center justify-center cursor-pointer"
        aria-label={`Xem chi tiết ${productName} - ${selectedFlavor.name}`}
      >
        <div className="relative h-full w-full group-hover/swiper:scale-105 transition-transform duration-300">
          <Image
            src={currentImage}
            alt={`${productName} - ${selectedFlavor.name}`}
            fill
            quality={85}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className={`object-contain transition-opacity duration-200 pointer-events-none ${
              !inStock ? 'opacity-50 grayscale-20' : ''
            }`}
          />
        </div>

        {!inStock && (
          <span className="absolute px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-900/80 text-white text-[10px] sm:text-[11px] font-bold rounded-full backdrop-blur-xs whitespace-nowrap z-10">
            Tạm Hết Hàng
          </span>
        )}
      </Link>

      {/* Desktop Chevron Navigation Arrows */}
      {hasMultipleFlavors && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Vị trước đó"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white/90 text-slate-700 shadow-sm border border-black/5 items-center justify-center hidden sm:flex opacity-0 group-hover/swiper:opacity-100 hover:bg-white hover:text-black hover:scale-110 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Vị kế tiếp"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white/90 text-slate-700 shadow-sm border border-black/5 items-center justify-center hidden sm:flex opacity-0 group-hover/swiper:opacity-100 hover:bg-white hover:text-black hover:scale-110 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Mini Dots Indicator */}
          <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
            {flavors.map((flavor, idx) => (
              <span
                key={flavor.id}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-3.5 bg-slate-800'
                    : 'w-1 bg-slate-300/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
