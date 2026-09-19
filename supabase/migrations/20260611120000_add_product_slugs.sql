alter table public.content_products add column if not exists slug text;

update public.content_products
set slug = lower(regexp_replace(regexp_replace(coalesce(brand, 'product') || ' ' || product_id, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
where slug is null or slug = '';

alter table public.content_products alter column slug set not null;

create unique index if not exists content_products_slug_key
on public.content_products(slug);

create index if not exists content_products_product_id_idx
on public.content_products(product_id);

create index if not exists content_articles_article_id_idx
on public.content_articles(article_id);
