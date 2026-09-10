'use client';

import React, { useState, useRef } from 'react';
import { Heading2, Heading3, Bold, Italic, Table, Quote, List, Minus, Eye, Columns, Edit3, PackagePlus, ImagePlus } from 'lucide-react';
import { BlogContentRenderer } from '@/components/features/blog/blog-content-renderer';
import { Product } from '@/types/product';
import { BlogProductSelector } from './blog-product-selector';
import { BlogImageModal } from './blog-image-modal';

interface AdminBlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  products: Product[];
}

export function AdminBlogEditor({ content, onChange, products }: AdminBlogEditorProps) {
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${before}${selectedText}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleInsertProduct = (productId: string) => {
    insertSnippet(`\n\n:::product{id="${productId}"}:::\n\n`);
  };

  const handleInsertImage = (imageUrl: string, caption: string) => {
    insertSnippet(`\n\n![${caption}](${imageUrl})\n\n`);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Editor Toolbar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertSnippet('## ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            title="Đầu mục H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('### ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            title="Đầu mục H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Chữ in đậm"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Chữ in nghiêng"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                '\n\n| Tiêu chí | Lựa chọn A | Lựa chọn B |\n| :--- | :--- | :--- |\n| Đặc điểm | Giá trị 1 | Giá trị 2 |\n| Khuyên dùng | Cho mục tiêu 1 | Cho mục tiêu 2 |\n\n'
              )
            }
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Chèn bảng so sánh"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Trích dẫn"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n\n---\n\n')}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 text-xs"
            title="Đường phân cách"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Insert Product Button */}
          <button
            type="button"
            onClick={() => setIsProductSelectorOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Chèn thẻ sản phẩm Whey4You"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Chèn Thẻ Sản Phẩm</span>
          </button>

          {/* Insert Image Button */}
          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Chèn ảnh minh họa bài viết"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Chèn Ảnh</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chỉ soạn thảo"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Song song: Soạn thảo & Xem trước"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Chỉ xem trước"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[460px]">
        {/* Textarea */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'edit' ? 'md:col-span-2' : ''} p-4 flex flex-col`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Nhập nội dung bài viết bằng định dạng Markdown... Dùng ## để tạo tiêu đề H2, ### cho H3, :::product{id='...'}::: để nhúng sản phẩm."
              className="w-full flex-1 p-3 text-sm font-mono text-slate-800 bg-transparent focus:outline-hidden resize-none leading-relaxed min-h-[420px]"
            />
          </div>
        )}

        {/* Live Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'preview' ? 'md:col-span-2' : ''} p-6 bg-slate-50/50 overflow-y-auto max-h-[600px]`}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Xem Trước Trực Quan (Live Preview)
            </div>
            {content.trim() ? (
              <BlogContentRenderer content={content} />
            ) : (
              <p className="text-xs text-slate-400 italic py-10 text-center">
                Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung hoặc dùng Trợ lý AI để sinh bài viết.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Product Selector Dialog */}
      <BlogProductSelector
        products={products}
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelect={handleInsertProduct}
      />

      {/* Image Inserter Dialog */}
      <BlogImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
      />
    </div>
  );
}
