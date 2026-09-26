import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { ProductManager } from '@/components/features/admin/product-manager';
import { getAdminProducts } from '@/services/product.service';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Kho & Sản Phẩm"
        subtitle="Kiểm soát trạng thái còn/hết hàng, cập nhật giá bán và thông số dinh dưỡng"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <ProductManager initialProducts={products} />
      </main>
    </div>
  );
}
