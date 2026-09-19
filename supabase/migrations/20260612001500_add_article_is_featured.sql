-- Add is_featured column to content_articles
alter table public.content_articles add column if not exists is_featured boolean not null default false;
