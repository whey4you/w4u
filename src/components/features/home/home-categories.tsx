import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function HomeCategories() {
  const categories = [
    {
      id: 'whey',
      titleLine1: 'Whey Protein',
      titleLine2: 'Protein Thực Vật',
      subtitle: 'Tối ưu phát triển cơ bắp nạc và hấp thu siêu tốc',
      tag: 'TĂNG CƠ THUẦN KHIẾT',
      image: '/products/whey.webp',
      href: '/products?category=whey',
    },
    {
      id: 'strength',
      titleLine1: 'Sức Mạnh',
      titleLine2: 'Sức Bền',
      subtitle: 'Bùng nổ năng lượng bứt phá mọi mức tạ',
      tag: 'BÙNG NỔ NĂNG LƯỢNG',
      image: '/products/creatine.webp',
      href: '/products?category=strength',
    },
    {
      id: 'vitamins',
      titleLine1: 'Vitamins',
      titleLine2: 'Khoáng Chất',
      subtitle: 'Tăng cường đề kháng, phục hồi thể lực toàn diện',
      tag: 'VI LƯỢNG THIẾT YẾU',
      image: '/products/vitamins.webp',
      href: '/products?category=vitamins',
    },
  ];

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-14 bg-apple-canvas">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 space-y-1.5 sm:space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-apple-subhead uppercase">
            3 DÒNG SẢN PHẨM CHỦ LỰC
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-apple-dark">
            Chọn đúng mục tiêu. Bứt phá giới hạn.
          </h2>
        </div>

        {/* Responsive Promo Grid: Horizontal cards on Mobile, 3 columns on Tablet & Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group rounded-2xl md:rounded-[28px] overflow-hidden bg-white text-apple-dark p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 flex flex-row-reverse md:flex-col items-center md:items-stretch justify-between min-h-0 md:min-h-[420px] lg:min-h-[540px] xl:min-h-[580px] border border-black/[0.06] hover:border-apple-blue/40 shadow-xs hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 active:scale-[0.99] transition-all duration-500 relative cursor-pointer"
            >
              {/* Content: Left text on right side on Mobile, Centered on Tablet/Desktop */}
              <div className="flex-1 min-w-0 pl-3.5 sm:pl-4 md:pl-0 text-left md:text-center space-y-1 sm:space-y-1.5 md:space-y-2.5 z-10">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-apple-subhead group-hover:text-apple-blue transition-colors block">
                  {cat.tag}
                </span>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-[28px] xl:text-[34px] font-semibold tracking-tight text-apple-dark group-hover:text-apple-blue transition-colors leading-tight md:leading-[1.15]">
                  <span className="block">{cat.titleLine1}</span>
                  <span className="block text-apple-dark/90 group-hover:text-apple-blue transition-colors">{cat.titleLine2}</span>
                </h3>
                <p className="text-xs sm:text-sm text-apple-subhead line-clamp-2 md:line-clamp-none max-w-xs md:mx-auto leading-relaxed pt-0.5 md:pt-1">
                  {cat.subtitle}
                </p>

                {/* Action Cue: Always visible on touch/mobile, hover slide on desktop */}
                <div className="pt-1.5 md:pt-2 flex items-center md:justify-center gap-1.5 text-xs font-semibold text-apple-blue md:opacity-0 md:group-hover:opacity-100 md:-translate-y-1 md:group-hover:translate-y-0 transition-all duration-300">
                  <span>Khám phá sản phẩm</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>

              {/* Product Imagery: Compact thumbnail on Mobile, Centered showcase on Tablet/Desktop */}
              <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-full md:h-44 lg:h-64 xl:h-72 md:mt-4 lg:mt-6 flex items-center justify-center">
                {/* Soft ambient hover glow */}
                <div className="absolute inset-0 bg-apple-blue/0 group-hover:bg-apple-blue/5 rounded-full blur-xl md:blur-2xl transition-all duration-500 scale-75 group-hover:scale-100 pointer-events-none" />

                <div className="relative h-full w-full md:w-36 lg:w-56 group-hover:scale-110 group-hover:-translate-y-1 md:group-hover:-translate-y-2 transition-all duration-700 ease-out">
                  <Image
                    src={cat.image}
                    alt={`${cat.titleLine1} ${cat.titleLine2}`}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 112px, (max-width: 1024px) 33vw, 380px"
                    className="object-contain drop-shadow-md group-hover:drop-shadow-2xl transition-all duration-700"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
