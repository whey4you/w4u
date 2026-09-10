'use client';

import React from 'react';
import { BlogPost } from '@/types/blog';
import { ImageUploader } from '@/components/features/admin/image-uploader';
import { slugify } from '@/lib/utils';
import { Plus, Trash2, Wand2 } from 'lucide-react';

interface AdminBlogFormProps {
  post: Partial<BlogPost>;
  onChange: (field: keyof BlogPost, value: unknown) => void;
}

export function AdminBlogForm({ post, onChange }: AdminBlogFormProps) {
  const handleAddTakeaway = () => {
    const list = post.keyTakeaways || [];
    onChange('keyTakeaways', [...list, '']);
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const list = [...(post.keyTakeaways || [])];
    list[index] = val;
    onChange('keyTakeaways', list);
  };

  const handleRemoveTakeaway = (index: number) => {
    const list = (post.keyTakeaways || []).filter((_, i) => i !== index);
    onChange('keyTakeaways', list);
  };

  return (
    <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Tiêu Đề Bài Viết (H1) <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={post.title || ''}
              onChange={(e) => {
                onChange('title', e.target.value);
                if (!post.slug) onChange('slug', slugify(e.target.value));
              }}
              placeholder="VD: Thời Điểm Vàng Uống Whey Protein Để Tối Đa Hóa Cơ Bắp"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden font-medium"
            />
            <button
              type="button"
              onClick={() => onChange('slug', slugify(post.title || ''))}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 shrink-0"
              title="Tự sinh Slug từ tiêu đề"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Slug</span>
            </button>
          </div>
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Đường Dẫn URL (Slug) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={post.slug || ''}
            onChange={(e) => onChange('slug', slugify(e.target.value))}
            onBlur={(e) => onChange('slug', slugify(e.target.value))}
            placeholder="thoi-diem-vang-uong-whey"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Danh Mục Bài Viết</label>
          <select
            value={post.category || 'Khoa Học'}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden text-slate-800"
          >
            <option value="Khoa Học">Khoa Học</option>
            <option value="Dinh Dưỡng">Dinh Dưỡng</option>
            <option value="Tập Luyện">Tập Luyện</option>
            <option value="Review">Review</option>
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <ImageUploader
        label="Ảnh Bìa Bài Viết (Tự động nén WebP & lưu Supabase)"
        value={post.image || ''}
        onChange={(url) => onChange('image', url)}
        placeholder="/blogs/whey-timing.jpg"
      />

      {/* Excerpt */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <label className="block text-xs font-semibold text-slate-700">Tóm Tắt Ngắn (Meta Description chuẩn SEO)</label>
          <span className="text-[10px] text-slate-400">{(post.excerpt || '').length}/160 ký tự</span>
        </div>
        <textarea
          rows={2}
          value={post.excerpt || ''}
          onChange={(e) => onChange('excerpt', e.target.value)}
          placeholder="Tóm tắt ngắn 150-160 ký tự giải thích giá trị bài viết để hiển thị trên thẻ Google..."
          className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden resize-none"
        />
      </div>

      {/* Key Takeaways (Hộp tóm tắt 30 giây E-E-A-T) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Hộp Tóm Tắt Cốt Lõi (Key Takeaways - Đọc trong 30 giây)
          </label>
          <button
            type="button"
            onClick={handleAddTakeaway}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm ý cốt lõi</span>
          </button>
        </div>
        {(post.keyTakeaways || []).map((point, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={point}
              onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
              placeholder={`Ý cốt lõi ${index + 1}...`}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleRemoveTakeaway(index)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Author & Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Tên Tác Giả / HLV</label>
          <input
            type="text"
            value={post.author?.name || ''}
            onChange={(e) =>
              onChange('author', {
                ...post.author,
                name: e.target.value,
                role: post.author?.role || 'Chuyên gia Dinh dưỡng Thể thao',
                verified: true,
              })
            }
            placeholder="WHEY4YOU"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Chức Danh / Bằng Cấp</label>
          <input
            type="text"
            value={post.author?.role || ''}
            onChange={(e) =>
              onChange('author', {
                ...post.author,
                role: e.target.value,
                name: post.author?.name || 'WHEY4YOU',
                verified: true,
              })
            }
            placeholder="Chuyên gia Dinh dưỡng Thể thao ISSN"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(post.featured)}
              onChange={(e) => onChange('featured', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Đánh dấu Bài Viết Nổi Bật</span>
          </label>
        </div>
      </div>
    </div>
  );
}
