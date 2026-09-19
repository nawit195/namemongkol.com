
CREATE TABLE public.article_views (
  slug TEXT PRIMARY KEY,
  views BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.article_views TO anon, authenticated;
GRANT ALL ON public.article_views TO service_role;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read view counts" ON public.article_views FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.increment_article_view(_slug TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_views BIGINT;
BEGIN
  INSERT INTO public.article_views (slug, views, updated_at)
  VALUES (_slug, 1, now())
  ON CONFLICT (slug) DO UPDATE SET views = public.article_views.views + 1, updated_at = now()
  RETURNING views INTO new_views;
  RETURN new_views;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_article_view(TEXT) TO anon, authenticated;
