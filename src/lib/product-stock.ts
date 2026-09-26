import { Product, ProductFlavor, ProductSize } from '@/types/product';

/**
 * Kiểm tra xem một kích cỡ cụ thể có còn hàng hay không.
 */
export function isSizeInStock(
  product: { inStock?: boolean },
  size?: ProductSize
): boolean {
  if (product.inStock === false) return false;
  if (!size) return true;
  return size.inStock !== false;
}

/**
 * Kiểm tra xem một hương vị cụ thể có còn hàng hay không.
 * Có thể kiểm tra kết hợp theo size nếu truyền `size`.
 */
export function isFlavorInStock(
  product: { inStock?: boolean },
  flavor?: ProductFlavor,
  size?: ProductSize
): boolean {
  if (product.inStock === false) return false;
  if (flavor && flavor.inStock === false) return false;
  if (size && size.inStock === false) return false;

  // Kiểm tra cấu hình kho riêng theo từng vị trong size (flavorPrices[flavorId].inStock)
  if (size?.flavorPrices && flavor?.id && size.flavorPrices[flavor.id]) {
    const custom = size.flavorPrices[flavor.id];
    if (custom.inStock === false) return false;
  }

  return true;
}

/**
 * Kiểm tra tính khả dụng tổng thể của một biến thể (Cặp Kích cỡ + Hương vị).
 * Trả về true nếu biến thể có thể đặt mua.
 */
export function isVariantInStock(
  product: { inStock?: boolean },
  size?: ProductSize,
  flavorId?: string,
  flavor?: ProductFlavor
): boolean {
  if (product.inStock === false) return false;
  if (size && size.inStock === false) return false;
  if (flavor && flavor.inStock === false) return false;

  if (size?.flavorPrices && flavorId && size.flavorPrices[flavorId]) {
    const custom = size.flavorPrices[flavorId];
    if (custom.inStock === false) return false;
  }

  return true;
}

/**
 * Lấy tóm tắt tình trạng kho của toàn bộ sản phẩm.
 * Dùng để hiển thị badge thông minh trong Admin và bộ lọc.
 */
export function getProductStockSummary(product: Product): {
  isAllOutOfStock: boolean;
  inStockSizesCount: number;
  totalSizesCount: number;
  inStockFlavorsCount: number;
  totalFlavorsCount: number;
  statusLabel: string;
} {
  const sizes = product.sizes || [];
  const flavors = product.flavors || [];

  const inStockSizesCount = sizes.filter((s) => s.inStock !== false).length;
  const inStockFlavorsCount = flavors.filter((f) => f.inStock !== false).length;

  const totalSizesCount = sizes.length;
  const totalFlavorsCount = flavors.length;

  // Nếu sản phẩm bị tắt toàn bộ master switch hoặc tất cả các size đều hết hàng
  const isMasterOff = product.inStock === false;
  const isAllSizesOff = totalSizesCount > 0 && inStockSizesCount === 0;
  const isAllFlavorsOff = totalFlavorsCount > 0 && inStockFlavorsCount === 0;

  const isAllOutOfStock = isMasterOff || isAllSizesOff || isAllFlavorsOff;

  let statusLabel = 'Còn hàng';
  if (isMasterOff) {
    statusLabel = 'Hết hàng toàn bộ';
  } else if (isAllSizesOff || isAllFlavorsOff) {
    statusLabel = 'Hết hàng';
  } else if (totalSizesCount > 0 && inStockSizesCount < totalSizesCount) {
    statusLabel = `Còn ${inStockSizesCount}/${totalSizesCount} size`;
  }

  return {
    isAllOutOfStock,
    inStockSizesCount,
    totalSizesCount,
    inStockFlavorsCount,
    totalFlavorsCount,
    statusLabel,
  };
}
