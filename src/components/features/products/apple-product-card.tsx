'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { Product, ProductFlavor, ProductSize } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { AppleButton } from '@/components/ui/apple-button';
import { getProductHUDStats } from '@/lib/nutrition-helpers';
import { ProductCardOptions } from './product-card-options';
import { getVariantPrice } from '@/lib/product-pricing';

interface AppleProductCardProps {
  product: Product;
}

export function AppleProductCard({ product }: AppleProductCardProps) {
  const { addItem } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<ProductFlavor>(
    product.flavors[0] || { id: 'std', name: 'Tiêu chuẩn', colorHex: '#0071e3' }
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product.sizes && product.sizes.length > 0
      ? product.sizes.find((s) => s.inStock !== false) || product.sizes[0]
      : undefined
  );

  useEffect(() => {
    if (product.flavors && product.flavors.length > 0) {
      if (!product.flavors.some((f) => f.id === selectedFlavor.id)) {
        setSelectedFlavor(product.flavors[0]);
      }
    }
  }, [product.flavors, selectedFlavor.id]);

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize || !product.sizes.some((s) => s.id === selectedSize.id)) {
        setSelectedSize(product.sizes.find((s) => s.inStock !== false) || product.sizes[0]);
      }
    } else {
      setSelectedSize(undefined);
    }
  }, [product.sizes, selectedSize?.id]);

  const [isAdded, setIsAdded] = useState(false);
  const hudStats = getProductHUDStats(product);
  const currentImage = selectedFlavor.image || product.defaultImage;

  const variantPricing = getVariantPrice(product, selectedSize, selectedFlavor.id);
  const price = variantPricing.price;
  const originalPrice = variantPricing.originalPrice;
  const isAvailable = product.inStock && (selectedSize ? selectedSize.inStock !== false : true);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      price,
      flavor: selectedFlavor,
      size: selectedSize,
      image: selectedFlavor.image || product.defaultImage,
      weightKg: selectedSize?.weightKg ?? product.weightKg ?? 1.0,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-7 border border-black/[0.05] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Badges & Meta */}
        <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-[11px] font-bold text-apple-subhead tracking-wider uppercase truncate max-w-[90px] sm:max-w-none">
            {product.brand}
          </span>
          {product.badge && (
            <span className="text-[9px] sm:text-[10px] font-semibold text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link
          href={productUrl}
          className="relative h-36 sm:h-52 lg:h-56 w-full my-1 sm:my-2 flex items-center justify-center block group/img cursor-pointer"
        >
          <div className="relative h-full w-full group-hover/img:scale-105 transition-transform duration-300">
            <Image
              src={currentImage}
              alt={`${product.name} - ${selectedFlavor.name}`}
              fill
              quality={85}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className={`object-contain transition-opacity duration-200 ${!product.inStock ? 'opacity-50 grayscale-20' : ''}`}
            />
          </div>
          {!product.inStock && (
            <span className="absolute px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-900/80 text-white text-[10px] sm:text-[11px] font-bold rounded-full backdrop-blur-xs whitespace-nowrap">
              Tạm Hết Hàng
            </span>
          )}
        </Link>

        {/* Title */}
        <Link href={productUrl}>
          <h3 className="text-xs sm:text-base font-semibold text-apple-dark line-clamp-2 min-h-[32px] sm:min-h-[44px] leading-snug hover:text-apple-blue transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Macro HUD */}
        <div className="mt-2.5 sm:mt-3 bg-apple-canvas rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 grid grid-cols-3 gap-0.5 sm:gap-1 text-center text-xs">
          <div className="min-w-0 px-0.5">
            <span className="block text-[9px] sm:text-[10px] text-apple-subhead font-medium truncate" title={hudStats[0].label}>
              {hudStats[0].label}
            </span>
            <span className="font-bold text-[10px] sm:text-xs text-apple-dark truncate block" title={hudStats[0].value}>
              {hudStats[0].value}
            </span>
          </div>
          <div className="border-x border-black/[0.08] min-w-0 px-0.5">
            <span className="block text-[9px] sm:text-[10px] text-apple-subhead font-medium truncate" title={hudStats[1].label}>
              {hudStats[1].label}
            </span>
            <span className="font-bold text-[10px] sm:text-xs text-apple-dark truncate block" title={hudStats[1].value}>
              {hudStats[1].value}
            </span>
          </div>
          <div className="min-w-0 px-0.5">
            <span className="block text-[9px] sm:text-[10px] text-apple-subhead font-medium truncate" title={hudStats[2].label}>
              {hudStats[2].label}
            </span>
            <span className="font-bold text-[10px] sm:text-xs text-apple-dark truncate block" title={hudStats[2].value}>
              {hudStats[2].value}
            </span>
          </div>
        </div>

        {/* Size & Flavor Options */}
        <ProductCardOptions
          flavors={product.flavors}
          sizes={product.sizes}
          selectedFlavor={selectedFlavor}
          selectedSize={selectedSize}
          onSelectFlavor={setSelectedFlavor}
          onSelectSize={setSelectedSize}
        />
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 sm:pt-6 mt-2.5 sm:mt-4 border-t border-black/[0.05] flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <span className="text-xs sm:text-base font-bold text-apple-dark block truncate">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] sm:text-xs text-apple-subhead line-through block truncate">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <AppleButton
          variant={!isAvailable ? 'secondary' : isAdded ? 'dark' : 'primary'}
          size="sm"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="px-2.5 sm:px-4 py-1 h-8 sm:h-9 min-h-0 flex-shrink-0"
        >
          {!isAvailable ? (
            <span className="text-slate-400 text-[10px] sm:text-xs">Hết</span>
          ) : isAdded ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs">
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đã thêm</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thêm Giỏ</span>
            </span>
          )}
        </AppleButton>
      </div>
    </div>
  );
}
