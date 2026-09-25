'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { Order } from '@/services/order.service';
import { getAdminOrdersAction } from '@/app/actions/admin-order.actions';
import { Product } from '@/types/product';
import { OrderTable } from './order-table';
import { OrderCreateModal } from './order-create-modal';
import { OrderEditModal } from './order-edit-modal';
import { OrderDeleteModal } from './order-delete-modal';

interface OrderManagerProps {
  initialOrders: Order[];
  products?: Product[];
}

const TABS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'pending', label: 'Chờ Duyệt' },
  { id: 'processing', label: 'Đang Xử Lý' },
  { id: 'shipping', label: 'Đang Giao' },
  { id: 'completed', label: 'Hoàn Tất' },
  { id: 'cancelled', label: 'Đã Hủy' },
];

export function OrderManager({ initialOrders, products = [] }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  const refreshData = async () => {
    setRefreshing(true);
    const updated = await getAdminOrdersAction();
    setOrders(updated);
    setEditingOrder((prev) => {
      if (!prev) return null;
      return updated.find((o) => o.id === prev.id) || null;
    });
    setRefreshing(false);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = statusTab === 'all' || o.status === statusTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Tabs & Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {TABS.map((tab) => {
            const isActive = statusTab === tab.id;
            const count =
              tab.id === 'all'
                ? orders.length
                : orders.filter((o) => o.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, New Order & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã đơn, tên, SĐT..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            title="Lên đơn tay cho khách mua trực tiếp / đưa tiền mặt ngoài đời"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lên Đơn Tay</span>
          </button>

          <button
            onClick={refreshData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs flex-shrink-0 cursor-pointer"
            title="Làm mới danh sách đơn từ Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <OrderTable
        orders={filtered}
        onRefresh={refreshData}
        onEditOrder={(order) => setEditingOrder(order)}
        onDeleteOrder={(order) => setDeletingOrder(order)}
      />

      {/* Modals */}
      <OrderCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        products={products}
        onSuccess={refreshData}
      />

      <OrderEditModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        products={products}
        onSuccess={refreshData}
      />

      <OrderDeleteModal
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        order={deletingOrder}
        onEditOrder={(order) => setEditingOrder(order)}
        onDeleted={refreshData}
      />
    </div>
  );
}
