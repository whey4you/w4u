import { describe, it, expect } from 'vitest';
import { getVariantPrice, countCustomFlavorPrices } from '@/lib/product-pricing';
import { ProductSize } from '@/types/product';

describe('Product Variant Pricing', () => {
  const baseProduct = {
    price: 1000000,
    originalPrice: 1200000,
  };

  const sampleSize: ProductSize = {
    id: 'size-5lbs',
    name: '5 lbs',
    servings: 70,
    price: 1500000,
    originalPrice: 1800000,
    flavorPrices: {
      'vanilla-clearance': {
        price: 1350000,
        originalPrice: 1800000,
      },
      'special-matcha': {
        price: 1600000,
      },
    },
  };

  it('fallback về giá sản phẩm khi không có size', () => {
    const result = getVariantPrice(baseProduct, undefined, 'choco');
    expect(result.price).toBe(1000000);
    expect(result.originalPrice).toBe(1200000);
    expect(result.hasCustomFlavorPrice).toBe(false);
  });

  it('sử dụng giá mặc định của size khi flavor không có giá riêng', () => {
    const result = getVariantPrice(baseProduct, sampleSize, 'choco');
    expect(result.price).toBe(1500000);
    expect(result.originalPrice).toBe(1800000);
    expect(result.hasCustomFlavorPrice).toBe(false);
  });

  it('sử dụng giá riêng của flavor khi có thiết lập giảm giá riêng cho size đó', () => {
    const result = getVariantPrice(baseProduct, sampleSize, 'vanilla-clearance');
    expect(result.price).toBe(1350000);
    expect(result.originalPrice).toBe(1800000);
    expect(result.hasCustomFlavorPrice).toBe(true);
    expect(result.discountPercent).toBe(25); // (1800000 - 1350000) / 1800000 = 25%
  });

  it('kế thừa originalPrice từ size nếu flavor chỉ đặt price riêng', () => {
    const result = getVariantPrice(baseProduct, sampleSize, 'special-matcha');
    expect(result.price).toBe(1600000);
    expect(result.originalPrice).toBe(1800000);
    expect(result.hasCustomFlavorPrice).toBe(true);
  });

  it('đếm đúng số lượng flavor có giá riêng trong size', () => {
    expect(countCustomFlavorPrices(sampleSize)).toBe(2);
    expect(countCustomFlavorPrices({ ...sampleSize, flavorPrices: undefined })).toBe(0);
  });
});
