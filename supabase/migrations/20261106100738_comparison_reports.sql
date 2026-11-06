-- Paid snapshots are immutable to browser clients. Free comparisons need no table access.
CREATE TABLE public.comparison_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fingerprint text NOT NULL CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
    input jsonb NOT NULL CHECK (jsonb_typeof(input) = 'object'),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
    credits_spent integer NOT NULL DEFAULT 5 CHECK (credits_spent = 5),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, fingerprint)
);
CREATE INDEX comparison_reports_user_created_idx ON public.comparison_reports(user_id, created_at DESC, id DESC);
ALTER TABLE public.comparison_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.comparison_reports FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.comparison_reports TO authenticated;
GRANT SELECT, INSERT ON public.comparison_reports TO service_role;
CREATE POLICY comparison_reports_owner_read ON public.comparison_reports
    FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

CREATE FUNCTION public.unlock_comparison_report(p_user_id uuid, p_fingerprint text, p_input jsonb, p_snapshot jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    v_report public.comparison_reports%ROWTYPE;
    v_purchased integer;
    v_welcome integer;
    v_welcome_at timestamptz;
    v_effective_welcome integer;
    v_from_welcome integer;
    v_old_bypass text;
BEGIN
    IF p_user_id IS NULL OR p_fingerprint IS NULL OR p_fingerprint !~ '^[0-9a-f]{64}$'
        OR p_input IS NULL OR jsonb_typeof(p_input) <> 'object'
        OR p_snapshot IS NULL OR jsonb_typeof(p_snapshot) <> 'object'
        OR jsonb_typeof(p_snapshot->'rows') IS DISTINCT FROM 'array'
        OR p_snapshot->'input' IS DISTINCT FROM p_input THEN
        RAISE EXCEPTION 'Invalid report payload' USING ERRCODE = '22023';
    END IF;
    IF jsonb_array_length(p_snapshot->'rows') NOT BETWEEN 2 AND 5 OR octet_length(p_snapshot::text) > 250000 THEN
        RAISE EXCEPTION 'Invalid report size' USING ERRCODE = '22023';
    END IF;

    -- Serialize all report purchases for this account, including different sets.
    SELECT coalesce(credits,0), coalesce(welcome_credits,0), welcome_credits_granted_at
    INTO v_purchased, v_welcome, v_welcome_at
    FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Profile unavailable'; END IF;
    v_effective_welcome := CASE WHEN v_welcome_at IS NOT NULL AND now() < v_welcome_at + interval '30 days'
        THEN v_welcome ELSE 0 END;

    -- Recheck while holding the balance lock: retries and concurrent requests charge once.
    SELECT * INTO v_report FROM public.comparison_reports WHERE user_id = p_user_id AND fingerprint = p_fingerprint;
    IF FOUND THEN
        RETURN jsonb_build_object('status','already_unlocked','remaining_credits',v_purchased + v_effective_welcome,
            'report',jsonb_build_object('id',v_report.id,'created_at',v_report.created_at,'credits_spent',v_report.credits_spent,'snapshot',v_report.snapshot));
    END IF;
    IF v_purchased + v_effective_welcome < 5 THEN
        RETURN jsonb_build_object('status','insufficient_credits','remaining_credits',v_purchased + v_effective_welcome);
    END IF;
    v_from_welcome := least(v_effective_welcome, 5);
    v_old_bypass := current_setting('app.bypass_credit_check', true);
    PERFORM set_config('app.bypass_credit_check','true',true);
    UPDATE public.user_profiles SET credits = v_purchased - (5 - v_from_welcome),
        welcome_credits = v_effective_welcome - v_from_welcome WHERE id = p_user_id;
    PERFORM set_config('app.bypass_credit_check',coalesce(v_old_bypass,''),true);

    INSERT INTO public.comparison_reports(user_id,fingerprint,input,snapshot)
    VALUES(p_user_id,p_fingerprint,p_input,p_snapshot) RETURNING * INTO v_report;
    IF v_welcome > 0 AND v_effective_welcome = 0 THEN
        INSERT INTO public.credit_transactions(user_id,amount,type,description)
        VALUES(p_user_id,-v_welcome,'expire','Welcome Bonus หมดอายุ (30 วัน)');
    END IF;
    INSERT INTO public.credit_transactions(user_id,amount,type,description)
    VALUES(p_user_id,-5,'spend','รายงานสรุปเปรียบเทียบชื่อ · ' || v_report.id::text);
    RETURN jsonb_build_object('status','unlocked','remaining_credits',v_purchased + v_effective_welcome - 5,
        'report',jsonb_build_object('id',v_report.id,'created_at',v_report.created_at,'credits_spent',v_report.credits_spent,'snapshot',v_report.snapshot));
END;
$$;
REVOKE ALL ON FUNCTION public.unlock_comparison_report(uuid,text,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_comparison_report(uuid,text,jsonb,jsonb) TO service_role;
