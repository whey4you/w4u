import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Package } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { getProductBySlug } from '@/services/product.service';
import { ProductDetailHero } from '@/components/features/products/product-detail/product-detail-hero';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Sản Phẩm Không Tồn Tại | WHEY4YOU',
    };
  }

  return {
    title: `${product.name} Chính Hãng Giá Tốt | WHEY4YOU`,
    description: product.description || `Khám phá thông tin, kích cỡ và hương vị của ${product.name}.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.defaultImage }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-6 sm:pb-8 lg:pb-12 pt-3 sm:pt-4">
      <Container className="max-w-[1400px]">
        {/* Crisp MyProtein-style Breadcrumbs */}
        <nav
          className="mb-3.5 flex items-center gap-1.5 overflow-hidden text-xs text-slate-500 sm:mb-4"
          aria-label="Đường dẫn trang"
        >
          <Link href="/" className="flex items-center gap-1 hover:text-slate-950 transition">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Trang chủ</span>
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-300" aria-hidden="true" />
          <Link href="/products" className="flex items-center gap-1 hover:text-slate-950 transition">
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sản phẩm</span>
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0 text-slate-300" aria-hidden="true" />
          <span className="truncate font-medium text-slate-900">{product.name}</span>
        </nav>

        {/* 2-Column Product Detail Area */}
        <ProductDetailHero product={product} />
      </Container>
    </div>
  );
}
