alter table public.content_industries
add column if not exists showcase_image_url text;

create table if not exists public.content_site_sections (
  section_key text primary key,
  eyebrow_th text,
  eyebrow_en text,
  title_prefix_th text,
  title_prefix_en text,
  title_highlight_th text,
  title_highlight_en text,
  description_prefix_th text,
  description_prefix_en text,
  description_highlight_th text,
  description_highlight_en text,
  description_suffix_th text,
  description_suffix_en text,
  is_enabled boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.content_site_sections (
  section_key,
  eyebrow_th,
  eyebrow_en,
  title_prefix_th,
  title_prefix_en,
  title_highlight_th,
  title_highlight_en,
  description_prefix_th,
  description_prefix_en,
  description_highlight_th,
  description_highlight_en,
  description_suffix_th,
  description_suffix_en
)
values (
  'industries_showcase',
  'กลุ่มลูกค้าและการใช้งาน',
  'Industry Use Cases',
  'ออกแบบ',
  'Designed ',
  'เพื่อทุกประเภทองค์กร',
  'for every kind of organization',
  'ประสบการณ์จริงจากการติดตั้งกว่า ',
  'Real-world experience from over ',
  '500+ โปรเจ็ค',
  '500+ projects',
  ' ครอบคลุมทุกอุตสาหกรรม',
  ' across every industry'
)
on conflict (section_key) do update
set
  eyebrow_th = coalesce(public.content_site_sections.eyebrow_th, excluded.eyebrow_th),
  eyebrow_en = coalesce(public.content_site_sections.eyebrow_en, excluded.eyebrow_en),
  title_prefix_th = coalesce(public.content_site_sections.title_prefix_th, excluded.title_prefix_th),
  title_prefix_en = coalesce(public.content_site_sections.title_prefix_en, excluded.title_prefix_en),
  title_highlight_th = coalesce(public.content_site_sections.title_highlight_th, excluded.title_highlight_th),
  title_highlight_en = coalesce(public.content_site_sections.title_highlight_en, excluded.title_highlight_en),
  description_prefix_th = coalesce(public.content_site_sections.description_prefix_th, excluded.description_prefix_th),
  description_prefix_en = coalesce(public.content_site_sections.description_prefix_en, excluded.description_prefix_en),
  description_highlight_th = coalesce(public.content_site_sections.description_highlight_th, excluded.description_highlight_th),
  description_highlight_en = coalesce(public.content_site_sections.description_highlight_en, excluded.description_highlight_en),
  description_suffix_th = coalesce(public.content_site_sections.description_suffix_th, excluded.description_suffix_th),
  description_suffix_en = coalesce(public.content_site_sections.description_suffix_en, excluded.description_suffix_en),
  updated_at = now();
