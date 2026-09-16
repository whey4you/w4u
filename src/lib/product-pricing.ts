import { ProductSize, ProductSizeFlavorPrice } from '@/types/product';

export interface CalculatedVariantPrice {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  hasCustomFlavorPrice?: boolean;
}

/**
 * Tính toán giá của biến thể (kết hợp Kích cỡ & Hương vị).
 * Nếu một hương vị có giá riêng cho kích cỡ đó, sử dụng giá đó.
 * Ngược lại fallback về giá của kích cỡ hoặc giá mặc định của sản phẩm.
 */
export function getVariantPrice(
  product: { price: number; originalPrice?: number },
  size?: ProductSize,
  flavorId?: string
): CalculatedVariantPrice {
  let finalPrice = size?.price ?? product.price;
  let finalOriginalPrice = size?.originalPrice ?? product.originalPrice;
  let hasCustomFlavorPrice = false;

  if (size?.flavorPrices && flavorId && size.flavorPrices[flavorId]) {
    const custom = size.flavorPrices[flavorId];
    if (typeof custom.price === 'number' && custom.price > 0) {
      finalPrice = custom.price;
      hasCustomFlavorPrice = true;
      if (typeof custom.originalPrice === 'number' && custom.originalPrice > 0) {
        finalOriginalPrice = custom.originalPrice;
      }
    }
  }

  const discountPercent =
    finalOriginalPrice && finalPrice && finalOriginalPrice > finalPrice
      ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
      : undefined;

  return {
    price: finalPrice,
    originalPrice: finalOriginalPrice,
    discountPercent,
    hasCustomFlavorPrice,
  };
}

/**
 * Đếm số lượng hương vị có thiết lập giá riêng trong một kích cỡ
 */
export function countCustomFlavorPrices(size?: ProductSize): number {
  if (!size?.flavorPrices) return 0;
  return Object.values(size.flavorPrices).filter(
    (fp): fp is ProductSizeFlavorPrice => typeof fp?.price === 'number' && fp.price > 0
  ).length;
}
