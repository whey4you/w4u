import React from 'react';

/**
 * Organization & WebSite JSON-LD Schema
 * Giúp Google định danh thực thể doanh nghiệp WHEY4YOU, hiển thị Sitelinks và mạng xã hội.
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://whey4you.net/#organization',
        name: 'WHEY4YOU',
        url: 'https://whey4you.net',
        logo: {
          '@type': 'ImageObject',
          url: 'https://whey4you.net/logo-brand.png',
        },
        description:
          'Whey4You - Hệ thống thực phẩm bổ sung dinh dưỡng thể hình chất lượng cao, 100% nhập khẩu chính hãng.',
        sameAs: [
          'https://www.facebook.com/people/Whey4You/61563177707517/',
          'https://zalo.me/g/hqwqsqcnpgik9n3zo0nk',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: '+84-559-959-433',
          availableLanguage: ['Vietnamese'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://whey4you.net/#website',
        url: 'https://whey4you.net',
        name: 'WHEY4YOU',
        publisher: {
          '@id': 'https://whey4you.net/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://whey4you.net/products?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
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
