-- Run once in the Supabase SQL Editor before enabling /admin/analysis-results.
-- This migration does not modify analysis_results rows or its existing RLS policies.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_analysis_result_names(
    p_search text DEFAULT '',
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 50,
    p_export boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
    IF p_page IS NULL OR p_page < 1
        OR p_page_size IS NULL OR p_page_size < 1 OR p_page_size > 100
        OR p_export IS NULL OR length(coalesce(p_search, '')) > 200 THEN
        RAISE EXCEPTION 'Invalid analysis names query' USING ERRCODE = '22023';
    END IF;

    RETURN (
        WITH unique_names AS MATERIALIZED (
            SELECT DISTINCT btrim(ar.name) COLLATE "C" AS name
            FROM public.analysis_results AS ar
            WHERE ar.name IS NOT NULL AND btrim(ar.name) <> ''
        ), filtered_names AS MATERIALIZED (
            SELECT name FROM unique_names
            WHERE strpos(lower(name), lower(btrim(coalesce(p_search, '')))) > 0
        ), page_names AS (
            SELECT name FROM filtered_names
            ORDER BY name COLLATE "C"
            LIMIT CASE WHEN p_export THEN NULL ELSE p_page_size END
            OFFSET CASE WHEN p_export THEN 0 ELSE (p_page::bigint - 1) * p_page_size END
        )
        SELECT jsonb_build_object(
            'names', coalesce((SELECT jsonb_agg(name ORDER BY name COLLATE "C") FROM page_names), '[]'::jsonb),
            'total', (SELECT count(*) FROM filtered_names)
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_analysis_result_names(text, integer, integer, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_analysis_result_names(text, integer, integer, boolean) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_analysis_result_names(text, integer, integer, boolean) TO service_role;

COMMENT ON FUNCTION public.admin_analysis_result_names(text, integer, integer, boolean)
IS 'Read-only distinct analyzed first names. Server-side service_role only after admin authorization.';

NOTIFY pgrst, 'reload schema';
COMMIT;
