'use client';

import { useState } from 'react';
import { Product, ProductFlavor, ProductSize } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { getVariantPrice } from '@/lib/product-pricing';
import { ProductOptionSelectors } from './product-option-selectors';
import { ProductPurchaseActions } from './product-purchase-actions';

interface ProductInfoProps {
  product: Product;
  selectedFlavor: ProductFlavor;
  selectedSize?: ProductSize;
  onSelectFlavor: (flavor: ProductFlavor) => void;
  onSelectSize: (size: ProductSize) => void;
}

export function ProductInfo({
  product,
  selectedFlavor,
  selectedSize,
  onSelectFlavor,
  onSelectSize,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variantPricing = getVariantPrice(product, selectedSize, selectedFlavor.id);
  const price = variantPricing.price;
  const originalPrice = variantPricing.originalPrice;
  const available = product.inStock && selectedSize?.inStock !== false;

  const handleAddToCart = () => {
    if (!available) return;
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      price,
      flavor: selectedFlavor,
      size: selectedSize,
      image: selectedFlavor.image || product.defaultImage,
      weightKg: selectedSize?.weightKg ?? product.weightKg ?? 1.0,
    }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      <ProductOptionSelectors
        flavors={product.flavors}
        sizes={product.sizes}
        selectedFlavor={selectedFlavor}
        selectedSize={selectedSize}
        onSelectFlavor={onSelectFlavor}
        onSelectSize={onSelectSize}
      />
      <ProductPurchaseActions
        added={added}
        available={available}
        price={price}
        originalPrice={originalPrice}
        quantity={quantity}
        onAdd={handleAddToCart}
        onQuantityChange={setQuantity}
      />
    </div>
  );
}
