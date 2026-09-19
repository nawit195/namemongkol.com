create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text not null unique,
  source_url text not null unique,
  content_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_import_mappings (
  source_url text primary key,
  target_url text not null,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  source_kind text not null,
  source_ref text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_media_assets_updated_at on public.media_assets;
create trigger set_media_assets_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

drop trigger if exists set_media_import_mappings_updated_at on public.media_import_mappings;
create trigger set_media_import_mappings_updated_at
before update on public.media_import_mappings
for each row
execute function public.set_updated_at();

grant select on public.media_assets to anon, authenticated;
grant select on public.media_import_mappings to anon, authenticated;
grant all on public.media_assets to service_role;
grant all on public.media_import_mappings to service_role;

alter table public.media_assets enable row level security;
alter table public.media_import_mappings enable row level security;

drop policy if exists "Public can read media assets" on public.media_assets;
create policy "Public can read media assets"
on public.media_assets
for select
using (true);

drop policy if exists "Public can read media import mappings" on public.media_import_mappings;
create policy "Public can read media import mappings"
on public.media_import_mappings
for select
using (true);
