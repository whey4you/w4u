'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, PhoneCall, ShieldCheck, ExternalLink } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { SPXTrackingResult } from '@/types/spx';
import { trackSPXOrder } from '@/services/spx.service';
import { Order } from '@/services/order.service';
import { lookupOrderAction } from '@/app/actions/order.actions';
import { UnifiedOrderResult } from '@/components/features/orders/unified-order-result';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [spxResult, setSpxResult] = useState<SPXTrackingResult | null>(null);
  const [storeOrder, setStoreOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const executeUnifiedLookup = async (inputCode: string) => {
    const clean = inputCode.trim();
    if (!clean) return;

    setLoading(true);
    setNotFound(false);
    setSpxResult(null);
    setStoreOrder(null);

    const isSpxPrefix = clean.toUpperCase().startsWith('SPX');

    try {
      if (isSpxPrefix) {
        // Nếu nhập mã SPX: tìm kiếm cả lộ trình bưu cục và đơn hàng trong hệ thống
        const [spx, order] = await Promise.all([
          trackSPXOrder(clean),
          lookupOrderAction(clean),
        ]);

        if (spx && spx.success) setSpxResult(spx);
        if (order) setStoreOrder(order as Order);

        if (!order && (!spx || !spx.success)) {
          setNotFound(true);
        }
      } else {
        // Nhập mã đơn Whey4You (W4U...), SĐT hoặc mã AllinGo
        const order = await lookupOrderAction(clean);

        if (order) {
          setStoreOrder(order as Order);
          // Tự động kiểm tra nạp hành trình SPX nếu đơn hàng đã có mã vận đơn
          const carrierCode = order.tracking_code;
          if (carrierCode && carrierCode.toUpperCase().startsWith('SPX')) {
            const spx = await trackSPXOrder(carrierCode);
            if (spx && spx.success) setSpxResult(spx);
          }
        } else {
          // Fallback: nếu không tìm thấy đơn nhưng có thể là mã vận đơn độc lập
          const spx = await trackSPXOrder(clean);
          if (spx && spx.success) {
            setSpxResult(spx);
          } else {
            setNotFound(true);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi tra cứu:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('q');
    if (code) {
      const clean = code.trim();
      setQuery(clean);
      executeUnifiedLookup(clean);
    }
  }, [searchParams]);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeUnifiedLookup(query);
  };

  const getCodeHint = () => {
    const q = query.trim().toUpperCase();
    if (!q) return null;
    if (q.startsWith('W4U')) return '🧾 Nhận diện: Mã đơn hàng / Hóa đơn Whey4You';
    if (q.startsWith('SPX')) return '🚚 Nhận diện: Mã vận đơn bưu cục';
    if (/^[0-9]{9,11}$/.test(q)) return '📱 Nhận diện: Số điện thoại người nhận';
    return null;
  };

  const codeHint = getCodeHint();

  return (
    <div className="space-y-8">
      {/* Khung tìm kiếm duy nhất */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-black/[0.06] max-w-2xl mx-auto">
        <form onSubmit={handleLookup} className="space-y-3">
          <label htmlFor="order-search" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mã đơn hàng, số điện thoại hoặc mã vận đơn
          </label>
          <div className="relative">
            <input
              id="order-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: W4U-98421, 0909xxxxxx hoặc SPXVN..."
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

          {codeHint && (
            <p className="text-[11px] font-semibold text-emerald-600 animate-in fade-in">
              {codeHint}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-apple-blue text-white font-medium text-sm hover:bg-apple-blue-hover transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Tra Cứu Đơn Hàng & Vận Đơn</span>
          </button>
        </form>

        {/* Thông báo không tìm thấy */}
        {notFound && (
          <div className="mt-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center text-xs text-amber-800 space-y-2">
            <p>
              Không tìm thấy thông tin tương ứng với <strong>&quot;{query}&quot;</strong>. Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại.
            </p>
            {query.trim().toUpperCase().startsWith('ALG') && (
              <a
                href={`https://business.allingo.vn/track/${encodeURIComponent(query.trim())}#/track/${encodeURIComponent(query.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-apple-blue hover:underline"
              >
                <span>Mở cổng tra cứu bưu tá</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Support Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-apple-blue shrink-0" />
            <span>Hotline hỗ trợ: <strong>1900 8888</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-apple-blue shrink-0" />
            <span>Bảo hiểm 100% khi vận chuyển</span>
          </div>
        </div>
      </div>

      {/* Hiển thị song song 2 cột kết quả: Hóa đơn & Hành trình */}
      {(storeOrder || spxResult) && (
        <div className="pt-2">
          <UnifiedOrderResult order={storeOrder} spxResult={spxResult} />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-apple-canvas py-10 sm:py-14">
      <Container className="max-w-6xl">
        <div className="text-center space-y-2.5 mb-8">
          <p className="text-xs font-bold tracking-widest text-apple-subhead uppercase">
            HỆ THỐNG TRA CỨU HÀNH TRÌNH & HÓA ĐƠN
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-apple-dark">
            Kiểm tra trạng thái đơn hàng.
          </h1>
          <p className="text-sm text-apple-subhead max-w-lg mx-auto">
            Nhập mã đơn hàng hoặc số điện thoại để xem đồng thời hóa đơn điện tử và lộ trình giao hàng thời gian thực.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-black/[0.06] max-w-2xl mx-auto">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-apple-blue" />
          </div>
        }>
          <OrdersContent />
        </Suspense>
      </Container>
    </main>
  );
}
