import { ProductSortOption } from '@/types/product';

export interface CategoryOption {
  id: string;
  label: string;
}

export const PRODUCT_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Tất Cả Sản Phẩm' },
  { id: 'whey', label: 'Whey Protein' },
  { id: 'strength', label: 'Sức Mạnh & Sức Bền' },
  { id: 'vitamins', label: 'Vitamins & Khoáng Chất' },
];

export interface PriceRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { id: 'under-1m', label: 'Dưới 1.000.000₫', min: 0, max: 1000000 },
  { id: '1m-1.7m', label: '1.000.000₫ - 1.700.000₫', min: 1000000, max: 1700000 },
  { id: 'above-1.7m', label: 'Trên 1.700.000₫', min: 1700000, max: Infinity },
];

export const SORT_OPTIONS: { id: ProductSortOption; label: string }[] = [
  { id: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao đến Thấp' },
];
