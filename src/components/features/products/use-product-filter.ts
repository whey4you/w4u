'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, ProductSortOption } from '@/types/product';
import { getAdminProducts } from '@/services/product.service';
import { normalizeSearchText } from '@/lib/utils';
import { PRICE_RANGE_OPTIONS, PRODUCT_CATEGORIES } from './product-filter-constants';

function matchesSearch(product: Product, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.id === product.category)?.label || '';

  // Tổng hợp kho dữ liệu tìm kiếm thực tế của sản phẩm
  const searchableText = normalizeSearchText([
    product.name,
    product.brand,
    product.category,
    categoryLabel,
    product.description || '',
    product.howToUse || '',
    product.badge || '',
    product.slug || '',
    product.flavors?.map((f) => f.name).join(' ') || '',
    product.sizes?.map((s) => s.name).join(' ') || '',
  ].join(' '));

  // 1. Kiểm tra chuỗi con đầy đủ
  if (searchableText.includes(normalizedQuery)) return true;

  // 2. Kiểm tra từng từ khóa (tất cả các từ phải có trong thông tin sản phẩm)
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => searchableText.includes(word));
}

export function useProductFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramCategory = searchParams.get('category');
  const paramQuery = searchParams.get('q') || '';

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>(paramCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(paramQuery);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ProductSortOption>('price-asc');

  useEffect(() => {
    let isMounted = true;
    getAdminProducts()
      .then((res) => {
        if (isMounted) {
          setRawProducts(res || []);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải sản phẩm:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (paramCategory && ['whey', 'strength', 'vitamins', 'all'].includes(paramCategory)) {
      setCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    setSearchQuery(paramQuery);
  }, [paramQuery]);

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((r) => r !== rangeId) : [...prev, rangeId]
    );
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  }, [searchParams, router]);

  const resetFilters = () => {
    setSelectedPriceRanges([]);
    setInStockOnly(false);
  };

  const resetAll = () => {
    setCategory('all');
    resetFilters();
    setSortBy('price-asc');
    clearSearch();
  };

  const activeFilterCount = useMemo(() => {
    return selectedPriceRanges.length + (inStockOnly ? 1 : 0) + (searchQuery.trim() ? 1 : 0);
  }, [selectedPriceRanges, inStockOnly, searchQuery]);

  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      // Lọc từ khóa tìm kiếm theo tên, thương hiệu, hương vị, quy cách...
      if (searchQuery.trim() && !matchesSearch(product, searchQuery.trim())) {
        return false;
      }

      if (category !== 'all' && product.category !== category) return false;

      if (selectedPriceRanges.length > 0) {
        const matchesPrice = selectedPriceRanges.some((rangeId) => {
          const range = PRICE_RANGE_OPTIONS.find((r) => r.id === rangeId);
          if (!range) return false;
          return product.price >= range.min && product.price <= range.max;
        });
        if (!matchesPrice) return false;
      }

      if (inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    });
  }, [rawProducts, searchQuery, category, selectedPriceRanges, inStockOnly]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'price-asc':
      default:
        return list.sort((a, b) => a.price - b.price);
    }
  }, [filteredProducts, sortBy]);

  return {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    clearSearch,
    selectedPriceRanges,
    togglePriceRange,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
    resetFilters,
    resetAll,
    activeFilterCount,
    products: sortedProducts,
    totalProductsCount: rawProducts.length,
    isLoading,
  };
}
