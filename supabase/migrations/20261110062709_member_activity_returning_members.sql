-- One row per account / Thai calendar day / evidence source. No tool content.
CREATE TABLE public.member_activity_days (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date date NOT NULL,
    source text NOT NULL CHECK (source IN ('observed','legacy')),
    first_seen_at timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL,
    PRIMARY KEY (user_id,activity_date,source),
    CHECK (last_seen_at >= first_seen_at)
);
CREATE INDEX member_activity_days_date_user_idx ON public.member_activity_days(activity_date,user_id);
ALTER TABLE public.member_activity_days ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_activity_days FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.member_activity_days TO service_role;

CREATE TABLE public.member_activity_coverage (
    singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
    tracking_started_at timestamptz NOT NULL DEFAULT now(),
    legacy_imported_at timestamptz,
    legacy_sources text[] NOT NULL DEFAULT '{}'
);
ALTER TABLE public.member_activity_coverage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_activity_coverage FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.member_activity_coverage TO service_role;
INSERT INTO public.member_activity_coverage(singleton) VALUES(true);

-- Runs as the migration owner. Optional legacy sources need not exist.
-- Old evidence is explicitly labelled legacy: sampled, incomplete and not verified visits.
DO $$
DECLARE
    v_table text;
    v_filter text;
    v_sources text[] := '{}';
    v_from timestamptz := (((now() AT TIME ZONE 'Asia/Bangkok')::date - 364)::timestamp AT TIME ZONE 'Asia/Bangkok');
BEGIN
    CREATE TEMP TABLE member_activity_import(user_id uuid, seen_at timestamptz) ON COMMIT DROP;
    FOREACH v_table IN ARRAY ARRAY['user_action_events','analysis_history','credit_transactions'] LOOP
        IF to_regclass('public.' || v_table) IS NULL THEN CONTINUE; END IF;
        v_filter := CASE v_table
            WHEN 'credit_transactions' THEN ' AND e.type = ''spend'' '
            WHEN 'user_action_events' THEN ' AND e.page_path !~ ''^/(admin|api|auth)(/|$)'' AND e.page_path NOT IN (''/login'',''/register'') '
            ELSE '' END;
        EXECUTE format('INSERT INTO member_activity_import
            SELECT e.user_id,e.created_at FROM public.%I e
            JOIN public.user_profiles p ON p.id=e.user_id
            JOIN auth.users u ON u.id=e.user_id
            WHERE NOT coalesce(u.is_anonymous,false) AND coalesce(p.role::text,''user'') <> ''admin''
            AND e.created_at >= least(u.email_confirmed_at,u.phone_confirmed_at)
            AND e.created_at >= $1 AND e.created_at <= $2 %s',v_table,v_filter) USING v_from,now();
        v_sources := array_append(v_sources,v_table);
    END LOOP;
    INSERT INTO public.member_activity_days(user_id,activity_date,source,first_seen_at,last_seen_at)
    SELECT user_id,(seen_at AT TIME ZONE 'Asia/Bangkok')::date,'legacy',min(seen_at),max(seen_at)
    FROM member_activity_import GROUP BY user_id,(seen_at AT TIME ZONE 'Asia/Bangkok')::date
    ON CONFLICT (user_id,activity_date,source) DO UPDATE
        SET first_seen_at=least(member_activity_days.first_seen_at,excluded.first_seen_at),
            last_seen_at=greatest(member_activity_days.last_seen_at,excluded.last_seen_at);
    UPDATE public.member_activity_coverage SET legacy_imported_at=now(),legacy_sources=v_sources WHERE singleton;
END;
$$;

-- API derives this account from getUser(), rejects anonymous users, and sends no client date.
CREATE FUNCTION public.record_member_activity(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    v_now timestamptz := clock_timestamp();
    v_date date := (v_now AT TIME ZONE 'Asia/Bangkok')::date;
BEGIN
    IF p_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id=p_user_id AND coalesce(role::text,'user') <> 'admin'
    ) THEN RETURN jsonb_build_object('recorded',false,'activityDate',v_date); END IF;
    INSERT INTO public.member_activity_days(user_id,activity_date,source,first_seen_at,last_seen_at)
    VALUES(p_user_id,v_date,'observed',v_now,v_now)
    ON CONFLICT(user_id,activity_date,source) DO UPDATE
        SET first_seen_at=least(member_activity_days.first_seen_at,excluded.first_seen_at),
            last_seen_at=greatest(member_activity_days.last_seen_at,excluded.last_seen_at);
    RETURN jsonb_build_object('recorded',true,'activityDate',v_date);
END;
$$;
REVOKE ALL ON FUNCTION public.record_member_activity(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_member_activity(uuid) TO service_role;

CREATE FUNCTION public.admin_returning_members(
    p_date_from date, p_date_to date, p_search text DEFAULT '', p_source text DEFAULT 'all', p_page integer DEFAULT 1
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_result jsonb;
BEGIN
    IF p_date_from IS NULL OR p_date_to IS NULL OR p_date_to < p_date_from
       OR p_date_to-p_date_from > 364 OR p_date_to > (now() AT TIME ZONE 'Asia/Bangkok')::date
       OR p_source IS NULL OR p_source NOT IN ('all','observed')
       OR p_page IS NULL OR p_page NOT BETWEEN 1 AND 100000 OR length(coalesce(p_search,'')) > 100 THEN
        RAISE EXCEPTION 'Invalid report filters' USING ERRCODE='22023';
    END IF;
    WITH days AS (
        SELECT user_id,activity_date,min(first_seen_at) AS first_seen_at,max(last_seen_at) AS last_seen_at,
            bool_or(source='observed') AS observed,bool_or(source='legacy') AS legacy
        FROM public.member_activity_days
        WHERE activity_date BETWEEN p_date_from AND p_date_to AND (p_source='all' OR source='observed')
        GROUP BY user_id,activity_date
    ), activity AS (
        SELECT user_id,count(*)::integer AS active_days,
            count(*) FILTER(WHERE observed)::integer AS observed_days,
            count(*) FILTER(WHERE legacy AND NOT observed)::integer AS legacy_only_days,
            min(first_seen_at) AS first_seen_at,max(last_seen_at) AS last_seen_at
        FROM days GROUP BY user_id
    ), members AS (
        SELECT p.id,p.first_name,p.last_name,p.email,p.tier,a.*,
            CASE WHEN a.observed_days=0 THEN 'legacy' WHEN a.legacy_only_days>0 THEN 'mixed' ELSE 'observed' END AS evidence
        FROM activity a JOIN public.user_profiles p ON p.id=a.user_id
        WHERE coalesce(p.role::text,'user') <> 'admin'
            AND (coalesce(btrim(p_search),'')='' OR strpos(lower(concat_ws(' ',p.first_name,p.last_name,p.email)),lower(btrim(p_search)))>0)
    ), qualifying AS (
        SELECT * FROM members WHERE active_days>=2
    ), page_rows AS (
        SELECT * FROM qualifying ORDER BY active_days DESC,last_seen_at DESC,id ASC LIMIT 50 OFFSET (p_page-1)*50
    ) SELECT jsonb_build_object(
        'members',coalesce((SELECT jsonb_agg(jsonb_build_object(
            'id',id,'firstName',first_name,'lastName',last_name,'email',email,'tier',tier,
            'activeDays',active_days,'observedDays',observed_days,'legacyOnlyDays',legacy_only_days,
            'firstSeenAt',first_seen_at,'lastSeenAt',last_seen_at,'source',evidence
        ) ORDER BY active_days DESC,last_seen_at DESC,id ASC) FROM page_rows),'[]'::jsonb),
        'total',(SELECT count(*) FROM qualifying),'page',p_page,'pageSize',50,
        'summary',jsonb_build_object('activeMembers',(SELECT count(*) FROM members),'returningMembers',(SELECT count(*) FROM qualifying)),
        'coverage',(SELECT jsonb_build_object('trackingStartedAt',tracking_started_at,'legacyImportedAt',legacy_imported_at,'legacySources',legacy_sources) FROM public.member_activity_coverage WHERE singleton)
    ) INTO v_result;
    RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_returning_members(date,date,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_returning_members(date,date,text,text,integer) TO service_role;
