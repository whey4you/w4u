'use client';

import React from 'react';
import { X, Save, Trash2, Layers, FlaskConical, Palette, Scale, HelpCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { useProductForm, TabType } from './use-product-form';
import { ProductFormGeneral } from './product-form-general';
import { ProductFormMacros } from './product-form-macros';
import { ProductFormFlavors } from './product-form-flavors';
import { ProductFormSizes } from './product-form-sizes';
import { ProductFormFaq } from './product-form-faq';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'Thông Tin & SEO', icon: Layers },
  { id: 'sizes', label: 'Kích Cỡ & Giá', icon: Scale },
  { id: 'macros', label: 'Dinh Dưỡng & HDSD', icon: FlaskConical },
  { id: 'flavors', label: 'Mùi Vị', icon: Palette },
  { id: 'faq', label: 'Hỏi Đáp (Q&A)', icon: HelpCircle },
];

export function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const form = useProductForm({ product, isOpen, onSuccess, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl lg:max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {form.isEditing ? 'Chỉnh Sửa Toàn Diện Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h2>
            <button
              type="button"
              onClick={() => form.setInStock(!form.inStock)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs cursor-pointer shrink-0 ${
                form.inStock
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
              title="Bật/tắt trạng thái kho toàn bộ sản phẩm (Master Switch)"
            >
              <span className={`w-2 h-2 rounded-full ${form.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{form.inStock ? 'Kho: Đang Bán' : 'Kho: Hết Toàn Bộ'}</span>
            </button>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 shrink-0 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-3 sm:px-6 pt-2 bg-slate-50/50 gap-1 sm:gap-2 text-xs font-semibold overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => form.setActiveTab(id)}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                form.activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {label}
                {id === 'sizes' && ` (${form.sizes.length})`}
                {id === 'flavors' && ` (${form.flavors.length})`}
                {id === 'faq' && ` (${form.faq.length})`}
              </span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={form.handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {form.activeTab === 'general' && (
            <ProductFormGeneral
              name={form.name} setName={form.setName}
              slug={form.slug} setSlug={form.setSlug}
              brand={form.brand} setBrand={form.setBrand}
              category={form.category} setCategory={form.setCategory}
              badge={form.badge} setBadge={form.setBadge}
              defaultImage={form.defaultImage} setDefaultImage={form.setDefaultImage}
              images={form.images} setImages={form.setImages}
            />
          )}

          {form.activeTab === 'sizes' && (
            <ProductFormSizes
              sizes={form.sizes}
              setSizes={form.setSizes}
              flavors={form.flavors}
            />
          )}

          {form.activeTab === 'macros' && (
            <ProductFormMacros
              productName={form.name}
              brand={form.brand}
              category={form.category}
              protein={form.protein} setProtein={form.setProtein}
              bcaa={form.bcaa} setBcaa={form.setBcaa}
              calories={form.calories} setCalories={form.setCalories}
              sugar={form.sugar} setSugar={form.setSugar}
              servings={form.servings} setServings={form.setServings}
              proteinLabel={form.proteinLabel} setProteinLabel={form.setProteinLabel}
              bcaaLabel={form.bcaaLabel} setBcaaLabel={form.setBcaaLabel}
              caloriesLabel={form.caloriesLabel} setCaloriesLabel={form.setCaloriesLabel}
              sugarLabel={form.sugarLabel} setSugarLabel={form.setSugarLabel}
              servingsLabel={form.servingsLabel} setServingsLabel={form.setServingsLabel}
              tableRows={form.tableRows} setTableRows={form.setTableRows}
              ingredients={form.ingredients} setIngredients={form.setIngredients}
              allergens={form.allergens} setAllergens={form.setAllergens}
              description={form.description} setDescription={form.setDescription}
              howToUse={form.howToUse} setHowToUse={form.setHowToUse}
              onApplyPreset={form.applyPreset}
            />
          )}

          {form.activeTab === 'flavors' && (
            <ProductFormFlavors
              flavors={form.flavors}
              setFlavors={form.setFlavors}
              availableImages={Array.from(new Set([form.defaultImage, ...form.images])).filter(Boolean)}
            />
          )}

          {form.activeTab === 'faq' && (
            <ProductFormFaq faq={form.faq} setFaq={form.setFaq} />
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {form.isEditing ? (
              <button
                type="button"
                onClick={form.handleDelete}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer order-2 sm:order-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa sản phẩm</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer text-center"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={form.submitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{form.submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
