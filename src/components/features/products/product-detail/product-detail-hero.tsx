'use client';

import React, { useState } from 'react';
import { Product, ProductFlavor, ProductSize } from '@/types/product';
import { ProductGallery } from './product-gallery';
import { ProductHeading } from './product-heading';
import { ProductInfo } from './product-info';
import { ProductAccordions } from './product-accordions';

interface ProductDetailHeroProps {
  product: Product;
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const inStockFlavor = product.flavors?.find((f) => f.inStock !== false);
  const defaultFlavor = inStockFlavor || product.flavors?.[0] || {
    id: 'default',
    name: 'Tiêu Chuẩn',
    colorHex: '#3b82f6',
  };

  const inStockSize = product.sizes?.find((s) => s.inStock !== false);
  const defaultSize = inStockSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor>(defaultFlavor);
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(defaultSize);

  return (
    <div className="grid grid-cols-1 items-start gap-x-12 gap-y-6 lg:gap-y-10 lg:grid-cols-12 xl:gap-x-16">
      {/* 1. Left Gallery (Tall, spacious, vertical thumbnails) */}
      <div className="order-1 lg:col-span-7">
        <ProductGallery
          defaultImage={product.defaultImage}
          name={product.name}
          badge={product.badge}
          galleryImages={product.images || []}
          activeFlavorImage={selectedFlavor?.image}
        />
      </div>

      {/* 2. Right Buy Box: Clean, borderless, sticky (like MyProtein screenshot) */}
      <div className="order-2 lg:col-span-5 lg:row-span-2 lg:sticky lg:top-20 space-y-5">
        <ProductHeading product={product} />
        <ProductInfo
          product={product}
          selectedFlavor={selectedFlavor}
          onSelectFlavor={setSelectedFlavor}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />
      </div>

      {/* 3. In-depth Accordions underneath the gallery on the left */}
      <div className="order-3 lg:col-span-7">
        <ProductAccordions product={product} />
      </div>
    </div>
  );
}
