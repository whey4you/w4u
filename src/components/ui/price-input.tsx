'use client';

import React from 'react';

interface PriceInputProps {
  label: string;
  value: string | number;
  onChange: (rawValue: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/** Chuyển số thô thành chuỗi có dấu phẩy phân cách: 1550000 -> "1,550,000" */
function formatWithCommas(val: string | number): string {
  if (val === '' || val === undefined || val === null) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

/** Chuyển số tiền thành chữ tiếng Việt giúp dễ phân biệt nghìn / triệu */
function getVietnameseText(val: string | number): string {
  const num = typeof val === 'number' ? val : Number(String(val).replace(/\D/g, ''));
  if (!num || isNaN(num) || num <= 0) return '';
  if (num >= 1_000_000_000) {
    const b = (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '');
    return `≈ ${b} tỷ VNĐ`;
  }
  if (num >= 1_000_000) {
    const m = (num / 1_000_000).toFixed(2).replace(/\.00$/, '');
    return `≈ ${m} triệu VNĐ`;
  }
  if (num >= 1_000) {
    const k = (num / 1_000).toFixed(0);
    return `≈ ${k} nghìn VNĐ`;
  }
  return `${num} VNĐ`;
}

export function PriceInput({
  label,
  value,
  onChange,
  placeholder = '0',
  required = false,
  className = '',
}: PriceInputProps) {
  const displayValue = formatWithCommas(value);
  const wordsText = getVietnameseText(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ giữ lại chữ số
    const rawDigits = e.target.value.replace(/\D/g, '');
    onChange(rawDigits);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block font-semibold text-slate-700">{label}</label>
        {wordsText && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {wordsText}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          required={required}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900 font-semibold text-xs ${className}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px] pointer-events-none">
          đ
        </span>
      </div>
    </div>
  );
}
