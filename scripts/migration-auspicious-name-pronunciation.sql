begin;

alter table public.auspicious_names
    add column if not exists pronunciation text,
    add column if not exists pronunciation_draft text,
    add column if not exists pronunciation_status text,
    add column if not exists pronunciation_source text,
    add column if not exists pronunciation_variants text[] not null default '{}',
    add column if not exists pronunciation_evidence jsonb not null default '{}'::jsonb,
    add column if not exists pronunciation_review_notes text,
    add column if not exists pronunciation_reviewed_at timestamptz,
    add column if not exists pronunciation_reviewed_by uuid references auth.users(id) on delete set null;

alter table public.auspicious_names
    add column if not exists meaning_evidence jsonb not null default '{}'::jsonb;

update public.auspicious_names
set pronunciation_draft = coalesce(nullif(btrim(pronunciation_draft), ''), nullif(btrim(pronunciation), ''))
where pronunciation_draft is null
  and nullif(btrim(pronunciation), '') is not null;

update public.auspicious_names
set pronunciation_status = 'pending',
    pronunciation_source = coalesce(pronunciation_source, 'legacy-unreviewed'),
    pronunciation_review_notes = coalesce(pronunciation_review_notes, 'รอตรวจสอบคำอ่านก่อนเผยแพร่')
where pronunciation_status is null
   or (
       pronunciation_status = 'approved'
       and pronunciation_source is null
       and pronunciation_reviewed_at is null
   );

update public.auspicious_names
set pronunciation_status = 'pending',
    pronunciation_reviewed_at = null,
    pronunciation_reviewed_by = null,
    pronunciation_review_notes = coalesce(pronunciation_review_notes, 'รอตรวจหลักฐานคำอ่าน')
where pronunciation_status = 'approved'
  and jsonb_array_length(coalesce(pronunciation_evidence->'sources', '[]'::jsonb)) = 0;

alter table public.auspicious_names
    alter column pronunciation_status set default 'pending',
    alter column pronunciation_status set not null,
    drop constraint if exists auspicious_names_pronunciation_status_check;

alter table public.auspicious_names
    add constraint auspicious_names_pronunciation_status_check
    check (pronunciation_status in ('pending', 'draft', 'approved', 'rejected'));

create index if not exists auspicious_names_pronunciation_status_idx
    on public.auspicious_names (pronunciation_status, created_at desc);

create or replace function public.admin_import_auspicious_name_details(records jsonb)
returns table(updated_rows bigint, matched_names bigint)
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
            pronunciation_draft text,
            meaning text,
            pronunciation_status text,
            meaning_status text,
            pronunciation_evidence jsonb
        )
        where nullif(btrim(item.name), '') is null
           or nullif(btrim(coalesce(item.pronunciation_draft, item.pronunciation)), '') is null
           or nullif(btrim(item.meaning), '') is null
           or coalesce(item.pronunciation_status, '') not in ('pending', 'draft', 'approved', 'rejected')
           or coalesce(item.meaning_status, '') not in ('pending', 'draft', 'approved', 'rejected')
           or (
               item.pronunciation_status = 'approved'
               and (
                   coalesce(item.pronunciation_draft, item.pronunciation) ~ '[ฺ[:space:]]'
                   or coalesce(item.pronunciation_draft, item.pronunciation) ~ '(^-|-$|--+)'
                   or jsonb_array_length(coalesce(item.pronunciation_evidence->'sources', '[]'::jsonb)) = 0
                   or jsonb_array_length(coalesce(item.pronunciation_evidence->'roots', '[]'::jsonb)) = 0
               )
           )
    ) then
        raise exception 'name, pronunciation and meaning are required for every record';
    end if;

    return query
    with source_rows as (
        select distinct on (btrim(item.name))
            btrim(item.name) as name,
            btrim(coalesce(item.pronunciation_draft, item.pronunciation)) as pronunciation_draft,
            coalesce(item.pronunciation_variants, '{}'::text[]) as pronunciation_variants,
            coalesce(item.pronunciation_evidence, '{}'::jsonb) as pronunciation_evidence,
            btrim(item.meaning) as meaning,
            item.pronunciation_status,
            item.meaning_status,
            coalesce(item.meaning_evidence, '{}'::jsonb) as meaning_evidence,
            nullif(btrim(item.pronunciation_source), '') as pronunciation_source,
            nullif(btrim(item.pronunciation_review_notes), '') as pronunciation_review_notes
        from jsonb_to_recordset(records) as item(
            name text,
            pronunciation text,
            pronunciation_draft text,
            meaning text,
            pronunciation_status text,
            pronunciation_source text,
            pronunciation_review_notes text,
            pronunciation_variants text[],
            pronunciation_evidence jsonb,
            meaning_status text,
            meaning_evidence jsonb
        )
        order by btrim(item.name)
    ),
    updated as (
        update public.auspicious_names as target
        set pronunciation = case when source.pronunciation_status = 'approved' then source.pronunciation_draft else null end,
            pronunciation_draft = source.pronunciation_draft,
            pronunciation_variants = source.pronunciation_variants,
            pronunciation_evidence = source.pronunciation_evidence,
            pronunciation_status = source.pronunciation_status,
            pronunciation_source = source.pronunciation_source,
            pronunciation_review_notes = source.pronunciation_review_notes,
            pronunciation_reviewed_at = case when source.pronunciation_status = 'approved' then now() else null end,
            pronunciation_reviewed_by = null,
            meaning = source.meaning,
            meaning_draft = source.meaning,
            meaning_status = source.meaning_status,
            meaning_evidence = source.meaning_evidence,
            meaning_source = 'reviewed-csv-import',
            meaning_review_notes = case when source.meaning_status = 'approved' then null else 'รอตรวจรากศัพท์และหลักฐานความหมาย' end,
            meaning_reviewed_at = case when source.meaning_status = 'approved' then now() else null end,
            meaning_reviewed_by = null
        from source_rows as source
        where btrim(target.name) = source.name
        returning target.id, source.name
    )
    select count(*)::bigint, count(distinct updated.name)::bigint
    from updated;
end;
$$;

revoke all on function public.admin_import_auspicious_name_details(jsonb) from public;
revoke all on function public.admin_import_auspicious_name_details(jsonb) from anon;
revoke all on function public.admin_import_auspicious_name_details(jsonb) from authenticated;
grant execute on function public.admin_import_auspicious_name_details(jsonb) to service_role;

commit;
