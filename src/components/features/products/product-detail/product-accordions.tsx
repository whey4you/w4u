'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Product } from '@/types/product';
import { getDetailedNutritionTable, getProductAllergenInfo } from '@/lib/nutrition-helpers';
import { ProductMarkdown } from '@/components/ui/product-markdown';
import { FAQ_PRESETS } from '@/lib/faq-presets';

interface ProductAccordionsProps {
  product: Product;
  activeId?: string | null;
}

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function ProductAccordions({ product, activeId: externalActiveId }: ProductAccordionsProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    overview: true,
    nutrition: false,
    usage: false,
    features: false,
    ingredients: false,
    faq: false,
  });

  const toggle = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const detailedTable = getDetailedNutritionTable(product);
  const allergenInfo = getProductAllergenInfo(product);
  const hasCustomTiming = Boolean(
    product.howToUse &&
    (product.howToUse.toLowerCase().includes('thời điểm') || product.howToUse.toLowerCase().includes('lưu ý'))
  );

  // Xác định danh sách FAQ: ưu tiên product.faq đã lưu, nếu chưa có thì lấy preset phù hợp
  const effectiveFaqs = (product.faq && product.faq.length > 0)
    ? product.faq
    : (() => {
        const nameLower = (product.name || '').toLowerCase();
        if (nameLower.includes('creatine')) {
          return FAQ_PRESETS.find((p) => p.id === 'creatine')?.items || [];
        }
        if (product.category === 'vitamins' || nameLower.includes('vitamin')) {
          return FAQ_PRESETS.find((p) => p.id === 'vitamins')?.items || [];
        }
        if (nameLower.includes('pre') || nameLower.includes('c4') || nameLower.includes('pump')) {
          return FAQ_PRESETS.find((p) => p.id === 'preworkout')?.items || [];
        }
        return FAQ_PRESETS.find((p) => p.id === 'whey')?.items || [];
      })();

  const items: AccordionItem[] = [
    {
      id: 'overview',
      title: 'Tổng quan sản phẩm',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <ProductMarkdown
            content={product.description}
            fallback="Dòng sản phẩm bổ sung dinh dưỡng cao cấp, hỗ trợ phát triển và duy trì thể trạng tối ưu."
          />
          {!product.description && (
            <p>Sản xuất theo tiêu chuẩn quốc tế nghiêm ngặt, đảm bảo độ tinh khiết và khả năng hấp thu nhanh chóng.</p>
          )}
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Đặc điểm nổi bật & Chứng nhận',
      content: (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li><strong>Thành phần cao cấp chọn lọc:</strong> Hấp thu tối ưu, hỗ trợ phục hồi và phát triển thể chất bền bỉ.</li>
          <li><strong>Kiểm định chất lượng nghiêm ngặt:</strong> Tiêu chuẩn độc lập, cam kết không chất cấm, độ chuẩn xác dinh dưỡng cao.</li>
          <li><strong>Hương vị tự nhiên, dễ sử dụng:</strong> Công nghệ hòa tan nhanh, đem lại trải nghiệm sử dụng tiện lợi mỗi ngày.</li>
        </ul>
      ),
    },
    {
      id: 'usage',
      title: 'Hướng dẫn sử dụng & Liều lượng',
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <ProductMarkdown
            content={product.howToUse}
            fallback="Pha 1 khẩu phần với 250–300ml nước lọc hoặc sữa tươi không đường. Lắc đều trong 20–30 giây cho tan hoàn toàn rồi thưởng thức."
          />
          {!hasCustomTiming && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">Thời điểm vàng sử dụng:</p>
              <p className="mt-1">1. Ngay sau buổi tập (trong vòng 30–60 phút): Thời điểm cơ thể hấp thu dưỡng chất tốt nhất.</p>
              <p>2. Buổi sáng ngay sau khi thức dậy: Bổ sung nguồn năng lượng cần thiết cho ngày mới.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Bảng thành phần dinh dưỡng chi tiết',
      content: (
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left text-slate-700">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2.5">Thành phần</th>
                <th className="py-2.5 text-right">Mỗi khẩu phần</th>
                <th className="py-2.5 text-right">Mỗi 100g / Quy chuẩn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detailedTable.map((row, index) => (
                <tr key={row.id || `${row.name}-${index}`}>
                  <td className="py-2.5 font-medium text-slate-900">{row.name}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-950">{row.perServing}</td>
                  <td className="py-2.5 text-right text-slate-500">{row.per100g || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'ingredients',
      title: 'Thành phần & Cảnh báo dị ứng',
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <ProductMarkdown content={allergenInfo.ingredients} />
          {allergenInfo.allergens && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="font-semibold mb-1 text-amber-950">⚠️ Lưu ý dị ứng:</p>
              <ProductMarkdown content={allergenInfo.allergens} className="text-xs text-amber-900" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'Câu hỏi thường gặp (FAQ)',
      content: (
        <div className="space-y-4 text-sm text-slate-600">
          {effectiveFaqs.map((faqItem, idx) => (
            <div key={faqItem.id || idx} className="space-y-1">
              <p className="font-semibold text-slate-900 flex items-start gap-1.5">
                <span className="text-blue-600 font-bold flex-shrink-0">{idx + 1}.</span>
                <span>{faqItem.question}</span>
              </p>
              <div className="pl-4 text-slate-600 leading-relaxed border-l-2 border-slate-100 ml-1">
                <ProductMarkdown content={faqItem.answer} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="mt-1 lg:mt-10 divide-y divide-slate-200 border-b border-t border-slate-200" aria-label="Chi tiết thông tin sản phẩm">
      {items.map((item) => {
        const isOpen = openItems[item.id] || (externalActiveId === item.id);
        return (
          <div key={item.id} id={`section-${item.id}`} className="py-4">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between text-left text-base font-semibold text-slate-900 transition hover:text-slate-950"
            >
              <span>{item.title}</span>
              <ChevronDown className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-950' : ''}`} />
            </button>
            {isOpen && <div className="mt-3.5 pt-1 text-slate-600">{item.content}</div>}
          </div>
        );
      })}
    </section>
  );
}
