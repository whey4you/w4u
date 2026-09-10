'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateProductDetails } from '@/services/ai-product.service';

interface ProductFormAiFieldButtonProps {
  productName: string;
  brand?: string;
  category?: string;
  fieldKey: 'ingredients' | 'allergens' | 'description' | 'howToUse';
  onGenerated: (text: string) => void;
  label?: string;
}

export function ProductFormAiFieldButton({
  productName,
  brand,
  category,
  fieldKey,
  onGenerated,
  label = 'AI Tra cứu',
}: ProductFormAiFieldButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!productName.trim()) {
      alert('Vui lòng nhập Tên Sản Phẩm ở tab "Thông Tin Chung" trước!');
      return;
    }

    setLoading(true);
    try {
      const data = await generateProductDetails({
        productName: productName.trim(),
        brand: brand?.trim(),
        category,
        targetField: fieldKey,
      });

      const value = data[fieldKey];
      if (value) {
        onGenerated(value);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi gọi AI tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Dùng AI & Web Search để tạo nội dung cho mục này`}
    >
      {loading ? (
        <>
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          <span>Đang tra cứu...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
