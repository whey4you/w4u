'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Loader2, X, AlertCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { BlogPost } from '@/types/blog';

interface AIBlogGeneratorModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: Partial<BlogPost>) => void;
}

export function AIBlogGeneratorModal({
  products,
  isOpen,
  onClose,
  onGenerated,
}: AIBlogGeneratorModalProps) {
  const [articleType, setArticleType] = useState<'scientific' | 'product_review'>('scientific');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [tone, setTone] = useState('Khoa học Y sinh & Nghiên cứu Thực chứng (ISSN / PubMed)');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProductSelect = (id: string) => {
    setTargetProductId(id);
    if (articleType === 'product_review' && id) {
      const p = products.find((prod) => prod.id === id);
      if (p && !topic.trim()) {
        setTopic(`${p.name} (${p.brand})`);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          articleType,
          keywords: keywords.trim() || undefined,
          targetProductId: targetProductId || undefined,
          tone,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Không thể tạo bài viết.');
      }

      onGenerated(json.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bài.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Biên Tập Blog Khoa Học & Y Học Thể Thao</h3>
              <p className="text-[11px] text-slate-500">Tra cứu nghiên cứu y sinh quốc tế (PubMed, ISSN, ScienceDaily, Examine)</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-0 flex gap-4 border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setArticleType('scientific');
              setTone('Khoa học Y sinh & Nghiên cứu Thực chứng (ISSN / PubMed)');
            }}
            className={`pb-2 px-1 text-xs font-bold border-b-2 transition-colors ${
              articleType === 'scientific'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🎓 Chuyên Đề Khoa Học
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setArticleType('product_review');
              setTone('Bóc tách Khách quan & Chuẩn Y sinh (Examine/Labdoor style)');
            }}
            className={`pb-2 px-1 text-xs font-bold border-b-2 transition-colors ${
              articleType === 'product_review'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🔬 Mổ Xẻ & Review Sản Phẩm
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-600 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {articleType === 'product_review' ? 'Tên sản phẩm cần đánh giá & mổ xẻ' : 'Chủ đề bài viết'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                articleType === 'product_review'
                  ? 'VD: Rule 1 R1 Protein Isolate hoặc OstroVit Creatine...'
                  : 'VD: Thời điểm vàng uống Creatine để tối ưu sức mạnh'
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Từ khóa chính cần tối ưu (Phân tách bằng dấu phẩy)
            </label>
            <input
              type="text"
              disabled={isLoading}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={
                articleType === 'product_review'
                  ? 'VD: CFM isolate, amino spiking, độ tinh khiết, vị dâu'
                  : 'VD: creatine monohydrate, liều dùng creatine, tăng sức mạnh'
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Target Product */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {articleType === 'product_review'
                ? 'Sản phẩm trong kho Whey4You (Tự động nạp thông số & gắn link mua)'
                : 'Sản phẩm tham khảo gắn kèm (Tùy chọn - Chỉ nhúng thẻ tham khảo, không PR)'}
            </label>
            <select
              disabled={isLoading}
              value={targetProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden text-slate-800"
            >
              <option value="">
                {articleType === 'product_review'
                  ? '-- Sản phẩm ngoại nhập chưa có trong kho (AI tự tra cứu quốc tế) --'
                  : '-- Không gắn sản phẩm (Hoặc AI tự nhúng thẻ tham khảo nếu phù hợp) --'}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand})
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Định hướng phong cách bài viết</label>
            <select
              disabled={isLoading}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-hidden text-slate-800"
            >
              {articleType === 'product_review' ? (
                <>
                  <option value="Bóc tách Khách quan & Chuẩn Y sinh (Examine/Labdoor style)">Bóc tách Khách quan & Chuẩn Y sinh (Examine/Labdoor style)</option>
                  <option value="So sánh Hoạt chất & Công nghệ Bào chế Chuyên sâu">So sánh Hoạt chất & Công nghệ Bào chế Chuyên sâu</option>
                  <option value="Phân tích Hiệu năng, Đánh giá Ưu-Nhược & Đối tượng Dùng">Phân tích Hiệu năng, Đánh giá Ưu-Nhược & Đối tượng Dùng</option>
                </>
              ) : (
                <>
                  <option value="Khoa học Y sinh & Nghiên cứu Thực chứng (ISSN / PubMed)">Khoa học Y sinh & Nghiên cứu Thực chứng (ISSN / PubMed)</option>
                  <option value="Cơ chế Sinh lý học & Hướng dẫn Thực nghiệm Dễ hiểu">Cơ chế Sinh lý học & Hướng dẫn Thực nghiệm Dễ hiểu</option>
                  <option value="Phân tích So sánh Hoạt chất & Dược động học Dinh dưỡng">Phân tích So sánh Hoạt chất & Dược động học Dinh dưỡng</option>
                </>
              )}
            </select>
          </div>

          {/* Web Search Notice */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-slate-600 text-[11px]">
            <Globe className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                {articleType === 'product_review' ? (
                  <>AI kích hoạt <strong>Web Search Quốc Tế</strong> truy vấn nhãn phụ gốc (Supplement Facts), công nghệ lọc CFM/bào chế và kiểm định độ tinh khiết để biên soạn bài review mổ xẻ chuyên sâu bằng tiếng Việt.</>
                ) : (
                  <>AI kích hoạt <strong>Web Search Học Thuật</strong> ưu tiên truy vấn các cơ sở dữ liệu quốc tế cập nhật hàng ngày (<strong>PubMed, ISSN, ScienceDaily, Examine</strong>) và tự động lọc bỏ báo chí lá cải.</>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700 text-[10px] font-medium">PubMed & NIH</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 text-[10px] font-medium">ISSN / JISSN</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-700 text-[10px] font-medium">ScienceDaily & Examine</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-700 text-[10px] font-medium">Lab Tests & Specs</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tìm kiếm & biên tập...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kích Hoạt AI & Tạo Bài</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
