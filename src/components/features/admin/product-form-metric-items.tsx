'use client';

import React from 'react';

interface ProductFormMetricItemsProps {
  protein: string;
  setProtein: (val: string) => void;
  proteinLabel: string;
  setProteinLabel: (val: string) => void;
  bcaa: string;
  setBcaa: (val: string) => void;
  bcaaLabel: string;
  setBcaaLabel: (val: string) => void;
  servings: string;
  setServings: (val: string) => void;
  servingsLabel: string;
  setServingsLabel: (val: string) => void;
  calories: string;
  setCalories: (val: string) => void;
  caloriesLabel: string;
  setCaloriesLabel: (val: string) => void;
  sugar: string;
  setSugar: (val: string) => void;
  sugarLabel: string;
  setSugarLabel: (val: string) => void;
}

export function ProductFormMetricItems({
  protein, setProtein,
  proteinLabel, setProteinLabel,
  bcaa, setBcaa,
  bcaaLabel, setBcaaLabel,
  servings, setServings,
  servingsLabel, setServingsLabel,
  calories, setCalories,
  caloriesLabel, setCaloriesLabel,
  sugar, setSugar,
  sugarLabel, setSugarLabel,
}: ProductFormMetricItemsProps) {
  return (
    <div className="space-y-2">
      <label className="font-semibold text-slate-800 block">
        5 Thông Số Nổi Bật (Hiển thị trên Thẻ & Đầu trang)
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 space-y-1.5">
          <input
            type="text"
            value={proteinLabel}
            onChange={(e) => setProteinLabel(e.target.value)}
            placeholder="vd: Protein"
            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
          />
          <input
            type="text"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="vd: 25g"
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 space-y-1.5">
          <input
            type="text"
            value={bcaaLabel}
            onChange={(e) => setBcaaLabel(e.target.value)}
            placeholder="vd: BCAA hoặc Độ tinh khiết"
            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
          />
          <input
            type="text"
            value={bcaa}
            onChange={(e) => setBcaa(e.target.value)}
            placeholder="vd: 6.0g hoặc 100%"
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 space-y-1.5">
          <input
            type="text"
            value={servingsLabel}
            onChange={(e) => setServingsLabel(e.target.value)}
            placeholder="vd: Số Lần Dùng"
            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
          />
          <input
            type="number"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="vd: 71"
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 space-y-1.5">
          <input
            type="text"
            value={caloriesLabel}
            onChange={(e) => setCaloriesLabel(e.target.value)}
            placeholder="vd: Calories"
            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
          />
          <input
            type="text"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="vd: 110 Cal"
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-50/50 space-y-1.5">
          <input
            type="text"
            value={sugarLabel}
            onChange={(e) => setSugarLabel(e.target.value)}
            placeholder="vd: Đường hoặc Phụ gia"
            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
          />
          <input
            type="text"
            value={sugar}
            onChange={(e) => setSugar(e.target.value)}
            placeholder="vd: 0g hoặc 0%"
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
