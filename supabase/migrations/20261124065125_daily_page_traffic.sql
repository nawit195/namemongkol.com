-- First-party, unsampled page views. No account IDs, IP addresses, form inputs or query strings.
CREATE TABLE public.page_view_events (
    event_id uuid PRIMARY KEY,
    visit_date date NOT NULL,
    page_path text NOT NULL CHECK (length(page_path) BETWEEN 1 AND 500 AND page_path LIKE '/%' AND page_path NOT LIKE '//%' AND page_path !~ '[?#]'),
    visitor_hash text NOT NULL CHECK (visitor_hash ~ '^[a-f0-9]{64}$'),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_view_events_date_path ON public.page_view_events(visit_date, page_path);
CREATE INDEX page_view_events_date_visitor ON public.page_view_events(visit_date, visitor_hash);
ALTER TABLE public.page_view_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.page_view_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.page_view_events TO service_role;
CREATE POLICY page_views_service_only ON public.page_view_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE FUNCTION public.admin_page_traffic(p_from date, p_to date, p_search text, p_page integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
    IF p_from IS NULL OR p_to IS NULL OR p_from > p_to OR p_to - p_from > 30
       OR p_to > (now() AT TIME ZONE 'Asia/Bangkok')::date
       OR p_search IS NULL OR length(p_search) > 100 OR p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000 THEN
        RAISE EXCEPTION 'Invalid page traffic filters';
    END IF;
    WITH filtered AS MATERIALIZED (
        SELECT visit_date, page_path, visitor_hash FROM public.page_view_events
        WHERE visit_date BETWEEN p_from AND p_to AND strpos(page_path, trim(p_search)) > 0
    ), grouped AS MATERIALIZED (
        SELECT visit_date AS day, page_path AS path, count(*) AS views, count(DISTINCT visitor_hash) AS visitors
        FROM filtered GROUP BY visit_date, page_path
    ), paged AS (
        SELECT * FROM grouped ORDER BY day DESC, views DESC, path LIMIT 50 OFFSET (p_page - 1) * 50
    ), daily AS (
        SELECT visit_date AS day, count(*) AS views, count(DISTINCT visitor_hash) AS visitors
        FROM filtered GROUP BY visit_date
    )
    SELECT jsonb_build_object(
        'rows', coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.day DESC, p.views DESC, p.path) FROM paged p), '[]'::jsonb),
        'daily', coalesce((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.day DESC) FROM daily d), '[]'::jsonb),
        'total', (SELECT count(*) FROM grouped), 'page', p_page, 'pageSize', 50,
        'summary', (SELECT jsonb_build_object('views', count(*), 'visitorDays', count(DISTINCT (visit_date, visitor_hash)), 'pages', count(DISTINCT page_path)) FROM filtered)
    ) INTO result;
    RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_page_traffic(date, date, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_page_traffic(date, date, text, integer) TO service_role;
