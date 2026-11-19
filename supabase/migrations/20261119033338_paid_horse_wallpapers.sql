-- A separate catalog preserves the existing static/public wallpaper collections.
CREATE TABLE public.wallpaper_products (
    id text PRIMARY KEY CHECK (id ~ '^eight-horses-[a-z-]+$'),
    cost integer NOT NULL DEFAULT 15 CHECK (cost = 15),
    original_path text NOT NULL UNIQUE,
    sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
    bytes integer NOT NULL CHECK (bytes BETWEEN 1 AND 4000000),
    active boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallpaper_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wallpaper_products FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wallpaper_products TO service_role;

CREATE TABLE public.wallpaper_downloads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id text NOT NULL REFERENCES public.wallpaper_products(id),
    request_id uuid NOT NULL,
    sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
    credits_spent integer NOT NULL CHECK (credits_spent = 15),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
    UNIQUE (user_id, request_id),
    CHECK (expires_at = created_at + interval '30 minutes')
);
CREATE INDEX wallpaper_downloads_owner_created ON public.wallpaper_downloads(user_id, created_at DESC);
ALTER TABLE public.wallpaper_downloads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wallpaper_downloads FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.wallpaper_downloads TO service_role;

-- Private by default. No browser storage policies are added for this bucket.
INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
VALUES ('premium-wallpaper-originals', 'premium-wallpaper-originals', false, 4000000, ARRAY['image/png'])
ON CONFLICT (id) DO NOTHING;
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'premium-wallpaper-originals' AND public) THEN
        RAISE EXCEPTION 'Original wallpaper bucket must be private';
    END IF;
END $$;
CREATE POLICY "Horse originals are server only" ON storage.objects AS RESTRICTIVE
FOR ALL TO anon, authenticated
USING (bucket_id <> 'premium-wallpaper-originals')
WITH CHECK (bucket_id <> 'premium-wallpaper-originals');

INSERT INTO public.wallpaper_products(id, original_path, sha256, bytes) VALUES
('eight-horses-jade-mist', 'eight-horses/eight-horses-jade-mist-a7825179d4d6efa270deed159acba8bab7e6c91b2ab9cc8393f5763193b7995a.png', 'a7825179d4d6efa270deed159acba8bab7e6c91b2ab9cc8393f5763193b7995a', 2823355),
('eight-horses-waterfall', 'eight-horses/eight-horses-waterfall-42fafd2566604dbffafec8e24ba3e06cacc9fb52cd4925e3ba97a071e0ae687c.png', '42fafd2566604dbffafec8e24ba3e06cacc9fb52cd4925e3ba97a071e0ae687c', 3192514),
('eight-horses-sunlit-river', 'eight-horses/eight-horses-sunlit-river-736427245a0b330d7f8aa3590cc4734f9a6c35797ac0f28e4b386a4e1693f2d8.png', '736427245a0b330d7f8aa3590cc4734f9a6c35797ac0f28e4b386a4e1693f2d8', 3421774),
('eight-horses-mountain-stream', 'eight-horses/eight-horses-mountain-stream-ea9cf1e1bb9792f485967b319a83d3457313f67cbb4572f7e68f1173d34a026d.png', 'ea9cf1e1bb9792f485967b319a83d3457313f67cbb4572f7e68f1173d34a026d', 3035262);

CREATE FUNCTION public.purchase_wallpaper_download(
    p_user_id uuid, p_product_id text, p_request_id uuid, p_sha256 text, p_retry_only boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    v_product public.wallpaper_products%ROWTYPE;
    v_download public.wallpaper_downloads%ROWTYPE;
    v_purchased integer;
    v_welcome integer;
    v_welcome_at timestamptz;
    v_effective_welcome integer;
    v_from_welcome integer;
    v_old_bypass text;
    v_now timestamptz := clock_timestamp();
BEGIN
    IF p_user_id IS NULL OR p_request_id IS NULL OR p_product_id IS NULL OR p_sha256 IS NULL OR p_retry_only IS NULL THEN
        RAISE EXCEPTION 'Invalid download request' USING ERRCODE = '22023';
    END IF;
    -- Service-only RPC: the API verifies a real, non-anonymous user with Auth getUser().
    SELECT * INTO v_product FROM public.wallpaper_products WHERE id = p_product_id FOR SHARE;
    IF NOT FOUND OR NOT v_product.active THEN RETURN jsonb_build_object('status', 'unavailable'); END IF;
    IF v_product.sha256 IS DISTINCT FROM p_sha256 THEN RETURN jsonb_build_object('status', 'asset_changed'); END IF;

    -- Same account, any device: serialize charges and recheck the idempotency key under the lock.
    SELECT coalesce(credits,0), coalesce(welcome_credits,0), welcome_credits_granted_at
    INTO v_purchased, v_welcome, v_welcome_at FROM public.user_profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Profile unavailable'; END IF;
    v_now := clock_timestamp();
    v_effective_welcome := CASE WHEN v_welcome_at IS NOT NULL AND v_now < v_welcome_at + interval '30 days' THEN v_welcome ELSE 0 END;

    SELECT * INTO v_download FROM public.wallpaper_downloads WHERE user_id = p_user_id AND request_id = p_request_id;
    IF FOUND THEN
        IF v_download.product_id <> p_product_id OR v_download.sha256 <> p_sha256 THEN
            RETURN jsonb_build_object('status', 'request_conflict');
        END IF;
        IF v_download.expires_at <= v_now THEN RETURN jsonb_build_object('status', 'expired'); END IF;
        RETURN jsonb_build_object('status', 'retry', 'expires_at', v_download.expires_at,
            'remaining_credits', v_purchased + v_effective_welcome);
    END IF;
    IF p_retry_only THEN RETURN jsonb_build_object('status', 'attempt_not_found'); END IF;
    IF v_purchased + v_effective_welcome < v_product.cost THEN
        RETURN jsonb_build_object('status', 'insufficient_credits', 'remaining_credits', v_purchased + v_effective_welcome);
    END IF;

    v_from_welcome := least(v_effective_welcome, v_product.cost);
    v_old_bypass := current_setting('app.bypass_credit_check', true);
    PERFORM set_config('app.bypass_credit_check', 'true', true);
    UPDATE public.user_profiles SET credits = v_purchased - (v_product.cost - v_from_welcome),
        welcome_credits = v_effective_welcome - v_from_welcome WHERE id = p_user_id;
    PERFORM set_config('app.bypass_credit_check', coalesce(v_old_bypass,''), true);

    INSERT INTO public.wallpaper_downloads(user_id, product_id, request_id, sha256, credits_spent, created_at, expires_at)
    VALUES (p_user_id, p_product_id, p_request_id, p_sha256, v_product.cost, v_now, v_now + interval '30 minutes')
    RETURNING * INTO v_download;
    IF v_welcome > 0 AND v_effective_welcome = 0 THEN
        INSERT INTO public.credit_transactions(user_id, amount, type, description)
        VALUES (p_user_id, -v_welcome, 'expire', 'Welcome Bonus หมดอายุ (30 วัน)');
    END IF;
    INSERT INTO public.credit_transactions(user_id, amount, type, description)
    VALUES (p_user_id, -v_product.cost, 'spend', 'ดาวน์โหลดภาพม้า 8 ตัว · ' || v_download.id::text);
    RETURN jsonb_build_object('status', 'charged', 'expires_at', v_download.expires_at,
        'remaining_credits', v_purchased + v_effective_welcome - v_product.cost);
END;
$$;
REVOKE ALL ON FUNCTION public.purchase_wallpaper_download(uuid,text,uuid,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_wallpaper_download(uuid,text,uuid,text,boolean) TO service_role;
