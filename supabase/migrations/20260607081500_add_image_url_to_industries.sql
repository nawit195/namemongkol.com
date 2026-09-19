-- Add image_url column to content_industries to match solutions, brands, etc.
alter table public.content_industries
  add column if not exists image_url text;
