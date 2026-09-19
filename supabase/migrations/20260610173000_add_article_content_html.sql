-- Add content_html column to content_articles to support Rich Text Editor
alter table public.content_articles add column if not exists content_html text;
