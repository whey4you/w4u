-- ==============================================================================
-- WHEY4YOU - MIGRATION 14: ADD CUSTOMER EMAIL TO ORDERS & PENDING CHECKOUTS
-- Lưu trữ địa chỉ email để gửi hóa đơn điện tử và thông báo cập nhật đơn hàng
-- ==============================================================================

-- 1. Bổ sung cột customer_email cho bảng pending_checkouts (bảng tạm chờ thanh toán)
ALTER TABLE public.pending_checkouts
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Bổ sung cột customer_email cho bảng orders (bảng đơn hàng chính thức)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 3. Tạo index tối ưu tra cứu theo email khách hàng
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_customer_email ON public.pending_checkouts(customer_email);
