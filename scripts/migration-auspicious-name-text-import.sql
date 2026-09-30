begin;

create or replace function public.admin_import_auspicious_name_text(records jsonb)
returns table(updated_rows bigint, matched_names bigint)
language plpgsql
security invoker
set search_path = public
as $$
declare
    expected_rows bigint;
    affected_rows bigint;
begin
    if coalesce(auth.role(), '') <> 'service_role' then
        raise exception 'service_role is required';
    end if;

    if jsonb_typeof(records) <> 'array' or jsonb_array_length(records) = 0 then
        raise exception 'records must be a non-empty JSON array';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(records) as item(name text, pronunciation text, meaning text)
        where nullif(btrim(item.name), '') is null
           or nullif(btrim(item.pronunciation), '') is null
           or nullif(btrim(item.meaning), '') is null
    ) then
        raise exception 'name, pronunciation and meaning are required for every record';
    end if;

    select count(*) into expected_rows
    from jsonb_to_recordset(records) as item(name text);

    if expected_rows <> (
        select count(distinct btrim(item.name))
        from jsonb_to_recordset(records) as item(name text)
    ) then
        raise exception 'import names must be unique';
    end if;

    with source_rows as (
        select
            btrim(item.name) as name,
            btrim(item.pronunciation) as pronunciation,
            btrim(item.meaning) as meaning
        from jsonb_to_recordset(records) as item(name text, pronunciation text, meaning text)
    ), updated as (
        update public.auspicious_names as target
        set pronunciation = source.pronunciation,
            meaning = source.meaning
        from source_rows as source
        where btrim(target.name) = source.name
        returning target.id, source.name
    )
    select count(*) into affected_rows from updated;

    if affected_rows <> expected_rows then
        raise exception 'import match count mismatch: expected %, updated %', expected_rows, affected_rows;
    end if;

    return query select affected_rows, expected_rows;
end;
$$;

revoke all on function public.admin_import_auspicious_name_text(jsonb) from public;
revoke all on function public.admin_import_auspicious_name_text(jsonb) from anon;
revoke all on function public.admin_import_auspicious_name_text(jsonb) from authenticated;
grant execute on function public.admin_import_auspicious_name_text(jsonb) to service_role;

commit;
