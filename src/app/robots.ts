import { MetadataRoute } from 'next';

/**
 * Cấu hình chỉ thị Robots cho công cụ tìm kiếm (Google, Bing, Yandex, AI Bots).
 * Cho phép cào toàn bộ trang sản phẩm, blog, nhưng bảo vệ các trang thanh toán và admin.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whey4you.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/checkout',
          '/checkout/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
