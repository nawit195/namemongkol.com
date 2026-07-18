CREATE TABLE IF NOT EXISTS public.pet_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT,
  pronunciation TEXT NOT NULL,
  meaning TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('thai', 'english', 'japanese', 'korean', 'international')),
  pet_types TEXT[] NOT NULL DEFAULT ARRAY['dog', 'cat']::TEXT[],
  genders TEXT[] NOT NULL DEFAULT ARRAY['neutral']::TEXT[],
  traits TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  styles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  intents TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  syllables SMALLINT NOT NULL DEFAULT 2 CHECK (syllables BETWEEN 1 AND 5),
  initial TEXT NOT NULL,
  meaning_score SMALLINT NOT NULL CHECK (meaning_score BETWEEN 0 AND 100),
  pronunciation_score SMALLINT NOT NULL CHECK (pronunciation_score BETWEEN 0 AND 100),
  distinctiveness_score SMALLINT NOT NULL CHECK (distinctiveness_score BETWEEN 0 AND 100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_names_active ON public.pet_names (is_active);
CREATE INDEX IF NOT EXISTS idx_pet_names_language ON public.pet_names (language);
CREATE INDEX IF NOT EXISTS idx_pet_names_pet_types ON public.pet_names USING GIN (pet_types);
CREATE INDEX IF NOT EXISTS idx_pet_names_traits ON public.pet_names USING GIN (traits);

ALTER TABLE public.pet_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active pet names" ON public.pet_names;

DROP POLICY IF EXISTS "Admins can manage pet names" ON public.pet_names;
CREATE POLICY "Admins can manage pet names"
ON public.pet_names FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);

REVOKE SELECT ON public.pet_names FROM anon;
GRANT SELECT ON public.pet_names TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pet_names TO authenticated;
