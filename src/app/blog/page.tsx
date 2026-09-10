import { BlogFeatured } from '@/components/features/blog/blog-featured';
import { BlogGrid } from '@/components/features/blog/blog-grid';
import { getBlogs } from '@/services/blog.service';

export const revalidate = 60;

export const metadata = {
  title: 'Kiến Thức Dinh Dưỡng Thể Hình Chuẩn Khoa Học | WHEY4YOU',
  description: 'Cẩm nang dinh dưỡng gym, thời điểm uống whey, cách phân biệt whey isolate và hướng dẫn kiểm tra tem BCA.',
};

export default async function BlogPage() {
  const allPosts = await getBlogs();

  // Ưu tiên các bài được đánh dấu featured, bổ sung thêm bài mới nếu ít hơn 3
  const explicitFeatured = allPosts.filter((p) => p.featured);
  const additionalPosts = allPosts.filter((p) => !p.featured);
  const featuredPosts = [...explicitFeatured, ...additionalPosts].slice(0, 4);

  return (
    <main className="min-h-screen bg-stone-50/60">
      {featuredPosts.length > 0 && <BlogFeatured posts={featuredPosts} />}
      <BlogGrid posts={allPosts} />
    </main>
  );
}
