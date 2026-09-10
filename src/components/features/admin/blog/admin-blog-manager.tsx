'use client';

import React, { useState } from 'react';
import { BlogPost } from '@/types/blog';
import { Product } from '@/types/product';
import { AdminBlogTable } from './admin-blog-table';
import { AdminBlogForm } from './admin-blog-form';
import { AdminBlogEditor } from './admin-blog-editor';
import { AIBlogGeneratorModal } from './ai-blog-generator-modal';
import { Plus, Sparkles, ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';

const EMPTY_POST: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Khoa Học',
  readTime: '4 phút đọc',
  image: '/blogs/whey-timing.jpg',
  content: '',
  featured: false,
  author: {
    name: 'WHEY4YOU',
    role: 'Chuyên gia Dinh dưỡng Thể thao ISSN',
    verified: true,
  },
  keyTakeaways: [''],
  relatedProductIds: [],
};

interface AdminBlogManagerProps {
  initialPosts: BlogPost[];
  products: Product[];
}

export function AdminBlogManager({ initialPosts, products }: AdminBlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>(EMPTY_POST);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleStartNew = () => {
    setCurrentPost({ ...EMPTY_POST, date: new Date().toLocaleDateString('vi-VN') });
    setIsEditing(true);
  };

  const handleStartEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsEditing(true);
  };

  const handleUpdateField = (field: keyof BlogPost, value: unknown) => {
    setCurrentPost((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIGenerated = (generatedData: Partial<BlogPost>) => {
    setCurrentPost((prev) => ({
      ...prev,
      ...generatedData,
      date: new Date().toLocaleDateString('vi-VN'),
    }));
    setIsEditing(true);
    showNotification('success', 'Đã tự động điền bài viết chuẩn SEO từ Trợ lý AI!');
  };

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.slug || !currentPost.content) {
      alert('Vui lòng điền đầy đủ Tiêu đề, Slug và Nội dung bài viết!');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPost),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Lỗi khi lưu bài viết.');

      const savedPost = currentPost as BlogPost;
      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.slug === savedPost.slug);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedPost;
          return updated;
        }
        return [savedPost, ...prev];
      });

      showNotification('success', 'Đã lưu và xuất bản bài viết thành công!');
      setIsEditing(false);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Không thể lưu bài viết');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/blogs?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Lỗi khi xóa bài viết.');

      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      showNotification('success', 'Đã xóa bài viết thành công.');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'Không thể xóa bài viết');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice.message}</span>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {isEditing ? (currentPost.slug ? 'Biên Tập Bài Viết' : 'Tạo Bài Viết Mới') : 'Danh Sách Bài Viết Blog'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEditing ? 'Soạn thảo nội dung chuẩn khoa học E-E-A-T và nhúng sản phẩm' : `Tổng số: ${posts.length} bài viết`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay Lại</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Trợ Lý AI</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Đang Lưu...' : 'Lưu & Xuất Bản'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>AI Viết Bài (Web Search)</span>
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-black shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Viết Bài Thủ Công</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main View Body */}
      {isEditing ? (
        <div className="space-y-6">
          <AdminBlogForm post={currentPost} onChange={handleUpdateField} />
          <AdminBlogEditor
            content={currentPost.content || ''}
            onChange={(val) => handleUpdateField('content', val)}
            products={products}
          />
        </div>
      ) : (
        <AdminBlogTable posts={posts} onEdit={handleStartEdit} onDelete={handleDelete} />
      )}

      {/* AI Assistant Modal */}
      <AIBlogGeneratorModal
        products={products}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerated={handleAIGenerated}
      />
    </div>
  );
}
