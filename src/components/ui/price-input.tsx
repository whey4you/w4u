'use client';

import React, { useRef, useLayoutEffect } from 'react';

export interface PriceInputProps {
  label?: string;
  value: string | number;
  onChange: (rawValue: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  suffix?: string;
  hideWordsText?: boolean;
}

/** Chuyển số thô thành chuỗi có dấu phẩy phân cách: 1550000 -> "1,550,000" */
export function formatWithCommas(val: string | number | null | undefined): string {
  if (val === '' || val === undefined || val === null) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

/** Chuyển số tiền thành chữ tiếng Việt giúp dễ phân biệt nghìn / triệu */
export function getVietnameseText(val: string | number): string {
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

function calculateTargetCursor(valBeforeFormat: string, cursorBefore: number, nextFormatted: string): number {
  const valueUpToCursor = valBeforeFormat.slice(0, cursorBefore);
  const digitsBefore = valueUpToCursor.replace(/\D/g, '').length;
  if (digitsBefore === 0) return 0;

  let newCursorPos = nextFormatted.length;
  let count = 0;
  for (let i = 0; i < nextFormatted.length; i++) {
    if (/\d/.test(nextFormatted[i])) count++;
    if (count === digitsBefore) {
      newCursorPos = i + 1;
      break;
    }
  }
  return newCursorPos;
}

export function PriceInput({
  label,
  value,
  onChange,
  placeholder = '0',
  required = false,
  className = '',
  disabled = false,
  readOnly = false,
  suffix = 'đ',
  hideWordsText = false,
}: PriceInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  const displayValue = formatWithCommas(value);
  const wordsText = !hideWordsText ? getVietnameseText(value) : '';

  useLayoutEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      const pos = Math.min(cursorPositionRef.current, inputRef.current.value.length);
      inputRef.current.setSelectionRange(pos, pos);
      cursorPositionRef.current = null;
    }
  }, [displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const currentCursor = input.selectionStart ?? input.value.length;
    const rawDigits = input.value.replace(/\D/g, '');
    const nextFormatted = formatWithCommas(rawDigits);

    cursorPositionRef.current = calculateTargetCursor(input.value, currentCursor, nextFormatted);
    onChange(rawDigits);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;
    const { selectionStart, selectionEnd, value: currentVal } = inputRef.current;

    // Nếu người dùng nhấn Backspace và ký tự ngay trước con trỏ là dấu phẩy (,)
    if (e.key === 'Backspace' && selectionStart !== null && selectionStart === selectionEnd && selectionStart > 1) {
      if (currentVal[selectionStart - 1] === ',') {
        e.preventDefault();
        // Xóa chữ số đứng trước dấu phẩy
        const deleteIdx = selectionStart - 2;
        const nextVal = currentVal.slice(0, deleteIdx) + currentVal.slice(selectionStart);
        const rawDigits = nextVal.replace(/\D/g, '');
        const nextFormatted = formatWithCommas(rawDigits);

        cursorPositionRef.current = calculateTargetCursor(currentVal.slice(0, deleteIdx), deleteIdx, nextFormatted);
        onChange(rawDigits);
      }
    }
    // Nếu người dùng nhấn Delete và ký tự ngay sau con trỏ là dấu phẩy (,)
    else if (e.key === 'Delete' && selectionStart !== null && selectionStart === selectionEnd && selectionStart < currentVal.length - 1) {
      if (currentVal[selectionStart] === ',') {
        e.preventDefault();
        // Xóa chữ số đứng sau dấu phẩy
        const deleteIdx = selectionStart + 1;
        const nextVal = currentVal.slice(0, selectionStart) + currentVal.slice(deleteIdx + 1);
        const rawDigits = nextVal.replace(/\D/g, '');
        const nextFormatted = formatWithCommas(rawDigits);

        cursorPositionRef.current = calculateTargetCursor(currentVal.slice(0, selectionStart), selectionStart, nextFormatted);
        onChange(rawDigits);
      }
    }
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block font-semibold text-slate-700">{label}</label>
          {wordsText && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {wordsText}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900 font-semibold text-xs disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
