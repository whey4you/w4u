import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, Package } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { getProductBySlug } from '@/services/product.service';
import { ProductDetailHero } from '@/components/features/products/product-detail/product-detail-hero';
import { ProductSchema } from '@/components/seo/product-schema';

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

  const productUrl = `/products/${product.slug || slug}`;
  const images = product.images && product.images.length > 0
    ? product.images.map((img) => ({ url: img, alt: product.name }))
    : [{ url: product.defaultImage, alt: product.name }];

  return {
    title: `${product.name} Chính Hãng Giá Tốt | WHEY4YOU`,
    description: product.description || `Khám phá thông tin, kích cỡ, hương vị và bảng thành phần dinh dưỡng của ${product.name}.`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} Chính Hãng | WHEY4YOU`,
      description: product.description || `Khám phá ${product.name} chính hãng tại Whey4You.`,
      url: productUrl,
      siteName: 'WHEY4YOU',
      locale: 'vi_VN',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} Chính Hãng | WHEY4YOU`,
      description: product.description,
      images: [product.defaultImage],
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
      <ProductSchema product={product} />
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
