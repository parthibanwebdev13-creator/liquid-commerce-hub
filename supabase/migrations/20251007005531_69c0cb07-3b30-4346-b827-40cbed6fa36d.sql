-- Add featured_in_offers column to products table
ALTER TABLE public.products
ADD COLUMN featured_in_offers boolean NOT NULL DEFAULT false;