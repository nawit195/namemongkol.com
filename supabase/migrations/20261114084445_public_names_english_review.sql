-- Drafts allow rollout without exposing unreviewed suggestions in older clients.
ALTER TABLE public.auspicious_names
    ADD COLUMN IF NOT EXISTS english_name_draft text,
    ADD COLUMN IF NOT EXISTS english_name_status text
        CHECK (english_name_status IN ('pending', 'draft', 'approved', 'rejected')),
    ADD COLUMN IF NOT EXISTS english_name_source text,
    ADD COLUMN IF NOT EXISTS english_name_reading text;

COMMENT ON COLUMN public.auspicious_names.english_name_draft IS 'Suggested Roman spelling, separate from existing source/document spellings.';
COMMENT ON COLUMN public.auspicious_names.english_name_reading IS 'Exact Thai reading used for a generated draft. Changed readings invalidate that draft.';
