'use client';

import React, { useState } from 'react';
import { Search, Loader2, Truck, ShoppingBag, PhoneCall, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SPXTrackingResult } from '@/types/spx';
import { trackSPXOrder } from '@/services/spx.service';
import { Order, getOrderByCodeOrPhone } from '@/services/order.service';
import { SPXTrackingView } from '@/components/features/orders/spx-tracking-view';
import { StoreOrderView } from '@/components/features/orders/store-order-view';

type TabMode = 'spx' | 'store';

export default function OrdersPage() {
  const [tab, setTab] = useState<TabMode>('spx');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [spxResult, setSpxResult] = useState<SPXTrackingResult | null>(null);
  const [storeOrder, setStoreOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const executeSpxLookup = async (code: string) => {
    setLoading(true);
    setNotFound(false);
    setStoreOrder(null);
    setTab('spx');

    const result = await trackSPXOrder(code);
    setSpxResult(result);
    setLoading(false);
  };

  const executeStoreLookup = async (code: string) => {
    setLoading(true);
    setNotFound(false);
    setSpxResult(null);

    const order = await getOrderByCodeOrPhone(code);
    if (order) {
      setStoreOrder(order);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (tab === 'spx' || clean.toUpperCase().startsWith('SPX')) {
      await executeSpxLookup(clean);
    } else {
      await executeStoreLookup(clean);
    }
  };

  return (
    <main className="min-h-screen bg-apple-canvas py-12 sm:py-16">
      <Container className="max-w-2xl">
        <div className="text-center space-y-3 mb-8">
          <p className="text-xs font-semibold tracking-widest text-apple-subhead uppercase">
            HỆ THỐNG TRA CỨU HÀNH TRÌNH
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-apple-dark">
            Kiểm tra trạng thái đơn hàng.
          </h1>
          <p className="text-sm text-apple-subhead max-w-md mx-auto">
            Nhập mã vận đơn SPX Express hoặc số điện thoại để theo dõi lộ trình thời gian thực.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/70 border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => { setTab('spx'); setNotFound(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                tab === 'spx'
                  ? 'bg-white text-apple-blue font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Vận đơn SPX Express
            </button>
            <button
              type="button"
              onClick={() => { setTab('store'); setNotFound(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                tab === 'store'
                  ? 'bg-white text-apple-blue font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Đơn hàng Whey4You
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/[0.06] space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label htmlFor="order-code" className="block text-xs font-semibold text-slate-600 mb-2 uppercase">
                {tab === 'spx' ? 'Mã vận đơn SPX (Ví dụ: SPXVN...)' : 'Mã đơn hàng hoặc Số điện thoại'}
              </label>
              <div className="relative">
                <input
                  id="order-code"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === 'spx' ? 'Nhập mã SPXVN065556900369...' : 'Ví dụ: W4U-98421 hoặc 0909xxxxxx'}
                  required
                  className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-apple-blue focus:bg-white text-apple-dark text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-apple-blue text-white p-2 rounded-xl hover:bg-apple-blue-hover transition-colors disabled:opacity-50"
                  aria-label="Tra cứu"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-apple-blue text-white font-medium text-sm hover:bg-apple-blue-hover transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {tab === 'spx' ? 'Tra Cứu Vận Đơn SPX' : 'Tra Cứu Đơn Hàng Whey4You'}
            </button>
          </form>

          {/* Results Display */}
          {spxResult && (
            <div className="pt-4 border-t border-slate-100">
              <SPXTrackingView result={spxResult} />
            </div>
          )}

          {storeOrder && (
            <div className="pt-4 border-t border-slate-100">
              <StoreOrderView order={storeOrder} />
            </div>
          )}

          {notFound && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center text-xs text-amber-800">
              Không tìm thấy thông tin đơn hàng tương ứng với <strong>&quot;{query}&quot;</strong>. Vui lòng kiểm tra lại mã hoặc số điện thoại.
            </div>
          )}

          {/* Support Banner */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-apple-blue flex-shrink-0" />
              <span>Hotline hỗ trợ: <strong>1900 8888</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-apple-blue flex-shrink-0" />
              <span>Bảo hiểm 100% khi vận chuyển</span>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
