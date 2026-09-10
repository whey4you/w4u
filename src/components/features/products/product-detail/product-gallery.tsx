'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  defaultImage: string;
  name: string;
  badge?: string;
  galleryImages?: string[];
  activeFlavorImage?: string;
}

export function ProductGallery({
  defaultImage,
  name,
  badge,
  galleryImages = [],
  activeFlavorImage,
}: ProductGalleryProps) {
  // Keep gallery thumbnails stable based only on defaultImage and galleryImages
  const images = Array.from(new Set([defaultImage, ...galleryImages])).filter(Boolean);
  const [currentImage, setCurrentImage] = useState(defaultImage);
  const currentIndex = Math.max(0, images.indexOf(currentImage));
  const isInitialMount = useRef(true);

  // When defaultImage changes (e.g. route navigation), reset to defaultImage
  useEffect(() => {
    setCurrentImage(defaultImage);
    isInitialMount.current = true;
  }, [defaultImage]);

  // When user actively switches flavor, update main image if flavor has a custom image
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (activeFlavorImage) {
      setCurrentImage(activeFlavorImage);
    }
  }, [activeFlavorImage]);

  const showImage = (offset: number) => {
    const nextIndex = (currentIndex + offset + images.length) % images.length;
    setCurrentImage(images[nextIndex]);
  };

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start">
      {/* Vertical Thumbnails List */}
      {images.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-y-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Danh sách ảnh">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setCurrentImage(image)}
              aria-label={`Xem ảnh sản phẩm ${index + 1}`}
              className={`relative h-14 w-14 flex-none overflow-hidden rounded-xl border bg-slate-50 transition-all sm:h-20 sm:w-20 ${
                currentImage === image
                  ? 'border-apple-blue ring-2 ring-apple-blue/20'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <Image src={image} alt="" fill sizes="80px" quality={80} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Display */}
      <figure className="relative aspect-square sm:aspect-square lg:aspect-[4/5] flex-1 overflow-hidden rounded-2xl bg-white max-h-[350px] sm:max-h-[520px] lg:max-h-[620px]">
        {badge && (
          <span className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10 rounded-full bg-apple-blue px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        )}

        <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 rounded-full bg-white/90 p-1.5 sm:p-2 text-slate-700 shadow-sm border border-slate-100">
          <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </div>

        <Image
          src={currentImage || '/products/r1-protein.jpg'}
          alt={name}
          fill
          priority
          quality={88}
          sizes="(max-width: 1024px) 100vw, 680px"
          className="object-contain p-3 sm:p-6 lg:p-8 transition-transform duration-300 hover:scale-105"
        />

        {images.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
            <button
              type="button"
              onClick={() => showImage(-1)}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => showImage(1)}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Ảnh tiếp"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </figure>
    </div>
  );
}
