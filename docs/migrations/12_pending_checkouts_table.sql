-- Migration 12: Pending Checkouts Table (Temporary Staging for Unpaid Orders)
CREATE TABLE IF NOT EXISTS pending_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  numeric_code BIGINT UNIQUE NOT NULL,
  total_amount NUMERIC NOT NULL,
  subtotal NUMERIC,
  shipping_fee NUMERIC,
  carrier_name TEXT,
  payment_method TEXT NOT NULL,
  deposit_amount NUMERIC,
  cod_remaining NUMERIC,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  city_id TEXT,
  district_id TEXT,
  ward_id TEXT,
  province_code TEXT,
  district_code TEXT,
  ward_code TEXT,
  notes TEXT,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 minutes')
);

CREATE INDEX IF NOT EXISTS idx_pending_checkouts_order_code ON pending_checkouts(order_code);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_numeric_code ON pending_checkouts(numeric_code);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_expires_at ON pending_checkouts(expires_at);
