-- ==============================================================================
-- WHEY4YOU - MIGRATION 15: HARDENED ROW-LEVEL SECURITY (RLS) POLICIES
-- Chạy script này trực tiếp trong Supabase SQL Editor (Dashboard > SQL Editor)
-- Ngăn chặn triệt để nguy cơ bypass qua Anon Key ở trình duyệt (chống rò rỉ đơn hàng, sửa giá, sửa coupon)
-- ==============================================================================

-- 1. BẢNG SẢN PHẨM & BIẾN THỂ (PRODUCTS, MACROS, FLAVORS, SIZES, GOALS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_goals ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ và mới (idempotent)
DROP POLICY IF EXISTS "Admin full access products" ON public.products;
DROP POLICY IF EXISTS "Admin full access macros" ON public.product_macros;
DROP POLICY IF EXISTS "Admin full access flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Admin full access sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Admin full access goals" ON public.product_goals;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Public can read macros" ON public.product_macros;
DROP POLICY IF EXISTS "Public can read flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Public can read sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Public can read goals" ON public.product_goals;
DROP POLICY IF EXISTS "Admin full access product_sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Public read product_sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Public read macros" ON public.product_macros;
DROP POLICY IF EXISTS "Public read flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Public read sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Public read goals" ON public.product_goals;
DROP POLICY IF EXISTS "Service role full access products" ON public.products;
DROP POLICY IF EXISTS "Service role full access macros" ON public.product_macros;
DROP POLICY IF EXISTS "Service role full access flavors" ON public.product_flavors;
DROP POLICY IF EXISTS "Service role full access sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Service role full access goals" ON public.product_goals;

-- Khách vãng lai chỉ được SELECT (Xem danh mục hàng hóa)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read macros" ON public.product_macros FOR SELECT USING (true);
CREATE POLICY "Public read flavors" ON public.product_flavors FOR SELECT USING (true);
CREATE POLICY "Public read sizes" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Public read goals" ON public.product_goals FOR SELECT USING (true);

-- Toàn quyền Thêm/Sửa/Xóa CHỈ DÀNH RIÊNG cho Backend qua Service Role
CREATE POLICY "Service role full access products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access macros" ON public.product_macros FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access flavors" ON public.product_flavors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access sizes" ON public.product_sizes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access goals" ON public.product_goals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. BẢNG BÀI VIẾT (BLOGS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public can read blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public read blogs" ON public.blogs;
DROP POLICY IF EXISTS "Service role full access blogs" ON public.blogs;

CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Service role full access blogs" ON public.blogs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. BẢNG MÃ GIẢM GIÁ (COUPONS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin full access coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Service role full access coupons" ON public.coupons;

-- Chỉ cho phép khách đọc các mã đang kích hoạt
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access coupons" ON public.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. BẢNG HERO BANNERS & THƯ VIỆN ẢNH (HERO_BANNERS, MEDIA_LIBRARY)
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin write hero_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Public read hero_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Service role full access hero_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Full Access for Admin on media_library" ON public.media_library;
DROP POLICY IF EXISTS "Public Read Access for media_library" ON public.media_library;
DROP POLICY IF EXISTS "Public read media_library" ON public.media_library;
DROP POLICY IF EXISTS "Service role full access media_library" ON public.media_library;

CREATE POLICY "Public read hero_banners" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Service role full access hero_banners" ON public.hero_banners FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Public read media_library" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Service role full access media_library" ON public.media_library FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. BẢNG ĐƠN HÀNG CHỜ THANH TOÁN (PENDING_CHECKOUTS)
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access pending_checkouts" ON public.pending_checkouts;
CREATE POLICY "Service role full access pending_checkouts" ON public.pending_checkouts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. BẢNG ĐƠN HÀNG CHÍNH THỨC & CHI TIẾT (ORDERS, ORDER_ITEMS)
-- Chặn đứng hoàn toàn việc dùng Anon Key để dump danh sách khách hàng
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
DROP POLICY IF EXISTS "Admin full access order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can read own order by code" ON public.orders;
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access order items" ON public.order_items;

-- Mọi thao tác ghi/đọc nhạy cảm trên orders và order_items bắt buộc đi qua Service Role (Next.js Server Actions & API Webhook)
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access order items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. HÀM DỌN DẸP BẢN GHI RÁC TRONG PENDING_CHECKOUTS (CHẠY ĐỊNH KỲ HOẶC QUA CRON)
CREATE OR REPLACE FUNCTION public.cleanup_expired_pending_checkouts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_rows integer;
BEGIN
  DELETE FROM public.pending_checkouts
  WHERE created_at < NOW() - INTERVAL '2 hours';
  
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  RETURN deleted_rows;
END;
$$;

