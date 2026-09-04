begin;

alter table public.auspicious_names
    add column if not exists publication_status text not null default 'published',
    add column if not exists publication_reason text,
    add column if not exists publication_evidence jsonb not null default '{}'::jsonb,
    add column if not exists publication_reviewed_at timestamptz;

alter table public.auspicious_names
    drop constraint if exists auspicious_names_publication_status_check;

alter table public.auspicious_names
    add constraint auspicious_names_publication_status_check
    check (publication_status in ('published', 'hidden'));

create index if not exists auspicious_names_publication_status_idx
    on public.auspicious_names (publication_status, name);

create or replace function public.admin_apply_name_linguistic_review(records jsonb)
returns table(updated_rows bigint, matched_names bigint, published_rows bigint, hidden_rows bigint)
language plpgsql
security invoker
set search_path = public
as $$
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'service_role is required';
    end if;

    if jsonb_typeof(records) <> 'array' or jsonb_array_length(records) = 0 then
        raise exception 'records must be a non-empty JSON array';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(records) as item(
            name text,
            pronunciation text,
            pronunciation_variants text[],
            pronunciation_status text,
            pronunciation_evidence jsonb,
            publication_status text,
            publication_reason text,
            publication_evidence jsonb
        )
        where nullif(btrim(item.name), '') is null
           or coalesce(item.publication_status, '') not in ('published', 'hidden')
           or coalesce(item.pronunciation_status, '') not in ('approved', 'rejected')
           or nullif(btrim(item.publication_reason), '') is null
           or (
               item.publication_status = 'published'
               and (
                   item.pronunciation_status <> 'approved'
                   or nullif(btrim(item.pronunciation), '') is null
                   or item.pronunciation ~ '[ฺ[:space:]]'
                   or item.pronunciation ~ '(^-|-$|--+)'
                   or jsonb_array_length(coalesce(item.pronunciation_evidence->'sources', '[]'::jsonb)) = 0
                   or jsonb_array_length(coalesce(item.pronunciation_evidence->'roots', '[]'::jsonb)) = 0
                   or jsonb_array_length(coalesce(item.publication_evidence->'sources', '[]'::jsonb)) = 0
                   or jsonb_array_length(coalesce(item.publication_evidence->'roots', '[]'::jsonb)) = 0
               )
           )
           or (item.publication_status = 'hidden' and item.pronunciation_status <> 'rejected')
    ) then
        raise exception 'invalid linguistic review record';
    end if;

    if (
        select count(*)
        from jsonb_to_recordset(records) as item(name text)
    ) <> (
        select count(distinct btrim(item.name))
        from jsonb_to_recordset(records) as item(name text)
    ) then
        raise exception 'review names must be unique';
    end if;

    return query
    with source_rows as (
        select
            btrim(item.name) as name,
            nullif(btrim(item.pronunciation), '') as pronunciation,
            coalesce(item.pronunciation_variants, '{}'::text[]) as pronunciation_variants,
            item.pronunciation_status,
            coalesce(item.pronunciation_evidence, '{}'::jsonb) as pronunciation_evidence,
            item.publication_status,
            btrim(item.publication_reason) as publication_reason,
            coalesce(item.publication_evidence, '{}'::jsonb) as publication_evidence
        from jsonb_to_recordset(records) as item(
            name text,
            pronunciation text,
            pronunciation_variants text[],
            pronunciation_status text,
            pronunciation_evidence jsonb,
            publication_status text,
            publication_reason text,
            publication_evidence jsonb
        )
    ),
    updated as (
        update public.auspicious_names as target
        set pronunciation = case when source.publication_status = 'published' then source.pronunciation else null end,
            pronunciation_draft = source.pronunciation,
            pronunciation_variants = source.pronunciation_variants,
            pronunciation_status = source.pronunciation_status,
            pronunciation_evidence = source.pronunciation_evidence,
            pronunciation_source = 'initial-kho-curated-review',
            pronunciation_review_notes = source.publication_reason,
            pronunciation_reviewed_at = now(),
            pronunciation_reviewed_by = null,
            publication_status = source.publication_status,
            publication_reason = source.publication_reason,
            publication_evidence = source.publication_evidence,
            publication_reviewed_at = now()
        from source_rows as source
        where btrim(target.name) = source.name
        returning target.id, target.name, target.publication_status
    )
    select
        count(*)::bigint,
        count(distinct updated.name)::bigint,
        count(*) filter (where updated.publication_status = 'published')::bigint,
        count(*) filter (where updated.publication_status = 'hidden')::bigint
    from updated;
end;
$$;

revoke all on function public.admin_apply_name_linguistic_review(jsonb) from public;
revoke all on function public.admin_apply_name_linguistic_review(jsonb) from anon;
revoke all on function public.admin_apply_name_linguistic_review(jsonb) from authenticated;
grant execute on function public.admin_apply_name_linguistic_review(jsonb) to service_role;

commit;
