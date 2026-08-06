begin;

alter table public.auspicious_names
    add column if not exists meaning_draft text,
    add column if not exists meaning_status text,
    add column if not exists meaning_source text,
    add column if not exists meaning_review_notes text,
    add column if not exists meaning_reviewed_at timestamptz,
    add column if not exists meaning_reviewed_by uuid references auth.users(id) on delete set null;

update public.auspicious_names
set meaning_status = case
    when nullif(btrim(meaning), '') is not null then 'approved'
    else 'pending'
end
where meaning_status is null;

alter table public.auspicious_names
    alter column meaning_status set default 'pending',
    alter column meaning_status set not null;

alter table public.auspicious_names
    drop constraint if exists auspicious_names_meaning_status_check;

alter table public.auspicious_names
    add constraint auspicious_names_meaning_status_check
    check (meaning_status in ('pending', 'draft', 'approved', 'rejected'));

create index if not exists auspicious_names_meaning_status_idx
    on public.auspicious_names (meaning_status, created_at desc);

commit;
