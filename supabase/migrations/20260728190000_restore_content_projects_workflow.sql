create table if not exists public.content_projects (
  slug text primary key,
  industry_slug text not null references public.content_industries(slug) on update cascade,
  title text not null,
  excerpt text,
  client_name text,
  location text,
  completed_date date,
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  content_html text,
  published_date date,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_title text,
  og_description text,
  og_image_url text,
  seo_canonical_url text,
  seo_no_index boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_projects
  add column if not exists industry_slug text,
  add column if not exists title text,
  add column if not exists excerpt text,
  add column if not exists client_name text,
  add column if not exists location text,
  add column if not exists completed_date date,
  add column if not exists cover_image_url text,
  add column if not exists gallery_images jsonb default '[]'::jsonb,
  add column if not exists content_html text,
  add column if not exists published_date date,
  add column if not exists sort_order integer default 0,
  add column if not exists status text default 'draft',
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image_url text,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_no_index boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.content_projects
set
  gallery_images = coalesce(gallery_images, '[]'::jsonb),
  sort_order = coalesce(sort_order, 0),
  status = case when status = 'published' then 'published' else 'draft' end,
  seo_no_index = coalesce(seo_no_index, false),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.content_projects'::regclass
      and contype = 'f'
      and conname = 'content_projects_industry_slug_fkey'
  ) then
    alter table public.content_projects
      add constraint content_projects_industry_slug_fkey
      foreign key (industry_slug)
      references public.content_industries(slug)
      on update cascade;
  end if;
end
$$;

create index if not exists content_projects_industry_order_idx
  on public.content_projects (industry_slug, sort_order, updated_at desc);

drop trigger if exists set_content_projects_updated_at on public.content_projects;
create trigger set_content_projects_updated_at
before update on public.content_projects
for each row execute function public.set_updated_at();

alter table public.content_projects enable row level security;

drop policy if exists "content_projects_public_read" on public.content_projects;
create policy "content_projects_public_read"
on public.content_projects
for select
to anon, authenticated
using (status = 'published');

grant select on public.content_projects to anon, authenticated;

-- Seed the legacy Phichit Hospital content only when no project exists yet.
-- Existing projects always win, so rerunning this migration cannot duplicate or overwrite content.
insert into public.content_projects (
  slug,
  industry_slug,
  title,
  excerpt,
  cover_image_url,
  gallery_images,
  content_html,
  published_date,
  sort_order,
  status,
  seo_title,
  seo_description,
  seo_keywords,
  og_title,
  og_description,
  og_image_url,
  seo_canonical_url,
  seo_no_index
)
select
  source.slug,
  'hospital',
  source.title,
  source.description,
  source.image_url,
  case
    when nullif(source.image_url, '') is null then '[]'::jsonb
    else jsonb_build_array(
      jsonb_build_object(
        'id', 'phichit-hospital-cover',
        'url', source.image_url,
        'alt', source.title,
        'caption', ''
      )
    )
  end,
  null,
  current_date,
  10,
  'published',
  source.seo_title,
  source.seo_description,
  source.seo_keywords,
  source.og_title,
  source.og_description,
  coalesce(source.og_image_url, source.image_url),
  '/industry/hospital/phichit-hospital',
  coalesce(source.seo_no_index, false)
from public.content_industries source
where source.slug = 'phichit-hospital'
  and exists (select 1 from public.content_industries where slug = 'hospital')
  and not exists (
    select 1 from public.content_projects where slug = 'phichit-hospital'
  );

-- Keep the legacy industry row as a backup, but remove it from category listings.
update public.content_industries
set
  show_on_brands = false,
  link_url = '/industry/hospital/phichit-hospital'
where slug = 'phichit-hospital'
  and exists (
    select 1 from public.content_projects where slug = 'phichit-hospital'
  );
