-- Add SEO columns to content tables that have dedicated pages
-- Tables: content_products, content_articles, content_brands, content_solutions, content_industries

-- ========== content_products ==========
alter table public.content_products add column if not exists seo_title text;
alter table public.content_products add column if not exists seo_description text;
alter table public.content_products add column if not exists seo_keywords text;
alter table public.content_products add column if not exists og_title text;
alter table public.content_products add column if not exists og_description text;
alter table public.content_products add column if not exists og_image_url text;
alter table public.content_products add column if not exists seo_canonical_url text;
alter table public.content_products add column if not exists seo_no_index boolean not null default false;

-- ========== content_articles ==========
-- Note: content_articles already has canonical_url, so we skip seo_canonical_url
alter table public.content_articles add column if not exists seo_title text;
alter table public.content_articles add column if not exists seo_description text;
alter table public.content_articles add column if not exists seo_keywords text;
alter table public.content_articles add column if not exists og_title text;
alter table public.content_articles add column if not exists og_description text;
alter table public.content_articles add column if not exists og_image_url text;
alter table public.content_articles add column if not exists seo_no_index boolean not null default false;

-- ========== content_brands ==========
alter table public.content_brands add column if not exists seo_title text;
alter table public.content_brands add column if not exists seo_description text;
alter table public.content_brands add column if not exists seo_keywords text;
alter table public.content_brands add column if not exists og_title text;
alter table public.content_brands add column if not exists og_description text;
alter table public.content_brands add column if not exists og_image_url text;
alter table public.content_brands add column if not exists seo_canonical_url text;
alter table public.content_brands add column if not exists seo_no_index boolean not null default false;

-- ========== content_solutions ==========
alter table public.content_solutions add column if not exists seo_title text;
alter table public.content_solutions add column if not exists seo_description text;
alter table public.content_solutions add column if not exists seo_keywords text;
alter table public.content_solutions add column if not exists og_title text;
alter table public.content_solutions add column if not exists og_description text;
alter table public.content_solutions add column if not exists og_image_url text;
alter table public.content_solutions add column if not exists seo_canonical_url text;
alter table public.content_solutions add column if not exists seo_no_index boolean not null default false;

-- ========== content_industries ==========
alter table public.content_industries add column if not exists seo_title text;
alter table public.content_industries add column if not exists seo_description text;
alter table public.content_industries add column if not exists seo_keywords text;
alter table public.content_industries add column if not exists og_title text;
alter table public.content_industries add column if not exists og_description text;
alter table public.content_industries add column if not exists og_image_url text;
alter table public.content_industries add column if not exists seo_canonical_url text;
alter table public.content_industries add column if not exists seo_no_index boolean not null default false;
