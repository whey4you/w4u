import { MetadataRoute } from 'next';
import { getAdminProducts } from '@/services/product.service';
import { getBlogs } from '@/services/blog.service';
import { getAllPolicies } from '@/data/policies';

/**
 * Tự động tạo sitemap.xml chuẩn mực cho Google Search Console.
 * Thu thập động tất cả sản phẩm, bài viết kiến thức và chính sách.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whey4you.net';
  const now = new Date();

  // 1. Các trang tĩnh quan trọng
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Danh mục các trang chính sách & pháp lý
  const policyRoutes: MetadataRoute.Sitemap = getAllPolicies().map((policy) => ({
    url: `${baseUrl}/policy/${policy.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  try {
    const [products, blogs] = await Promise.all([
      getAdminProducts(),
      getBlogs(),
    ]);

    // 3. Danh mục link sản phẩm chi tiết
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug || product.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 4. Danh mục link bài viết kiến thức
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    }));

    return [...staticRoutes, ...policyRoutes, ...productRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Lỗi khi sinh sitemap động:', error);
    return [...staticRoutes, ...policyRoutes];
  }
}
