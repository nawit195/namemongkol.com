-- Preserve the original four-argument report RPC for deployed clients.
-- Filters precede aggregates and pagination; sorting is a validated static expression.
CREATE FUNCTION public.search_console_report_filtered(
    p_import_id uuid, p_kind text, p_page integer, p_search text,
    p_sort text, p_order text, p_opportunity boolean
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
    IF p_import_id IS NULL OR p_kind IS NULL OR p_kind NOT IN ('queries','pages','daily','query-pages')
       OR p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000
       OR p_search IS NULL OR length(p_search)>200
       OR p_sort IS NULL OR p_sort NOT IN ('clicks','impressions','ctr','position','dimension')
       OR p_order IS NULL OR p_order NOT IN ('asc','desc')
       OR p_opportunity IS NULL OR (p_kind='daily' AND p_opportunity) THEN
        RAISE EXCEPTION 'Invalid Search Console report filters';
    END IF;
    WITH filtered AS MATERIALIZED (
        SELECT *, CASE WHEN impressions>0 THEN clicks::numeric/impressions*100 END AS observed_ctr,
                  CASE WHEN impressions>0 THEN position END AS observed_position
        FROM public.search_console_rows
        WHERE import_id=p_import_id AND kind=p_kind
          AND (p_search='' OR strpos(lower(dimension_key),lower(p_search))>0)
          AND (NOT p_opportunity OR (impressions>0 AND position BETWEEN 4 AND 15))
    ), ordered AS (
        SELECT *, row_number() OVER (ORDER BY
            CASE WHEN p_sort='clicks' AND p_order='asc' THEN clicks END ASC NULLS LAST,
            CASE WHEN p_sort='clicks' AND p_order='desc' THEN clicks END DESC NULLS LAST,
            CASE WHEN p_sort='impressions' AND p_order='asc' THEN impressions END ASC NULLS LAST,
            CASE WHEN p_sort='impressions' AND p_order='desc' THEN impressions END DESC NULLS LAST,
            CASE WHEN p_sort='ctr' AND p_order='asc' THEN observed_ctr END ASC NULLS LAST,
            CASE WHEN p_sort='ctr' AND p_order='desc' THEN observed_ctr END DESC NULLS LAST,
            CASE WHEN p_sort='position' AND p_order='asc' THEN observed_position END ASC NULLS LAST,
            CASE WHEN p_sort='position' AND p_order='desc' THEN observed_position END DESC NULLS LAST,
            CASE WHEN p_sort='dimension' AND p_order='asc' THEN dimension_key END ASC NULLS LAST,
            CASE WHEN p_sort='dimension' AND p_order='desc' THEN dimension_key END DESC NULLS LAST,
            dimension_key ASC
        ) AS report_order FROM filtered
    ), paged AS (
        SELECT * FROM ordered ORDER BY report_order LIMIT 50 OFFSET (p_page-1)*50
    ) SELECT jsonb_build_object(
        'total',(SELECT count(*) FROM filtered),
        'sourceRows',(SELECT count(*) FROM public.search_console_rows WHERE import_id=p_import_id AND kind=p_kind),
        'rows',coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
            'kind',kind,'key',dimension_key,'query',query,'path',page_url,'date',data_date,
            'clicks',clicks,'impressions',impressions,'position',position,
            'ctr',CASE WHEN impressions>0 THEN clicks::numeric/impressions*100 ELSE 0 END
        )) ORDER BY report_order) FROM paged),'[]'::jsonb),
        'summary',(SELECT jsonb_build_object('clicks',coalesce(sum(clicks),0),'impressions',coalesce(sum(impressions),0),
            'ctr',CASE WHEN sum(impressions)>0 THEN sum(clicks)::numeric/sum(impressions)*100 ELSE 0 END,
            'position',CASE WHEN sum(impressions)>0 THEN sum(position*impressions)/sum(impressions) ELSE 0 END) FROM filtered)
    ) INTO v_result;
    RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.search_console_report_filtered(uuid,text,integer,text,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.search_console_report_filtered(uuid,text,integer,text,text,text,boolean) TO service_role;
