import React from 'react';
import { Product } from '@/types/product';

interface ProductSchemaProps {
  product: Product;
}

/**
 * Product & BreadcrumbList JSON-LD Schema
 * Kích hoạt Rich Snippets trên Google: Giá VND, Tình trạng còn hàng, Rating ⭐
 */
export function ProductSchema({ product }: ProductSchemaProps) {
  const productUrl = `https://whey4you.net/products/${product.slug || product.id}`;
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.defaultImage];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: product.description || `Sản phẩm dinh dưỡng thể hình ${product.name} chính hãng tại WHEY4YOU.`,
        image: images,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'WHEY4YOU',
        },
        sku: product.id,
        category: product.category,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'VND',
          price: product.price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'WHEY4YOU',
          },
        },
        ...(product.reviewCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating || 5,
                reviewCount: product.reviewCount,
                bestRating: '5',
                worstRating: '1',
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: 'https://whey4you.net',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sản phẩm',
            item: 'https://whey4you.net/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
