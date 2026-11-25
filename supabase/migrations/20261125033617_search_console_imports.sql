-- Search Console export snapshots are admin-only. Separate dimensions must never be joined into invented relationships.
CREATE TABLE public.search_console_imports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    scope jsonb NOT NULL CHECK (jsonb_typeof(scope) = 'object'),
    scope_key text NOT NULL CHECK (scope_key ~ '^[a-f0-9]{64}$'),
    content_hash text NOT NULL UNIQUE CHECK (content_hash ~ '^[a-f0-9]{64}$'),
    kinds text[] NOT NULL CHECK (cardinality(kinds) BETWEEN 1 AND 4 AND kinds <@ ARRAY['queries','pages','daily','query-pages']::text[]),
    row_count integer NOT NULL CHECK (row_count BETWEEN 1 AND 20000),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.search_console_rows (
    import_id uuid NOT NULL REFERENCES public.search_console_imports(id) ON DELETE CASCADE,
    kind text NOT NULL CHECK (kind IN ('queries','pages','daily','query-pages')),
    dimension_key text NOT NULL,
    dimension_hash text NOT NULL CHECK (dimension_hash ~ '^[a-f0-9]{64}$'),
    query text,
    page_url text,
    data_date date,
    clicks bigint NOT NULL CHECK (clicks >= 0),
    impressions bigint NOT NULL CHECK (impressions >= 0),
    position double precision NOT NULL CHECK (position >= 0 AND position < 'Infinity'::double precision),
    PRIMARY KEY (import_id, kind, dimension_hash)
);
CREATE INDEX search_console_imports_created_at ON public.search_console_imports(created_at DESC);
CREATE INDEX search_console_imports_created_by ON public.search_console_imports(created_by);
ALTER TABLE public.search_console_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_console_rows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.search_console_imports, public.search_console_rows FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.search_console_imports, public.search_console_rows TO service_role;
CREATE POLICY search_console_import_service ON public.search_console_imports FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY search_console_row_service ON public.search_console_rows FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE FUNCTION public.import_search_console(
    p_user_id uuid, p_scope jsonb, p_scope_key text, p_content_hash text, p_kinds text[], p_rows jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
    IF p_user_id IS NULL OR p_scope IS NULL OR p_scope_key IS NULL OR p_content_hash IS NULL
       OR p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' OR jsonb_array_length(p_rows) NOT BETWEEN 1 AND 20000 THEN
        RAISE EXCEPTION 'Invalid Search Console import';
    END IF;
    INSERT INTO public.search_console_imports(created_by,scope,scope_key,content_hash,kinds,row_count)
    VALUES(p_user_id,p_scope,p_scope_key,p_content_hash,p_kinds,jsonb_array_length(p_rows))
    ON CONFLICT(content_hash) DO NOTHING RETURNING id INTO v_id;
    IF v_id IS NULL THEN
        SELECT id INTO v_id FROM public.search_console_imports WHERE content_hash=p_content_hash;
        RETURN jsonb_build_object('id',v_id,'duplicate',true);
    END IF;
    INSERT INTO public.search_console_rows(import_id,kind,dimension_key,dimension_hash,query,page_url,data_date,clicks,impressions,position)
    SELECT v_id,r->>'kind',r->>'key',r->>'identityHash',r->>'query',r->>'path',(r->>'date')::date,(r->>'clicks')::bigint,(r->>'impressions')::bigint,(r->>'position')::double precision
    FROM jsonb_array_elements(p_rows) r;
    RETURN jsonb_build_object('id',v_id,'duplicate',false);
END;
$$;

CREATE FUNCTION public.search_console_report(p_import_id uuid,p_kind text,p_page integer,p_search text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
    IF p_import_id IS NULL OR p_kind NOT IN ('queries','pages','daily','query-pages') OR p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000
       OR p_search IS NULL OR length(p_search)>200 THEN RAISE EXCEPTION 'Invalid Search Console report'; END IF;
    WITH filtered AS MATERIALIZED (
        SELECT * FROM public.search_console_rows
        WHERE import_id=p_import_id AND kind=p_kind
          AND (p_search='' OR strpos(lower(dimension_key),lower(p_search))>0)
    ), paged AS (
        SELECT * FROM filtered
        ORDER BY CASE WHEN p_kind='daily' THEN data_date END ASC NULLS LAST, clicks DESC, impressions DESC, dimension_key
        LIMIT 50 OFFSET (p_page-1)*50
    ) SELECT jsonb_build_object(
        'total',(SELECT count(*) FROM filtered),
        'sourceRows',(SELECT count(*) FROM public.search_console_rows WHERE import_id=p_import_id AND kind=p_kind),
        'rows',coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
            'kind',kind,'key',dimension_key,'query',query,'path',page_url,'date',data_date,
            'clicks',clicks,'impressions',impressions,'position',position,
            'ctr',CASE WHEN impressions>0 THEN clicks::numeric/impressions*100 ELSE 0 END
        )) ORDER BY CASE WHEN p_kind='daily' THEN data_date END ASC NULLS LAST,clicks DESC,impressions DESC,dimension_key) FROM paged),'[]'::jsonb),
        'summary',(SELECT jsonb_build_object('clicks',coalesce(sum(clicks),0),'impressions',coalesce(sum(impressions),0),
            'ctr',CASE WHEN sum(impressions)>0 THEN sum(clicks)::numeric/sum(impressions)*100 ELSE 0 END,
            'position',CASE WHEN sum(impressions)>0 THEN sum(position*impressions)/sum(impressions) ELSE 0 END) FROM filtered)
    ) INTO v_result;
    RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.import_search_console(uuid,jsonb,text,text,text[],jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.search_console_report(uuid,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.import_search_console(uuid,jsonb,text,text,text[],jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.search_console_report(uuid,text,integer,text) TO service_role;
