import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getBlogBySlug, getBlogs } from '@/services/blog.service';
import { BlogReadingProgress } from '@/components/features/blog/blog-reading-progress';
import { BlogHeader } from '@/components/features/blog/blog-header';
import { BlogDetailLayout } from '@/components/features/blog/blog-detail-layout';
import { BlogRelatedPosts } from '@/components/features/blog/blog-related-posts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Bài Viết Không Tồn Tại | WHEY4YOU',
    };
  }

  return {
    title: `${post.title} | WHEY4YOU`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogBySlug(slug),
    getBlogs(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <>
      <BlogReadingProgress />
      <div className="bg-[#fbfbfd] min-h-screen pb-28 sm:pb-24">
        <Container>
          <BlogHeader post={post} />
          <BlogDetailLayout post={post} />
          <BlogRelatedPosts currentSlug={post.slug} posts={allPosts} />
        </Container>
      </div>
    </>
  );
}
