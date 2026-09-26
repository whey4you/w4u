import { useState, useEffect } from 'react';
import { Product, ProductFlavor, ProductSize, NutritionTableRow, ProductFAQ } from '@/types/product';
import { createProduct, updateProduct, deleteProduct } from '@/services/product.mutations';
import { CATEGORY_MACRO_PRESETS } from '@/lib/nutrition-helpers';

export type TabType = 'general' | 'sizes' | 'macros' | 'flavors' | 'faq';

interface UseProductFormParams {
  product?: Product | null;
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const DEFAULT_FLAVORS: ProductFlavor[] = [
  { id: 'choco', name: 'Chocolate Fudge', colorHex: '#4A2810' },
];

export function useProductForm({ product, isOpen, onSuccess, onClose }: UseProductFormParams) {
  const isEditing = Boolean(product);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<'whey' | 'strength' | 'vitamins'>('whey');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [defaultImage, setDefaultImage] = useState('/products/r1-protein.jpg');
  const [images, setImages] = useState<string[]>([]);
  const [weightKg, setWeightKg] = useState('1.0');

  // Macro & Nutrition State
  const [proteinLabel, setProteinLabel] = useState('Protein / Lần Dùng');
  const [protein, setProtein] = useState('25g');
  const [bcaaLabel, setBcaaLabel] = useState('Hàm Lượng BCAA');
  const [bcaa, setBcaa] = useState('6.0g');
  const [caloriesLabel, setCaloriesLabel] = useState('Năng Lượng');
  const [calories, setCalories] = useState('110');
  const [sugarLabel, setSugarLabel] = useState('Hàm Lượng Đường');
  const [sugar, setSugar] = useState('0g');
  const [servingsLabel, setServingsLabel] = useState('Số Lần Dùng');
  const [servings, setServings] = useState('70');
  const [tableRows, setTableRows] = useState<NutritionTableRow[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');

  const [description, setDescription] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [flavors, setFlavors] = useState<ProductFlavor[]>(DEFAULT_FLAVORS);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [faq, setFaq] = useState<ProductFAQ[]>([]);

  const applyPreset = (type: 'whey' | 'strength' | 'vitamins') => {
    const p = CATEGORY_MACRO_PRESETS[type];
    setProteinLabel(p.labels.protein);
    setProtein(p.defaults.protein);
    setBcaaLabel(p.labels.bcaa);
    setBcaa(p.defaults.bcaa);
    setCaloriesLabel(p.labels.calories);
    setCalories(p.defaults.calories);
    setSugarLabel(p.labels.sugar);
    setSugar(p.defaults.sugar);
    setServingsLabel(p.labels.servings);
    setServings(String(p.defaults.servings));
    setTableRows(p.defaultTable);
    setIngredients(p.defaultIngredients);
    setAllergens(p.defaultAllergens);
  };

  useEffect(() => {
    if (product) {
      const cat = product.category || 'whey';
      const preset = CATEGORY_MACRO_PRESETS[cat] || CATEGORY_MACRO_PRESETS.whey;

      setName(product.name || '');
      setSlug(product.slug || product.id || '');
      setBrand(product.brand || '');
      setCategory(cat);
      setPrice(product.price ? String(product.price) : '');
      setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
      setBadge(product.badge || '');
      setWeightKg(product.weightKg ? String(product.weightKg) : '1.0');
      setDefaultImage(product.defaultImage || '/products/r1-protein.jpg');
      setImages(product.images || []);

      setProteinLabel(product.macros?.proteinLabel || preset.labels.protein);
      setProtein(product.macros?.protein || preset.defaults.protein);
      setBcaaLabel(product.macros?.bcaaLabel || preset.labels.bcaa);
      setBcaa(product.macros?.bcaa || preset.defaults.bcaa);
      setCaloriesLabel(product.macros?.caloriesLabel || preset.labels.calories);
      setCalories(product.macros?.calories || preset.defaults.calories);
      setSugarLabel(product.macros?.sugarLabel || preset.labels.sugar);
      setSugar(product.macros?.sugar || preset.defaults.sugar);
      setServingsLabel(product.macros?.servingsLabel || preset.labels.servings);
      setServings(product.macros?.servings ? String(product.macros.servings) : String(preset.defaults.servings));
      setTableRows(product.macros?.nutritionTable || preset.defaultTable);
      setIngredients(product.macros?.ingredients || preset.defaultIngredients);
      setAllergens(product.macros?.allergens || preset.defaultAllergens);

      setDescription(product.description || '');
      setHowToUse(product.howToUse || '');
      setFlavors(product.flavors?.length ? product.flavors : [{ id: 'std', name: 'Tiêu Chuẩn', colorHex: '#0071e3' }]);
      setSizes(product.sizes || []);
      setFaq(product.faq || []);
    } else {
      setName('');
      setSlug('');
      setBrand('');
      setCategory('whey');
      setPrice('');
      setOriginalPrice('');
      setBadge('');
      setWeightKg('1.0');
      setDefaultImage('/products/r1-protein.jpg');
      setImages([]);
      applyPreset('whey');
      setDescription('');
      setHowToUse('');
      setFlavors(DEFAULT_FLAVORS);
      setSizes([]);
      setFaq([]);
    }
    setActiveTab('general');
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const effectivePrice = sizes.length > 0 ? sizes[0].price : (Number(price) || 0);
    const effectiveOrigPrice = sizes.length > 0 ? sizes[0].originalPrice : (originalPrice ? Number(originalPrice) : undefined);

    const payload: Partial<Product> = {
      name,
      slug,
      brand,
      category,
      price: effectivePrice,
      originalPrice: effectiveOrigPrice,
      badge: badge || undefined,
      weightKg: Number(weightKg) > 0 ? Number(weightKg) : 1.0,
      defaultImage: defaultImage || '/products/r1-protein.jpg',
      images,
      description,
      howToUse,
      macros: {
        protein,
        bcaa,
        calories,
        sugar,
        servings: Number(servings) || 50,
        proteinLabel,
        bcaaLabel,
        caloriesLabel,
        sugarLabel,
        servingsLabel,
        nutritionTable: tableRows,
        ingredients,
        allergens,
      },
      flavors,
      sizes,
      faq,
    };

    const result = isEditing && product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    setSubmitting(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert(result.error || 'Không thể lưu sản phẩm. Vui lòng kiểm tra lại!');
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) return;
    const result = await deleteProduct(product.id);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert(result.error || 'Không thể xóa sản phẩm.');
    }
  };

  return {
    isEditing,
    activeTab,
    setActiveTab,
    submitting,
    name, setName,
    slug, setSlug,
    brand, setBrand,
    category, setCategory,
    badge, setBadge,
    weightKg, setWeightKg,
    defaultImage, setDefaultImage,
    images, setImages,
    protein, setProtein,
    proteinLabel, setProteinLabel,
    bcaa, setBcaa,
    bcaaLabel, setBcaaLabel,
    calories, setCalories,
    caloriesLabel, setCaloriesLabel,
    sugar, setSugar,
    sugarLabel, setSugarLabel,
    servings, setServings,
    servingsLabel, setServingsLabel,
    tableRows, setTableRows,
    ingredients, setIngredients,
    allergens, setAllergens,
    applyPreset,
    description, setDescription,
    howToUse, setHowToUse,
    flavors, setFlavors,
    sizes, setSizes,
    faq, setFaq,
    handleSubmit,
    handleDelete,
  };
}
