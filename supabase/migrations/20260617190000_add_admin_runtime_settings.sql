create table if not exists public.admin_runtime_settings (
  key text primary key,
  value text,
  is_secret boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_admin_runtime_settings_updated_at on public.admin_runtime_settings;
create trigger set_admin_runtime_settings_updated_at
before update on public.admin_runtime_settings
for each row
execute function public.set_updated_at();

alter table public.admin_runtime_settings enable row level security;

grant all on public.admin_runtime_settings to service_role;
