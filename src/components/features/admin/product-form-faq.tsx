'use client';

import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { ProductFAQ } from '@/types/product';
import { FAQ_PRESETS } from '@/lib/faq-presets';

interface ProductFormFaqProps {
  faq: ProductFAQ[];
  setFaq: React.Dispatch<React.SetStateAction<ProductFAQ[]>>;
}

export function ProductFormFaq({ faq, setFaq }: ProductFormFaqProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleApplyPreset = (presetItems: ProductFAQ[]) => {
    if (faq.length > 0) {
      const confirmReplace = window.confirm(
        'Bạn muốn THAY THẾ danh sách câu hỏi hiện tại bằng mẫu này?\n(Bấm OK để thay thế, bấm Cancel để THÊM NỐI TIẾP vào danh sách hiện có)'
      );
      if (confirmReplace) {
        setFaq(presetItems);
      } else {
        setFaq((prev) => [...prev, ...presetItems]);
      }
    } else {
      setFaq(presetItems);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setFaq((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      },
    ]);

    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (index: number) => {
    setFaq((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Preset Selector Bar */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Nạp nhanh mẫu câu hỏi thường gặp (Presets):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FAQ_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.items)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 font-medium shadow-2xs transition-all text-xs"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Existing FAQs List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-700">
            Danh Sách Câu Hỏi ({faq.length})
          </label>
          {faq.length > 0 && (
            <button
              type="button"
              onClick={() => setFaq([])}
              className="text-[10px] text-rose-500 hover:underline"
            >
              Xóa tất cả câu hỏi
            </button>
          )}
        </div>

        {faq.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400 space-y-1">
            <HelpCircle className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-medium text-slate-600">Chưa có câu hỏi thường gặp nào.</p>
            <p className="text-[11px]">Bấm vào một trong các mẫu ở trên hoặc tự thêm câu hỏi mới bên dưới.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {faq.map((item, index) => (
              <div
                key={item.id || index}
                className="group p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900 leading-snug">
                    {index + 1}. {item.question}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed pl-3.5 border-l-2 border-slate-200">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Add New FAQ Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
        <label className="block font-semibold text-slate-800">Thêm Câu Hỏi Mới Tùy Chỉnh</label>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="VD: Người mới bắt đầu tập gym có nên dùng không?"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:outline-none"
        />
        <textarea
          rows={2}
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Nhập câu trả lời giải đáp chi tiết..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddFaq}
            disabled={!newQuestion.trim() || !newAnswer.trim()}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Hỏi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
