import React from 'react';
import { BlogPost } from '@/types/blog';

interface ArticleSchemaProps {
  post: BlogPost;
}

/**
 * BlogPosting & BreadcrumbList JSON-LD Schema
 * Tối ưu E-E-A-T cho Google Search, Google Discover và AI Overviews
 */
export function ArticleSchema({ post }: ArticleSchemaProps) {
  const postUrl = `https://whey4you.net/blog/${post.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        image: [post.image],
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Person',
          name: post.author?.name || 'Đội ngũ Dinh Dưỡng WHEY4YOU',
          jobTitle: post.author?.role || 'Chuyên gia dinh dưỡng thể thao',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WHEY4YOU',
          logo: {
            '@type': 'ImageObject',
            url: 'https://whey4you.net/logo-brand.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
        articleSection: post.category,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}#breadcrumb`,
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
            name: 'Kiến thức dinh dưỡng',
            item: 'https://whey4you.net/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: postUrl,
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
