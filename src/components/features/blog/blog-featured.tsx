import React from 'react';
import { Container } from '@/components/ui/container';
import { BlogPost } from '@/types/blog';
import { BlogFeaturedSlider } from './blog-featured-slider';

interface BlogFeaturedProps {
  posts?: BlogPost[];
  post?: BlogPost;
}

export function BlogFeatured({ posts, post }: BlogFeaturedProps) {
  const featuredList: BlogPost[] = posts && posts.length > 0
    ? posts
    : post
    ? [post]
    : [];

  if (featuredList.length === 0) return null;

  return (
    <section className="pt-8 sm:pt-12 pb-6 sm:pb-8">
      <Container>
        {/* Editorial Section Masthead */}
        <div className="mb-8 sm:mb-10 pb-6 border-b border-stone-200 text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-stone-500">
            <span>Whey4You Journal</span>
            <span className="text-stone-300">•</span>
            <span className="text-blue-700 font-bold">Khoa Học Dinh Dưỡng</span>
            <span className="text-stone-300">•</span>
            <span className="text-emerald-700 font-medium">Kiến Thức Thực Chiến</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 leading-[1.2] tracking-tight">
            Kiến Thức Dinh Dưỡng & Khoa Học Thể Thao
          </h1>
          <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tổng hợp các nghiên cứu chuẩn xác, gạt bỏ lầm tưởng và hướng dẫn dinh dưỡng bổ sung an toàn, hiệu quả cho gymer và người yêu thể thao.
          </p>
        </div>

        {/* Featured Interactive Showcase */}
        <BlogFeaturedSlider posts={featuredList} />
      </Container>
    </section>
  );
}
