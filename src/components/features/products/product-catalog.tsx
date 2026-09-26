'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { AppleProductCard } from '@/components/features/products/apple-product-card';
import { useProductFilter } from './use-product-filter';
import { ProductSidebar } from './product-sidebar';
import { ProductToolbar } from './product-toolbar';
import { MobileFilterDrawer } from './mobile-filter-drawer';
import { PackageOpen } from 'lucide-react';

export function ProductCatalog() {
  const [showFilters, setShowFilters] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const {
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
    searchQuery,
    clearSearch,
    products,
    isLoading,
  } = useProductFilter();

  return (
    <section className="py-4 sm:py-8 lg:py-10">
      <Container>
        {/* Nike Top Toolbar */}
        <ProductToolbar
          category={category}
          onSelectCategory={setCategory}
          count={products.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          onOpenMobileFilter={() => setIsMobileDrawerOpen(true)}
          selectedPriceRanges={selectedPriceRanges}
          onRemovePriceRange={togglePriceRange}
          inStockOnly={inStockOnly}
          onRemoveInStock={() => setInStockOnly(false)}
          activeFilterCount={activeFilterCount}
          onResetFilters={resetFilters}
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
        />

        {/* Main Layout: Left Sidebar + Product Grid */}
        <div className="flex gap-8 items-start mt-2 sm:mt-4">
          {/* Desktop Left Sidebar (Nike Style) */}
          {showFilters && (
            <div className="hidden lg:block">
              <ProductSidebar
                category={category}
                onSelectCategory={setCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedPriceRanges={selectedPriceRanges}
                onTogglePriceRange={togglePriceRange}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
              />
            </div>
          )}

          {/* Product Grid Area: 2-column on mobile */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className={`grid grid-cols-2 gap-3 sm:gap-6 ${
                  showFilters
                    ? 'lg:grid-cols-2 xl:grid-cols-3'
                    : 'lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse space-y-3">
                    <div className="aspect-square bg-slate-100 rounded-xl w-full" />
                    <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-4/5" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid grid-cols-2 gap-3 sm:gap-6 transition-all duration-300 ${
                  showFilters
                    ? 'lg:grid-cols-2 xl:grid-cols-3'
                    : 'lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {products.map((product) => (
                  <AppleProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                <PackageOpen className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <h3 className="text-base font-semibold text-neutral-800">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                  {searchQuery?.trim()
                    ? `Không có sản phẩm nào khớp với từ khóa "${searchQuery.trim()}".`
                    : 'Hãy thử điều chỉnh lại bộ lọc hoặc bỏ bớt các tiêu chí tìm kiếm.'}
                </p>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-4 px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  {searchQuery?.trim() ? 'Xem tất cả sản phẩm' : 'Đặt lại tất cả bộ lọc'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Slide Drawer */}
        <MobileFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          category={category}
          onSelectCategory={setCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedPriceRanges={selectedPriceRanges}
          onTogglePriceRange={togglePriceRange}
          inStockOnly={inStockOnly}
          onToggleInStock={setInStockOnly}
          onResetFilters={resetFilters}
          resultCount={products.length}
        />
      </Container>
    </section>
  );
}
