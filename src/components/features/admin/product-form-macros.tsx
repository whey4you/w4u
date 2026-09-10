'use client';

import React, { useState } from 'react';
import { NutritionTableRow } from '@/types/product';
import { ProductFormNutritionTable } from './product-form-nutrition-table';
import { ProductFormMetricItems } from './product-form-metric-items';
import { ProductFormAiHelper } from './product-form-ai-helper';
import { ProductFormAiFieldButton } from './product-form-ai-field-button';
import { ProductMarkdown } from '@/components/ui/product-markdown';

interface ProductFormMacrosProps {
  productName?: string;
  brand?: string;
  category?: string;
  protein: string;
  setProtein: (val: string) => void;
  bcaa: string;
  setBcaa: (val: string) => void;
  calories: string;
  setCalories: (val: string) => void;
  sugar: string;
  setSugar: (val: string) => void;
  servings: string;
  setServings: (val: string) => void;
  proteinLabel: string;
  setProteinLabel: (val: string) => void;
  bcaaLabel: string;
  setBcaaLabel: (val: string) => void;
  caloriesLabel: string;
  setCaloriesLabel: (val: string) => void;
  sugarLabel: string;
  setSugarLabel: (val: string) => void;
  servingsLabel: string;
  setServingsLabel: (val: string) => void;
  tableRows: NutritionTableRow[];
  setTableRows: (rows: NutritionTableRow[]) => void;
  ingredients: string;
  setIngredients: (val: string) => void;
  allergens: string;
  setAllergens: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  howToUse: string;
  setHowToUse: (val: string) => void;
  onApplyPreset?: (type: 'whey' | 'strength' | 'vitamins') => void;
}

export function ProductFormMacros({
  productName = '',
  brand = '',
  category = 'whey',
  protein, setProtein,
  bcaa, setBcaa,
  calories, setCalories,
  sugar, setSugar,
  servings, setServings,
  proteinLabel, setProteinLabel,
  bcaaLabel, setBcaaLabel,
  caloriesLabel, setCaloriesLabel,
  sugarLabel, setSugarLabel,
  servingsLabel, setServingsLabel,
  tableRows, setTableRows,
  ingredients, setIngredients,
  allergens, setAllergens,
  description, setDescription,
  howToUse, setHowToUse,
  onApplyPreset,
}: ProductFormMacrosProps) {
  const [previewDesc, setPreviewDesc] = useState(false);
  const [previewUsage, setPreviewUsage] = useState(false);

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Quick Presets */}
      {onApplyPreset && (
        <div className="rounded-xl bg-slate-100/80 p-2.5 flex items-center justify-between gap-2">
          <span className="text-slate-600 font-medium">Điền nhanh mẫu dinh dưỡng:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onApplyPreset('whey')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold shadow-2xs transition-all"
            >
              🥛 Whey / Mass
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('strength')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold shadow-2xs transition-all"
            >
              ⚡ Creatine / Sức Mạnh
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('vitamins')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold shadow-2xs transition-all"
            >
              💊 Vitamin & Khoáng
            </button>
          </div>
        </div>
      )}

      {/* 2. Primary 5 Metrics (Editable Labels & Values) */}
      <ProductFormMetricItems
        protein={protein} setProtein={setProtein}
        proteinLabel={proteinLabel} setProteinLabel={setProteinLabel}
        bcaa={bcaa} setBcaa={setBcaa}
        bcaaLabel={bcaaLabel} setBcaaLabel={setBcaaLabel}
        servings={servings} setServings={setServings}
        servingsLabel={servingsLabel} setServingsLabel={setServingsLabel}
        calories={calories} setCalories={setCalories}
        caloriesLabel={caloriesLabel} setCaloriesLabel={setCaloriesLabel}
        sugar={sugar} setSugar={setSugar}
        sugarLabel={sugarLabel} setSugarLabel={setSugarLabel}
      />

      {/* 3. Detailed Nutrition Table Editor */}
      <ProductFormNutritionTable
        tableRows={tableRows}
        setTableRows={setTableRows}
        protein={protein}
        bcaa={bcaa}
        calories={calories}
        sugar={sugar}
      />

      {/* 4. AI Generator & Web Search Helper */}
      <ProductFormAiHelper
        productName={productName}
        brand={brand}
        category={category}
        onApplyAll={(data) => {
          if (data.ingredients) setIngredients(data.ingredients);
          if (data.allergens) setAllergens(data.allergens);
          if (data.description) setDescription(data.description);
          if (data.howToUse) setHowToUse(data.howToUse);
        }}
      />

      {/* 5. Ingredients & Allergens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Thành Phần Chi Tiết (Ingredients)</label>
            <ProductFormAiFieldButton
              productName={productName}
              brand={brand}
              category={category}
              fieldKey="ingredients"
              onGenerated={setIngredients}
            />
          </div>
          <textarea
            rows={3}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            placeholder="vd: 100% Pure Creatine Monohydrate..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700">Lưu Ý Dị Ứng (Allergen Warnings)</label>
            <ProductFormAiFieldButton
              productName={productName}
              brand={brand}
              category={category}
              fieldKey="allergens"
              onGenerated={setAllergens}
            />
          </div>
          <textarea
            rows={3}
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
            placeholder="vd: Không chứa chất gây dị ứng thông thường..."
          />
        </div>
      </div>

      {/* 6. Description & How to Use */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Mô Tả Sản Phẩm Chuẩn SEO</label>
            <button
              type="button"
              onClick={() => setPreviewDesc(!previewDesc)}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-0.5"
            >
              {previewDesc ? '✏️ Soạn thảo' : '👁️ Xem trước Markdown'}
            </button>
          </div>
          <ProductFormAiFieldButton
            productName={productName}
            brand={brand}
            category={category}
            fieldKey="description"
            onGenerated={setDescription}
          />
        </div>
        {previewDesc ? (
          <div className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[90px] overflow-y-auto max-h-48">
            <ProductMarkdown content={description} fallback="Chưa có nội dung mô tả để xem trước." />
          </div>
        ) : (
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono text-xs"
            placeholder="Giới thiệu nguồn gốc, công nghệ lọc tinh khiết..."
          />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Hướng Dẫn Sử Dụng & Thời Điểm Dùng</label>
            <button
              type="button"
              onClick={() => setPreviewUsage(!previewUsage)}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-0.5"
            >
              {previewUsage ? '✏️ Soạn thảo' : '👁️ Xem trước Markdown'}
            </button>
          </div>
          <ProductFormAiFieldButton
            productName={productName}
            brand={brand}
            category={category}
            fieldKey="howToUse"
            onGenerated={setHowToUse}
          />
        </div>
        {previewUsage ? (
          <div className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[70px] overflow-y-auto max-h-40">
            <ProductMarkdown content={howToUse} fallback="Chưa có hướng dẫn sử dụng để xem trước." />
          </div>
        ) : (
          <textarea
            rows={2}
            value={howToUse}
            onChange={(e) => setHowToUse(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono text-xs"
            placeholder="Pha 1 muỗng với 250ml nước lạnh..."
          />
        )}
      </div>
    </div>
  );
}

