import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, PlusCircle } from 'lucide-react';
import { AdminHeader } from '@/components/features/admin/admin-header';
import { DashboardStats } from '@/components/features/admin/dashboard-stats';
import { RecentOrdersCard } from '@/components/features/admin/recent-orders-card';
import { getAdminProducts } from '@/services/product.service';
import { getAdminOrdersAction, getAdminOrderStatsAction } from '@/app/actions/admin-order.actions';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, orders, stats] = await Promise.all([
    getAdminProducts(),
    getAdminOrdersAction(),
    getAdminOrderStatsAction(),
  ]);

  const outOfStockCount = products.filter((p) => !p.inStock).length;

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Tổng Quan Quản Trị"
        subtitle="Theo dõi chỉ số kinh doanh, tình trạng kho & đơn hàng thời gian thực"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quản lý Kho</span>
            </Link>
          </div>
        }
      />

      <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
        {/* Metric Cards */}
        <DashboardStats
          totalRevenue={stats.totalRevenue}
          pendingOrders={stats.pendingOrders}
          totalProducts={products.length}
          outOfStockCount={outOfStockCount}
        />

        {/* Quick Navigation Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          <Link
            href="/admin/products"
            className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="inline-flex p-2 sm:p-2.5 rounded-xl bg-blue-500/20 text-blue-400 mb-2 sm:mb-3">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold">Danh Mục Sản Phẩm</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2">
                Bật/tắt trạng thái Còn hàng, điều chỉnh giá bán và cập nhật kho
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 group-hover:bg-blue-600 transition-colors shrink-0">
              Truy cập →
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div>
              <div className="inline-flex p-2 sm:p-2.5 rounded-xl bg-purple-500/20 text-purple-400 mb-2 sm:mb-3">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold">Quản Lý Đơn Hàng</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2">
                Duyệt đơn mới, cập nhật trạng thái vận chuyển và xem chi tiết giỏ hàng
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 group-hover:bg-purple-600 transition-colors shrink-0">
              Truy cập →
            </span>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersCard orders={orders} />
      </main>
    </div>
  );
}
