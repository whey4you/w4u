'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { generateProductDetails } from '@/services/ai-product.service';

interface ProductFormAiHelperProps {
  productName: string;
  brand?: string;
  category?: string;
  onApplyAll: (data: {
    ingredients: string;
    allergens: string;
    description: string;
    howToUse: string;
  }) => void;
  disabled?: boolean;
}

export function ProductFormAiHelper({
  productName,
  brand,
  category,
  onApplyAll,
  disabled = false,
}: ProductFormAiHelperProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);

  const handleGenerateAll = async () => {
    if (!productName.trim()) {
      setError('Vui lòng nhập Tên Sản Phẩm ở tab "Thông Tin Chung" trước khi dùng AI!');
      return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const data = await generateProductDetails({
        productName: productName.trim(),
        brand: brand?.trim(),
        category,
        targetField: 'all',
      });

      onApplyAll({
        ingredients: data.ingredients,
        allergens: data.allergens,
        description: data.description,
        howToUse: data.howToUse,
      });

      setSources(data.sources || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gọi AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50/60 p-3.5 shadow-2xs space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Trợ Lý AI & Web Search Thông Tin Chính Hãng</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tự động tra cứu nhãn thành phần (Supplement Facts) từ Internet và viết chuẩn SEO
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateAll}
          disabled={loading || disabled}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang tra cứu Web & Viết...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Viết Cả 4 Mục Bằng AI</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2">
          ⚠️ {error}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
          <span>Đã hoàn tất tra cứu và điền tự động 4 mục thành công!</span>
        </div>
      )}

      {sources.length > 0 && (
        <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
          <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-600">Nguồn web đối chiếu:</span>
          {sources.slice(0, 3).map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-blue-600 hover:underline max-w-[180px] truncate"
              title={s.title}
            >
              <span>{s.title}</span>
              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
