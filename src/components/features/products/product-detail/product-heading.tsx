import { ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductHeadingProps {
  product: Product;
}

export function ProductHeading({ product }: ProductHeadingProps) {
  return (
    <header className="space-y-2.5">
      {/* 1. Category & Quality Cert Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          Informed Choice
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Chính hãng 100%
        </span>
        <span className="rounded-full bg-apple-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-apple-blue">
          {product.brand}
        </span>
      </div>

      {/* Product Title H1 */}
      <h1 className="text-2xl font-bold tracking-tight text-apple-dark sm:text-3xl">
        {product.name}
      </h1>

      {/* 4. Subtitle / Value Note */}
      <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
        Dòng sản phẩm bổ sung đạm tinh khiết bán chạy hàng đầu, hỗ trợ phục hồi và phát triển cơ bắp nạc tối đa.
      </p>
    </header>
  );
}
