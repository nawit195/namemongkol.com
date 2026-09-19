alter table public.content_industries
add column if not exists image_url text;

create unique index if not exists content_products_slug_idx
on public.content_products(slug);

create unique index if not exists content_articles_article_id_key
on public.content_articles(article_id);

create index if not exists content_brand_category_intros_brand_slug_idx
on public.content_brand_category_intros(brand_slug);
