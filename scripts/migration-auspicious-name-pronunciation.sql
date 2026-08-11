begin;

alter table public.auspicious_names
    add column if not exists pronunciation text,
    add column if not exists pronunciation_status text,
    add column if not exists pronunciation_source text,
    add column if not exists pronunciation_review_notes text,
    add column if not exists pronunciation_reviewed_at timestamptz,
    add column if not exists pronunciation_reviewed_by uuid references auth.users(id) on delete set null;

update public.auspicious_names
set pronunciation_status = case
    when nullif(btrim(pronunciation), '') is not null then 'approved'
    else 'pending'
end
where pronunciation_status is null;

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
        from jsonb_to_recordset(records) as item(name text, pronunciation text, meaning text, pronunciation_status text)
        where nullif(btrim(item.name), '') is null
           or nullif(btrim(item.pronunciation), '') is null
           or nullif(btrim(item.meaning), '') is null
           or coalesce(item.pronunciation_status, '') not in ('pending', 'draft', 'approved', 'rejected')
    ) then
        raise exception 'name, pronunciation and meaning are required for every record';
    end if;

    return query
    with source_rows as (
        select distinct on (btrim(item.name))
            btrim(item.name) as name,
            btrim(item.pronunciation) as pronunciation,
            btrim(item.meaning) as meaning,
            item.pronunciation_status,
            nullif(btrim(item.pronunciation_source), '') as pronunciation_source,
            nullif(btrim(item.pronunciation_review_notes), '') as pronunciation_review_notes
        from jsonb_to_recordset(records) as item(
            name text,
            pronunciation text,
            meaning text,
            pronunciation_status text,
            pronunciation_source text,
            pronunciation_review_notes text
        )
        order by btrim(item.name)
    ),
    updated as (
        update public.auspicious_names as target
        set pronunciation = source.pronunciation,
            pronunciation_status = source.pronunciation_status,
            pronunciation_source = source.pronunciation_source,
            pronunciation_review_notes = source.pronunciation_review_notes,
            pronunciation_reviewed_at = case when source.pronunciation_status = 'approved' then now() else null end,
            pronunciation_reviewed_by = null,
            meaning = source.meaning,
            meaning_draft = source.meaning,
            meaning_status = 'approved',
            meaning_source = 'csv-import',
            meaning_review_notes = null,
            meaning_reviewed_at = now(),
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
