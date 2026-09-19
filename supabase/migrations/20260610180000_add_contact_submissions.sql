-- Create table for contact submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text not null,
  topic text,
  message text,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Enable RLS
alter table public.contact_submissions enable row level security;

-- Policies
create policy "Anon can insert contact submissions"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

create policy "Admins can read contact submissions"
on public.contact_submissions
for select
to authenticated, service_role
using (true);

create policy "Admins can update contact submissions"
on public.contact_submissions
for update
to authenticated, service_role
using (true)
with check (true);

create policy "Admins can delete contact submissions"
on public.contact_submissions
for delete
to authenticated, service_role
using (true);

-- Grants
grant select, insert on public.contact_submissions to anon, authenticated;
grant all on public.contact_submissions to service_role;
