-- Secure pet-name previews and idempotent 15-credit unlocks.
-- Run this file once in Supabase SQL Editor after setup_pet_names.sql.

DROP POLICY IF EXISTS "Public can read active pet names" ON public.pet_names;
REVOKE SELECT ON public.pet_names FROM anon;
GRANT SELECT ON public.pet_names TO authenticated;

CREATE TABLE IF NOT EXISTS public.pet_name_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('search', 'analysis')),
  fingerprint TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::JSONB,
  result_slugs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  credits_spent INTEGER NOT NULL DEFAULT 15 CHECK (credits_spent >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, unlock_type, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_pet_name_unlocks_user_created
ON public.pet_name_unlocks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pet_name_unlocks_result_slugs
ON public.pet_name_unlocks USING GIN (result_slugs);

ALTER TABLE public.pet_name_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pet name unlocks" ON public.pet_name_unlocks;
CREATE POLICY "Users can view own pet name unlocks"
ON public.pet_name_unlocks FOR SELECT TO authenticated
USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.pet_name_unlocks FROM anon, authenticated;
GRANT SELECT ON public.pet_name_unlocks TO authenticated;

CREATE OR REPLACE FUNCTION public.unlock_pet_name_result(
  p_user_id UUID,
  p_unlock_type TEXT,
  p_fingerprint TEXT,
  p_filters JSONB,
  p_result_slugs TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cost CONSTANT INTEGER := 15;
  v_existing_id UUID;
  v_credits INTEGER;
  v_welcome INTEGER;
  v_welcome_at TIMESTAMPTZ;
  v_effective_welcome INTEGER;
  v_from_welcome INTEGER;
  v_from_purchased INTEGER;
BEGIN
  IF p_unlock_type NOT IN ('search', 'analysis') THEN
    RAISE EXCEPTION 'Invalid unlock type';
  END IF;

  IF p_fingerprint IS NULL OR length(p_fingerprint) < 8 OR cardinality(p_result_slugs) = 0 THEN
    RAISE EXCEPTION 'Invalid unlock payload';
  END IF;

  IF p_unlock_type = 'analysis' THEN
    SELECT id INTO v_existing_id
    FROM public.pet_name_unlocks
    WHERE user_id = p_user_id AND result_slugs @> p_result_slugs
    LIMIT 1;
  ELSE
    SELECT id INTO v_existing_id
    FROM public.pet_name_unlocks
    WHERE user_id = p_user_id AND unlock_type = p_unlock_type AND fingerprint = p_fingerprint;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'already_unlocked', 'remaining_credits', NULL);
  END IF;

  SELECT credits, welcome_credits, welcome_credits_granted_at
  INTO v_credits, v_welcome, v_welcome_at
  FROM public.user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Recheck after locking the profile row so concurrent requests charge once.
  IF p_unlock_type = 'analysis' THEN
    SELECT id INTO v_existing_id
    FROM public.pet_name_unlocks
    WHERE user_id = p_user_id AND result_slugs @> p_result_slugs
    LIMIT 1;
  ELSE
    SELECT id INTO v_existing_id
    FROM public.pet_name_unlocks
    WHERE user_id = p_user_id AND unlock_type = p_unlock_type AND fingerprint = p_fingerprint;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'already_unlocked', 'remaining_credits', COALESCE(v_credits, 0) + COALESCE(v_welcome, 0));
  END IF;

  v_credits := COALESCE(v_credits, 0);
  v_welcome := COALESCE(v_welcome, 0);

  IF v_welcome_at IS NOT NULL AND v_welcome > 0 AND NOW() <= v_welcome_at + INTERVAL '30 days' THEN
    v_effective_welcome := v_welcome;
  ELSE
    IF v_welcome > 0 THEN
      INSERT INTO public.credit_transactions (user_id, amount, type, description)
      VALUES (p_user_id, -v_welcome, 'expire', 'Welcome Bonus หมดอายุ (30 วัน)');
      PERFORM set_config('app.bypass_credit_check', 'true', true);
      UPDATE public.user_profiles SET welcome_credits = 0 WHERE id = p_user_id;
      PERFORM set_config('app.bypass_credit_check', '', true);
    END IF;
    v_effective_welcome := 0;
    v_welcome := 0;
  END IF;

  IF v_credits + v_effective_welcome < v_cost THEN
    RETURN jsonb_build_object('status', 'insufficient_credits', 'remaining_credits', v_credits + v_effective_welcome);
  END IF;

  v_from_welcome := LEAST(v_effective_welcome, v_cost);
  v_from_purchased := v_cost - v_from_welcome;

  PERFORM set_config('app.bypass_credit_check', 'true', true);
  UPDATE public.user_profiles
  SET credits = COALESCE(credits, 0) - v_from_purchased,
      welcome_credits = v_welcome - v_from_welcome
  WHERE id = p_user_id;
  PERFORM set_config('app.bypass_credit_check', '', true);

  INSERT INTO public.pet_name_unlocks (
    user_id, unlock_type, fingerprint, filters, result_slugs, credits_spent
  ) VALUES (
    p_user_id, p_unlock_type, p_fingerprint, COALESCE(p_filters, '{}'::JSONB), p_result_slugs, v_cost
  );

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (
    p_user_id,
    -v_cost,
    'spend',
    CASE WHEN p_unlock_type = 'search'
      THEN 'ปลดล็อกชุดชื่อสัตว์เลี้ยงมงคล 12 ชื่อ'
      ELSE 'ปลดล็อกรายละเอียดวิเคราะห์ชื่อสัตว์เลี้ยง'
    END
  );

  RETURN jsonb_build_object(
    'status', 'unlocked',
    'remaining_credits', v_credits + v_effective_welcome - v_cost
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_pet_name_result(UUID, TEXT, TEXT, JSONB, TEXT[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_pet_name_result(UUID, TEXT, TEXT, JSONB, TEXT[]) TO service_role;
