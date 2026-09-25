-- Migration 11: Add weight_grams column to order_items
ALTER TABLE IF EXISTS order_items 
ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 1000;
