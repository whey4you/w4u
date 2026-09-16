-- ==============================================================================
-- WHEY4YOU - SUPABASE DATABASE INITIAL SCHEMA & SEED DATA
-- Chạy script này trực tiếp trong Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. BẢNG SẢN PHẨM (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('whey', 'strength', 'vitamins')),
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_percent NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  default_image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}'::TEXT[],
  in_stock BOOLEAN DEFAULT true,
  slug TEXT UNIQUE,
  description TEXT,
  how_to_use TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG THÔNG SỐ DINH DƯỠNG (PRODUCT_MACROS)
CREATE TABLE IF NOT EXISTS public.product_macros (
  product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  protein TEXT NOT NULL,
  bcaa TEXT,
  calories TEXT,
  sugar TEXT,
  servings INTEGER DEFAULT 1
);

-- 3. BẢNG HƯƠNG VỊ SẢN PHẨM (PRODUCT_FLAVORS)
CREATE TABLE IF NOT EXISTS public.product_flavors (
  id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  image TEXT,
  PRIMARY KEY (product_id, id)
);

-- 4. BẢNG KÍCH CỠ / BIẾN THỂ GIÁ (PRODUCT_SIZES)
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  flavor_prices JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, id)
);

-- Đồng bộ an toàn cho database đã được tạo từ schema cũ
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::TEXT[];

-- 5. BẢNG MỤC TIÊU TẬP LUYỆN (PRODUCT_GOALS)
CREATE TABLE IF NOT EXISTS public.product_goals (
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  PRIMARY KEY (product_id, goal)
);

-- 6. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipping', 'completed', 'cancelled')),
  payment_method TEXT DEFAULT 'cod',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  flavor_name TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  image TEXT
);

-- 8. BẢNG BÀI VIẾT (BLOGS)
CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT DEFAULT 'Whey4You Expert',
  category TEXT DEFAULT 'Dinh dưỡng',
  read_time TEXT DEFAULT '5 phút',
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- TẠO CHỈ MỤC TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);

-- BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- POLICIES CHO PUBLIC CLIENT (KHÁCH XEM HÀNG & ĐẶT ĐƠN)
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can read macros" ON public.product_macros FOR SELECT USING (true);
CREATE POLICY "Public can read flavors" ON public.product_flavors FOR SELECT USING (true);
CREATE POLICY "Public can read sizes" ON public.product_sizes FOR SELECT USING (true);
CREATE POLICY "Public can read goals" ON public.product_goals FOR SELECT USING (true);
CREATE POLICY "Public can read blogs" ON public.blogs FOR SELECT USING (true);

-- Khách hàng tạo đơn và xem đơn hàng theo số điện thoại / mã đơn
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own order by code" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can read order items" ON public.order_items FOR SELECT USING (true);

-- POLICIES CHO SERVICE ROLE / ADMIN (TOÀN QUYỀN CRUD)
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin full access macros" ON public.product_macros FOR ALL USING (true);
CREATE POLICY "Admin full access flavors" ON public.product_flavors FOR ALL USING (true);
CREATE POLICY "Admin full access sizes" ON public.product_sizes FOR ALL USING (true);
CREATE POLICY "Admin full access goals" ON public.product_goals FOR ALL USING (true);
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin full access order items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Admin full access blogs" ON public.blogs FOR ALL USING (true);

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ==============================================================================
INSERT INTO public.products (id, name, brand, category, price, original_price, discount_percent, rating, review_count, badge, default_image, in_stock)
VALUES
('r1-protein-5lbs', 'Rule 1 Protein Isolate 5lbs (71 Lần Dùng)', 'RULE ONE PROTEINS', 'whey', 1550000, 1750000, 12, 4.9, 148, 'Bán Chạy Nhất', '/products/r1-protein.jpg', true),
('iso-100-5lbs', 'Dymatize ISO 100 Hydrolyzed 5lbs', 'DYMATIZE NUTRITION', 'whey', 1980000, 2200000, 10, 5.0, 96, 'Chuẩn Thủy Phân', '/products/iso100.jpg', true),
('mutant-mass-15lbs', 'Mutant Mass Gainer 15lbs Cỡ Đại', 'MUTANT', 'strength', 1720000, 1950000, 12, 4.8, 210, 'Tăng Cân Siêu Tốc', '/products/mutant-mass.jpg', true),
('on-creatine-300g', 'Optimum Nutrition Micronized Creatine 300g', 'OPTIMUM NUTRITION', 'strength', 540000, 600000, 10, 4.9, 85, 'Tăng Sức Mạnh', '/products/on-creatine.jpg', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_macros (product_id, protein, bcaa, calories, sugar, servings)
VALUES
('r1-protein-5lbs', '25g', '6.0g', '110', '0g', 71),
('iso-100-5lbs', '25g', '5.5g', '120', '< 1g', 73),
('mutant-mass-15lbs', '56g', '12g', '1100', '18g', 32),
('on-creatine-300g', '0g', '0g', '0', '0g', 60)
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO public.product_flavors (product_id, id, name, color_hex)
VALUES
('r1-protein-5lbs', 'choco', 'Chocolate Fudge', '#4A2810'),
('r1-protein-5lbs', 'vanilla', 'Vanilla Butter Cake', '#EED9A4'),
('r1-protein-5lbs', 'strawberry', 'Strawberry Delight', '#E25565'),
('iso-100-5lbs', 'gourmet-choco', 'Gourmet Chocolate', '#3D1C06'),
('iso-100-5lbs', 'cookies-cream', 'Cookies & Cream', '#6B6865')
ON CONFLICT (product_id, id) DO NOTHING;

INSERT INTO public.product_goals (product_id, goal)
VALUES
('r1-protein-5lbs', 'lean-muscle'),
('r1-protein-5lbs', 'fat-loss'),
('iso-100-5lbs', 'lean-muscle'),
('iso-100-5lbs', 'fat-loss'),
('mutant-mass-15lbs', 'mass-gaining'),
('on-creatine-300g', 'strength')
ON CONFLICT (product_id, goal) DO NOTHING;
