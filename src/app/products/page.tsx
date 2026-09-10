import React, { Suspense } from 'react';
import { ProductCatalog } from '@/components/features/products/product-catalog';

export const metadata = {
  title: 'Cửa Hàng Thực Phẩm Bổ Sung Thể Hình | WHEY4YOU',
  description: 'Danh mục Whey Isolate, Mass Gainer, Creatine, Vitamins chất lượng cao cho gymer và người tập thể thao.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-apple-subhead">Đang tải cửa hàng...</div>}>
      <ProductCatalog />
    </Suspense>
  );
}
