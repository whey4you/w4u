import React from 'react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { OrderManager } from '@/components/features/admin/order-manager';
import { getAdminOrdersAction } from '@/app/actions/admin-order.actions';
import { getAdminProducts } from '@/services/product.service';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const [orders, products] = await Promise.all([
    getAdminOrdersAction(),
    getAdminProducts(),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quản Lý Đơn Hàng"
        subtitle="Tiếp nhận, duyệt đơn mới và cập nhật tiến trình vận chuyển theo thời gian thực"
      />

      <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <OrderManager initialOrders={orders} products={products} />
      </main>
    </div>
  );
}
