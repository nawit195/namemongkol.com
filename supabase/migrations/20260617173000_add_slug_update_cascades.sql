alter table public.content_articles
drop constraint if exists content_articles_category_fkey;

alter table public.content_articles
add constraint content_articles_category_fkey
foreign key (category)
references public.content_article_categories(slug)
on update cascade
on delete restrict;

alter table public.content_brand_category_intros
drop constraint if exists content_brand_category_intros_brand_slug_fkey;

alter table public.content_brand_category_intros
add constraint content_brand_category_intros_brand_slug_fkey
foreign key (brand_slug)
references public.content_brands(slug)
on update cascade
on delete cascade;

alter table public.content_products
drop constraint if exists content_products_brand_slug_fkey;

alter table public.content_products
add constraint content_products_brand_slug_fkey
foreign key (brand_slug)
references public.content_brands(slug)
on update cascade
on delete restrict;
