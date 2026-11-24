-- The repository is public. Paid records live only in this server-only table.
CREATE TABLE public.nickname_catalog (
    catalog_version text NOT NULL,
    id text NOT NULL CHECK (id ~ '^nn_[a-f0-9]{20}$'),
    record jsonb NOT NULL CHECK (jsonb_typeof(record) = 'object' AND record->>'grade' = 'A+' AND record->>'id' = id),
    PRIMARY KEY (catalog_version, id)
);
ALTER TABLE public.nickname_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nickname_catalog FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nickname_catalog TO service_role;
CREATE POLICY nickname_catalog_server_only ON public.nickname_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);
