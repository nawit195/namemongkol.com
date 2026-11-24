-- Nickname purchases are separate from expiring search history.
CREATE TABLE public.nickname_unlocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_id uuid NOT NULL,
    quote_hash text NOT NULL CHECK (length(quote_hash) = 64),
    catalog_version text NOT NULL,
    filters jsonb NOT NULL,
    result_ids text[] NOT NULL CHECK (cardinality(result_ids) BETWEEN 1 AND 20),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'array' AND jsonb_array_length(snapshot) BETWEEN 1 AND 20),
    credits_spent integer NOT NULL DEFAULT 15 CHECK (credits_spent = 15),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, request_id),
    UNIQUE (user_id, quote_hash)
);

CREATE TABLE public.nickname_entitlements (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname_id text NOT NULL,
    unlock_id uuid NOT NULL REFERENCES public.nickname_unlocks(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, nickname_id)
);
CREATE INDEX nickname_unlocks_user_created ON public.nickname_unlocks(user_id, created_at);
CREATE INDEX nickname_entitlements_unlock ON public.nickname_entitlements(unlock_id);

ALTER TABLE public.nickname_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nickname_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nickname_unlocks, public.nickname_entitlements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.nickname_unlocks, public.nickname_entitlements TO authenticated;
GRANT ALL ON public.nickname_unlocks, public.nickname_entitlements TO service_role;
CREATE POLICY nickname_unlock_owner ON public.nickname_unlocks FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);
CREATE POLICY nickname_entitlement_owner ON public.nickname_entitlements FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Invoker rights: only the trusted service role can execute this transaction.
CREATE FUNCTION public.unlock_nickname_batch(
    p_user_id uuid, p_request_id uuid, p_quote_hash text,
    p_catalog_version text, p_filters jsonb, p_snapshot jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
    v_existing public.nickname_unlocks%ROWTYPE;
    v_ids text[];
    v_id uuid;
    v_purchased integer;
    v_welcome integer;
    v_welcome_at timestamptz;
    v_effective_welcome integer;
    v_from_welcome integer;
BEGIN
    IF (SELECT auth.role()) IS DISTINCT FROM 'service_role' THEN
        RAISE EXCEPTION 'Server authorization required' USING ERRCODE = '42501';
    END IF;
    IF p_user_id IS NULL OR p_request_id IS NULL OR p_quote_hash IS NULL OR length(p_quote_hash) <> 64
       OR p_catalog_version IS NULL OR p_catalog_version = ''
       OR p_filters IS NULL OR jsonb_typeof(p_filters) <> 'object'
       OR p_snapshot IS NULL OR jsonb_typeof(p_snapshot) <> 'array' THEN
        RAISE EXCEPTION 'Invalid nickname purchase';
    END IF;
    IF jsonb_array_length(p_snapshot) NOT BETWEEN 1 AND 20 THEN
        RAISE EXCEPTION 'Nickname purchase must contain 1 to 20 names';
    END IF;
    SELECT array_agg(item->>'id' ORDER BY ordinal) INTO v_ids
    FROM jsonb_array_elements(p_snapshot) WITH ORDINALITY AS result(item, ordinal);
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_snapshot) item
               WHERE item->>'grade' IS DISTINCT FROM 'A+' OR item->>'id' IS NULL
                 OR (item->>'id') !~ '^nn_[a-f0-9]{20}$' OR coalesce(item->>'name', '') = '')
       OR cardinality(v_ids) <> (SELECT count(DISTINCT value) FROM unnest(v_ids) value) THEN
        RAISE EXCEPTION 'Invalid nickname snapshot';
    END IF;

    -- Serialize purchases against the same wallet, then recheck idempotency.
    SELECT coalesce(credits, 0), coalesce(welcome_credits, 0), welcome_credits_granted_at
    INTO v_purchased, v_welcome, v_welcome_at
    FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
    v_effective_welcome := CASE WHEN v_welcome_at IS NOT NULL AND now() <= v_welcome_at + interval '30 days' THEN v_welcome ELSE 0 END;

    SELECT * INTO v_existing FROM public.nickname_unlocks
    WHERE user_id = p_user_id AND (request_id = p_request_id OR quote_hash = p_quote_hash)
    LIMIT 1;
    IF FOUND THEN
        RETURN jsonb_build_object('status', 'already_unlocked', 'received_count', cardinality(v_existing.result_ids),
            'remaining_credits', v_purchased + v_effective_welcome);
    END IF;
    IF EXISTS (SELECT 1 FROM public.nickname_entitlements WHERE user_id = p_user_id AND nickname_id = ANY(v_ids)) THEN
        RETURN jsonb_build_object('status', 'stale_quote');
    END IF;
    IF v_purchased + v_effective_welcome < 15 THEN
        RETURN jsonb_build_object('status', 'insufficient_credits', 'remaining_credits', v_purchased + v_effective_welcome);
    END IF;

    v_from_welcome := least(v_effective_welcome, 15);
    PERFORM set_config('app.bypass_credit_check', 'true', true);
    UPDATE public.user_profiles
    SET credits = v_purchased - (15 - v_from_welcome), welcome_credits = v_effective_welcome - v_from_welcome
    WHERE id = p_user_id;
    PERFORM set_config('app.bypass_credit_check', '', true);
    IF v_welcome > 0 AND v_effective_welcome = 0 THEN
        INSERT INTO public.credit_transactions(user_id, amount, type, description)
        VALUES (p_user_id, -v_welcome, 'expire', 'Welcome Bonus หมดอายุ (30 วัน)');
    END IF;

    INSERT INTO public.nickname_unlocks(user_id, request_id, quote_hash, catalog_version, filters, result_ids, snapshot)
    VALUES (p_user_id, p_request_id, p_quote_hash, p_catalog_version, p_filters, v_ids, p_snapshot)
    RETURNING id INTO v_id;
    INSERT INTO public.nickname_entitlements(user_id, nickname_id, unlock_id)
    SELECT p_user_id, value, v_id FROM unnest(v_ids) value;
    INSERT INTO public.credit_transactions(user_id, amount, type, description)
    VALUES (p_user_id, -15, 'spend', 'ปลดล็อกชื่อเล่นมงคล A+ ' || cardinality(v_ids) || ' ชื่อ');

    RETURN jsonb_build_object('status', 'unlocked', 'received_count', cardinality(v_ids),
        'remaining_credits', v_purchased + v_effective_welcome - 15);
END;
$$;
REVOKE ALL ON FUNCTION public.unlock_nickname_batch(uuid, uuid, text, text, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_nickname_batch(uuid, uuid, text, text, jsonb, jsonb) TO service_role;
