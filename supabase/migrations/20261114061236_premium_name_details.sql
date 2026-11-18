ALTER TABLE public.premium_names
    ADD COLUMN IF NOT EXISTS pronunciation text,
    ADD COLUMN IF NOT EXISTS meaning text,
    ADD COLUMN IF NOT EXISTS english_name text,
    ADD COLUMN IF NOT EXISTS pronunciation_status text NOT NULL DEFAULT 'pending' CHECK (pronunciation_status IN ('pending','draft','approved','rejected')),
    ADD COLUMN IF NOT EXISTS meaning_status text NOT NULL DEFAULT 'pending' CHECK (meaning_status IN ('pending','draft','approved','rejected'));
