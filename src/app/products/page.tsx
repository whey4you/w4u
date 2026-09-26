import React, { Suspense } from 'react';
import { ProductCatalog } from '@/components/features/products/product-catalog';

export const metadata = {
  title: 'Cửa Hàng Thực Phẩm Bổ Sung Thể Hình | WHEY4YOU',
  description: 'Danh mục Whey Isolate, Mass Gainer, Creatine, Vitamins chất lượng cao cho gymer và người tập thể thao.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Cửa Hàng Thực Phẩm Bổ Sung Thể Hình | WHEY4YOU',
    description: 'Danh mục Whey Isolate, Mass Gainer, Creatine, Vitamins 100% chính hãng giá tốt.',
    url: '/products',
    siteName: 'WHEY4YOU',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/preview-social.jpg',
        width: 1200,
        height: 630,
        alt: 'Danh mục sản phẩm WHEY4YOU',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cửa Hàng Thực Phẩm Bổ Sung Thể Hình | WHEY4YOU',
    description: 'Danh mục Whey Isolate, Mass Gainer, Creatine, Vitamins 100% chính hãng.',
    images: ['/preview-social.jpg'],
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-apple-subhead">Đang tải cửa hàng...</div>}>
      <ProductCatalog />
    </Suspense>
  );
}
