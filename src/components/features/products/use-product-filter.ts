'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductSortOption } from '@/types/product';
import { getAdminProducts } from '@/services/product.service';
import { PRICE_RANGE_OPTIONS } from './product-filter-constants';

export function useProductFilter() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get('category');

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>(paramCategory || 'all');
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

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId) ? prev.filter((r) => r !== rangeId) : [...prev, rangeId]
    );
  };

  const resetFilters = () => {
    setSelectedPriceRanges([]);
    setInStockOnly(false);
  };

  const resetAll = () => {
    setCategory('all');
    resetFilters();
    setSortBy('price-asc');
  };

  const activeFilterCount = useMemo(() => {
    return selectedPriceRanges.length + (inStockOnly ? 1 : 0);
  }, [selectedPriceRanges, inStockOnly]);

  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
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
  }, [rawProducts, category, selectedPriceRanges, inStockOnly]);

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
