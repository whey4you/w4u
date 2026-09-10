'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { Search, Edit3, Trash2, ExternalLink, Star } from 'lucide-react';

interface AdminBlogTableProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (slug: string) => void;
}

export function AdminBlogTable({ posts, onEdit, onDelete }: AdminBlogTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = posts.filter((post) => {
    const matchSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Khoa Học', 'Dinh Dưỡng', 'Tập Luyện', 'Review'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Tất Cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Bài Viết</th>
                <th className="p-4">Danh Mục</th>
                <th className="p-4">Tác Giả</th>
                <th className="p-4">Ngày Đăng</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Không tìm thấy bài viết nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.slug} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={post.image || '/blogs/whey-timing.jpg'}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0 max-w-md">
                          <div className="flex items-center gap-1.5">
                            {post.featured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Nổi bật
                              </span>
                            )}
                            <p className="font-semibold text-slate-900 truncate hover:text-blue-600">
                              {post.title}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {post.category}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{post.readTime}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-slate-800">{post.author?.name || 'Whey4You'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{post.author?.role}</p>
                    </td>

                    <td className="p-4 text-slate-500 whitespace-nowrap">{post.date}</td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="Xem bài viết phía người dùng"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onEdit(post)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) {
                              onDelete(post.slug);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
