create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.content_article_categories (
  slug text primary key,
  label text not null,
  image_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_brands (
  slug text primary key,
  name text not null,
  category text not null,
  description text not null,
  color text,
  image_url text,
  logo_url text,
  accent jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_brand_category_intros (
  category_id text primary key,
  brand_slug text not null references public.content_brands(slug) on delete cascade,
  tagline text not null,
  description text not null,
  highlights jsonb not null default '[]'::jsonb,
  best_for jsonb not null default '[]'::jsonb,
  origin text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_solutions (
  slug text primary key,
  title text not null,
  icon text,
  description text not null,
  image_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_industries (
  slug text primary key,
  title text not null,
  icon text,
  description text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_nav_items (
  id text primary key,
  parent_id text references public.content_nav_items(id) on delete cascade,
  depth integer not null default 0,
  sort_order integer not null default 0,
  label text not null,
  href text not null,
  description text,
  image_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_articles (
  slug text primary key,
  article_id integer not null unique,
  title text not null,
  category text not null references public.content_article_categories(slug) on delete restrict,
  excerpt text not null,
  published_date date,
  read_min integer,
  canonical_url text,
  cover_image_url text,
  blocks jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_products (
  product_id text primary key,
  name text not null,
  image_url text,
  price_text text,
  source_url text,
  brand text not null,
  brand_slug text not null references public.content_brands(slug) on delete restrict,
  brand_category_id text,
  description_text text,
  description_html text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_nav_items_parent_sort_idx
on public.content_nav_items(parent_id, sort_order);

create index if not exists content_articles_category_idx
on public.content_articles(category);

create index if not exists content_products_brand_slug_idx
on public.content_products(brand_slug);

create index if not exists content_products_brand_category_id_idx
on public.content_products(brand_category_id);

drop trigger if exists set_content_article_categories_updated_at on public.content_article_categories;
create trigger set_content_article_categories_updated_at
before update on public.content_article_categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_brands_updated_at on public.content_brands;
create trigger set_content_brands_updated_at
before update on public.content_brands
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_brand_category_intros_updated_at on public.content_brand_category_intros;
create trigger set_content_brand_category_intros_updated_at
before update on public.content_brand_category_intros
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_solutions_updated_at on public.content_solutions;
create trigger set_content_solutions_updated_at
before update on public.content_solutions
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_industries_updated_at on public.content_industries;
create trigger set_content_industries_updated_at
before update on public.content_industries
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_nav_items_updated_at on public.content_nav_items;
create trigger set_content_nav_items_updated_at
before update on public.content_nav_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_articles_updated_at on public.content_articles;
create trigger set_content_articles_updated_at
before update on public.content_articles
for each row
execute function public.set_updated_at();

drop trigger if exists set_content_products_updated_at on public.content_products;
create trigger set_content_products_updated_at
before update on public.content_products
for each row
execute function public.set_updated_at();

grant select on public.content_article_categories to anon, authenticated;
grant select on public.content_brands to anon, authenticated;
grant select on public.content_brand_category_intros to anon, authenticated;
grant select on public.content_solutions to anon, authenticated;
grant select on public.content_industries to anon, authenticated;
grant select on public.content_nav_items to anon, authenticated;
grant select on public.content_articles to anon, authenticated;
grant select on public.content_products to anon, authenticated;

grant all on public.content_article_categories to service_role;
grant all on public.content_brands to service_role;
grant all on public.content_brand_category_intros to service_role;
grant all on public.content_solutions to service_role;
grant all on public.content_industries to service_role;
grant all on public.content_nav_items to service_role;
grant all on public.content_articles to service_role;
grant all on public.content_products to service_role;

alter table public.content_article_categories enable row level security;
alter table public.content_brands enable row level security;
alter table public.content_brand_category_intros enable row level security;
alter table public.content_solutions enable row level security;
alter table public.content_industries enable row level security;
alter table public.content_nav_items enable row level security;
alter table public.content_articles enable row level security;
alter table public.content_products enable row level security;

create policy "Public can read content article categories"
on public.content_article_categories
for select
using (true);

create policy "Public can read content brands"
on public.content_brands
for select
using (true);

create policy "Public can read content brand category intros"
on public.content_brand_category_intros
for select
using (true);

create policy "Public can read content solutions"
on public.content_solutions
for select
using (true);

create policy "Public can read content industries"
on public.content_industries
for select
using (true);

create policy "Public can read content nav items"
on public.content_nav_items
for select
using (true);

create policy "Public can read content articles"
on public.content_articles
for select
using (true);

create policy "Public can read content products"
on public.content_products
for select
using (true);
