import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { BlogPost } from '@/types/blog';

interface AutoScrollBlogProps {
  posts?: BlogPost[];
}

export function AutoScrollBlog({ posts }: AutoScrollBlogProps) {
  const displayPosts = posts && posts.length > 0 ? posts : [];
  if (displayPosts.length === 0) return null;

  // Duplicated posts for endless loop
  const duplicatedPosts = displayPosts.length >= 2 ? [...displayPosts, ...displayPosts] : displayPosts;

  return (
    <section className="py-20 bg-white border-t border-black/[0.05] overflow-hidden">
      <Container>
        {/* Section Header (Apple Style) */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-semibold tracking-widest text-apple-subhead uppercase">
            KIẾN THỨC & KHOA HỌC DINH DƯỠNG
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-apple-dark">
            Góc chuyên gia thể hình.
          </h2>
          <p className="text-base text-apple-subhead">
            Nghiên cứu khoa học thể thao, thời điểm hấp thu và cẩm nang phân biệt sản phẩm chính hãng.
          </p>
        </div>
      </Container>

      {/* Apple TV+ Style Auto-Scrolling Marquee to the Right */}
      <div className="relative w-full overflow-hidden py-3">
        <div className="animate-scroll-right flex items-center gap-6 px-4">
          {duplicatedPosts.map((post, idx) => (
            <Link
              key={`${post.slug}-${idx}`}
              href={`/blog/${post.slug}`}
              className="w-[340px] sm:w-[480px] md:w-[560px] h-[340px] sm:h-[380px] flex-shrink-0 rounded-[28px] overflow-hidden relative shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer block"
            >
              {/* Background Cover Image */}
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 340px, 560px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Top Category Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {post.category}
                </span>
              </div>

              {/* Bottom Gradient & Text */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end text-white space-y-2">
                <span className="text-xs text-neutral-300 font-medium">
                  {post.readTime} • {post.date}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold leading-snug text-white line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Pill CTA inside card */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-apple-dark text-xs font-semibold px-4 py-2 hover:bg-neutral-100 transition-all shadow-sm">
                    <span>Đọc bài viết</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
