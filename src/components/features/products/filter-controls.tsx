'use client';

import React, { ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function FilterAccordion({
  title,
  isOpen,
  onToggle,
  children,
}: FilterAccordionProps) {
  return (
    <div className="border-t border-neutral-200/80 pt-5">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between font-semibold text-sm py-1 hover:opacity-80 transition-opacity"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="mt-3 space-y-2.5 pl-0.5">{children}</div>}
    </div>
  );
}

interface FilterCheckboxItemProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function FilterCheckboxItem({
  checked,
  onChange,
  label,
}: FilterCheckboxItemProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group text-[13px] text-neutral-700 hover:text-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
          checked
            ? 'bg-black border-black text-white'
            : 'border-neutral-300 bg-white group-hover:border-neutral-500'
        }`}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </span>
      <span>{label}</span>
    </label>
  );
}
