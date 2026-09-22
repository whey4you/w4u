'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calculator, RefreshCw, Sparkles, ArrowUpCircle } from 'lucide-react';
import { NutritionTableRow } from '@/types/product';
import {
  calculatePer100g,
  calculateAllRowsPer100g,
  calculateProteinPurity,
} from '@/lib/nutrition-calculator';

interface ProductFormNutritionTableProps {
  tableRows: NutritionTableRow[];
  setTableRows: (rows: NutritionTableRow[]) => void;
  protein?: string;
  bcaa?: string;
  calories?: string;
  sugar?: string;
  onSyncToMetrics?: () => void;
}

const COMMON_SCOOPS = ['30', '33', '35', '25', '5'];

export function ProductFormNutritionTable({
  tableRows,
  setTableRows,
  protein,
  bcaa,
  calories,
  sugar,
  onSyncToMetrics,
}: ProductFormNutritionTableProps) {
  const [scoopWeight, setScoopWeight] = useState('30');
  const [autoCalc, setAutoCalc] = useState(true);

  const scoopGrams = parseFloat(scoopWeight) || 0;

  // Tính tỷ lệ tinh khiết Protein
  const proteinVal = protein || tableRows.find((r) => r.name.toLowerCase().includes('protein'))?.perServing || '';
  const proteinPurity = calculateProteinPurity(proteinVal, scoopGrams);

  const handleScoopChange = (newVal: string) => {
    setScoopWeight(newVal);
    const grams = parseFloat(newVal);
    if (autoCalc && grams > 0) {
      setTableRows(calculateAllRowsPer100g(tableRows, grams));
    }
  };

  const handleAddRow = (defaultName = '', defaultServing = '') => {
    const computed100g = scoopGrams > 0 ? calculatePer100g(defaultServing, scoopGrams) : '';
    setTableRows([
      ...tableRows,
      {
        id: `row-${Date.now()}`,
        name: defaultName,
        perServing: defaultServing,
        per100g: computed100g,
      },
    ]);
  };

  const handleUpdateRow = (index: number, field: keyof NutritionTableRow, val: string) => {
    const updated = [...tableRows];
    if (field === 'perServing' && autoCalc && scoopGrams > 0) {
      const computed100g = calculatePer100g(val, scoopGrams);
      updated[index] = { ...updated[index], perServing: val, per100g: computed100g || updated[index].per100g };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setTableRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    setTableRows(tableRows.filter((_, i) => i !== index));
  };

  const handleRecalculateAll = () => {
    if (scoopGrams > 0) {
      setTableRows(calculateAllRowsPer100g(tableRows, scoopGrams));
    }
  };

  const handleSyncFromMetrics = () => {
    const grams = scoopGrams || 30;
    const p = protein || '25g';
    const b = bcaa || '6.0g';
    const c = calories ? `${calories}${calories.includes('cal') ? '' : ' kcal'}` : '110 kcal';
    const s = sugar || '0g';

    const synced: NutritionTableRow[] = [
      { id: 'row-protein', name: 'Protein', perServing: p, per100g: calculatePer100g(p, grams) },
      { id: 'row-bcaa', name: 'BCAA tự nhiên', perServing: b, per100g: calculatePer100g(b, grams) },
      { id: 'row-cal', name: 'Năng lượng', perServing: c, per100g: calculatePer100g(c, grams) },
      { id: 'row-sugar', name: 'Đường (Sugar)', perServing: s, per100g: calculatePer100g(s, grams) },
    ];
    setTableRows(synced);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-blue-600" />
            Bảng Thành Phần Chi Tiết ({tableRows.length})
          </label>
          {proteinPurity !== null && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              🎯 Độ tinh khiết: {proteinPurity}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onSyncToMetrics && (
            <button
              type="button"
              onClick={onSyncToMetrics}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition-colors shadow-2xs"
              title="Trích xuất các chỉ số Protein, BCAA, Calo, Đường, Lần dùng từ bảng chi tiết lên 5 thông số nổi bật phía trên"
            >
              <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-600" />
              Lấy Lên 5 Chỉ Số
            </button>
          )}
          <button
            type="button"
            onClick={handleSyncFromMetrics}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            title="Đồng bộ Protein, BCAA, Calories từ 5 chỉ số nổi bật vào bảng"
          >
            <Sparkles className="h-3 w-3" />
            Lấy Từ 5 Chỉ Số
          </button>
          <button
            type="button"
            onClick={() => handleAddRow()}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm Dòng
          </button>
        </div>
      </div>

      {/* 2. Scoop Size Calculator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white p-2 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-600">1 Muỗng (Scoop):</span>
          <div className="flex items-center">
            <input
              type="number"
              step="any"
              min="1"
              value={scoopWeight}
              onChange={(e) => handleScoopChange(e.target.value)}
              className="w-16 px-2 py-1 text-xs text-center font-bold text-blue-600 bg-blue-50/50 border border-blue-200 rounded-l-lg focus:bg-white focus:outline-none"
              placeholder="30"
            />
            <span className="bg-slate-100 px-1.5 py-1 text-[11px] font-semibold text-slate-600 border border-l-0 border-slate-200 rounded-r-lg">
              gram
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {COMMON_SCOOPS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleScoopChange(val)}
                className={`px-1.5 py-0.5 text-[10px] rounded-md font-medium transition-colors ${
                  scoopWeight === val
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {val}g
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-600 select-none">
            <input
              type="checkbox"
              checked={autoCalc}
              onChange={(e) => setAutoCalc(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            Tự tính 100g
          </label>
          <button
            type="button"
            onClick={handleRecalculateAll}
            disabled={!scoopGrams}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-40"
          >
            <RefreshCw className="h-3 w-3" />
            Tính lại
          </button>
        </div>
      </div>

      {/* 3. Table Rows */}
      {tableRows.length === 0 ? (
        <div className="text-center py-4 bg-white/70 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Chưa có dòng thành phần nào.</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleSyncFromMetrics}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg hover:bg-indigo-100"
            >
              ⚡ Tạo nhanh từ 5 chỉ số nổi bật
            </button>
            <button
              type="button"
              onClick={() => handleAddRow()}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100"
            >
              + Thêm dòng trống
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-12 gap-2 text-[11px] font-medium text-slate-500 px-1">
            <span className="col-span-5">Tên thành phần</span>
            <span className="col-span-3">Mỗi lần dùng ({scoopWeight || '0'}g)</span>
            <span className="col-span-3">Mỗi 100g (Tự tính)</span>
            <span className="col-span-1 text-center">Xóa</span>
          </div>
          {tableRows.map((row, index) => (
            <div key={row.id || index} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={row.name}
                onChange={(e) => handleUpdateRow(index, 'name', e.target.value)}
                placeholder="vd: Protein, Creatine"
                className="col-span-5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              />
              <input
                type="text"
                value={row.perServing}
                onChange={(e) => handleUpdateRow(index, 'perServing', e.target.value)}
                placeholder="vd: 25g, 110 kcal"
                className="col-span-3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              />
              <input
                type="text"
                value={row.per100g || ''}
                onChange={(e) => handleUpdateRow(index, 'per100g', e.target.value)}
                placeholder="vd: ~83.3g"
                className="col-span-3 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="col-span-1 flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Xóa dòng"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
