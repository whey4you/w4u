import { Product } from '@/types/product';
import { getProductQuickMetrics } from '@/lib/nutrition-helpers';
import { ProductMarkdown } from '@/components/ui/product-markdown';

interface ProductTabsProps {
  product: Product;
}

const CATEGORY_LABELS = {
  whey: 'Whey protein',
  strength: 'Sức mạnh & sức bền',
  vitamins: 'Vitamin & khoáng chất',
};

export function ProductTabs({ product }: ProductTabsProps) {
  const quickMetrics = getProductQuickMetrics(product);
  const nutritionRows = [
    ...quickMetrics.map((m) => [m.label, m.value]),
    [product.macros.servingsLabel || 'Số lần dùng', String(product.macros.servings || 60)],
  ];

  return (
    <section className="border-t border-slate-200 pt-12 sm:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-apple-blue">
              Tổng quan
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-apple-dark">
              Thông tin sản phẩm
            </h2>
            <div className="mt-5 text-base leading-8 text-slate-600">
              <ProductMarkdown
                content={product.description}
                fallback="Thông tin chi tiết của sản phẩm đang được cập nhật."
              />
            </div>
          </article>

          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-apple-blue">
              Cách sử dụng
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-apple-dark">
              Dùng đúng cho lịch tập của bạn
            </h2>
            <div className="mt-4 text-base leading-8 text-slate-600">
              <ProductMarkdown
                content={product.howToUse}
                fallback="Hướng dẫn sử dụng đang được cập nhật."
              />
            </div>
          </article>
        </div>

        <aside className="lg:col-span-5">
          <div className="border-t-2 border-apple-blue lg:sticky lg:top-24">
            <div className="border-b border-slate-200 py-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Danh mục</p>
              <p className="mt-2 text-lg font-semibold text-apple-dark">
                {CATEGORY_LABELS[product.category]}
              </p>
            </div>
            <dl>
              {nutritionRows.map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-slate-100 py-3 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right text-sm font-semibold text-apple-dark">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Thành phần dinh dưỡng có thể thay đổi theo hương vị và kích cỡ. Kiểm tra nhãn sản phẩm trước khi sử dụng.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
