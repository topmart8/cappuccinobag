begin;

alter table public.inquiries
  add column if not exists submission_id uuid,
  add column if not exists site_source text,
  add column if not exists dedupe_key text,
  add column if not exists email_status text not null default 'pending',
  add column if not exists customization text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_site_source_check'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_site_source_check
      check (site_source is null or site_source in ('cappuccino', 'novlane'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_email_status_check'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_email_status_check
      check (email_status in ('pending', 'sent', 'skipped', 'failed'));
  end if;
end
$$;

create unique index if not exists inquiries_submission_id_uidx
  on public.inquiries (submission_id);

create index if not exists inquiries_dedupe_key_idx
  on public.inquiries (dedupe_key);

comment on column public.inquiries.submission_id is
  'Application-generated website submission UUID; unique when present for idempotent ingest.';
comment on column public.inquiries.site_source is
  'Validated shared website source: cappuccino or novlane. Null remains allowed for non-website legacy channels.';
comment on column public.inquiries.dedupe_key is
  'Server-generated SHA-256 key scoped by site_source and submission_id.';
comment on column public.inquiries.email_status is
  'Notification-email state managed by the shared application ingest path.';

commit;
