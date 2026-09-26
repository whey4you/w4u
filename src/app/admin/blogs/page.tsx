import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { AdminBlogManager } from '@/components/features/admin/blog/admin-blog-manager';
import { getBlogs } from '@/services/blog.service';
import { getAdminProducts } from '@/services/product.service';

export const revalidate = 0;

export const metadata = {
  title: 'Quản Lý Bài Viết Blog | Whey4You Admin',
  description: 'Trình quản trị và biên tập nội dung blog dinh dưỡng thể hình chuẩn E-E-A-T tích hợp AI & Web Search.',
};

export default async function AdminBlogsPage() {
  const [blogs, products] = await Promise.all([
    getBlogs(),
    getAdminProducts(),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Kiến Thức & Blog"
        subtitle="Biên tập bài viết chuẩn SEO & E-E-A-T, tích hợp Trợ lý AI tra cứu Web Search và gắn thẻ sản phẩm tự động"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <AdminBlogManager initialPosts={blogs} products={products} />
      </main>
    </div>
  );
}
