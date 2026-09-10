import { AppleHeroBanner } from '@/components/features/home/apple-hero-banner';
import { HomeCategories } from '@/components/features/home/home-categories';
import { AutoScrollBlog } from '@/components/features/home/auto-scroll-blog';
import { getHeroBanners } from '@/services/banner.service';
import { getBlogs } from '@/services/blog.service';

export const revalidate = 0;

export default async function HomePage() {
  const [banners, blogs] = await Promise.all([
    getHeroBanners(),
    getBlogs(),
  ]);

  return (
    <>
      <AppleHeroBanner initialBanners={banners} />
      <HomeCategories />
      <AutoScrollBlog posts={blogs} />
    </>
  );
}

