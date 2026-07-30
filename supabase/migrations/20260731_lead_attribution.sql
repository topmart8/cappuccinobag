begin;

alter table public.inquiries
  add column if not exists current_referrer text,
  add column if not exists current_utm_source text,
  add column if not exists current_utm_medium text,
  add column if not exists current_utm_campaign text,
  add column if not exists current_utm_content text,
  add column if not exists current_utm_term text,
  add column if not exists current_gclid text,
  add column if not exists current_msclkid text;

comment on column public.inquiries.current_referrer is
  'Referrer captured for the visit that produced the inquiry; contains no form PII.';
comment on column public.inquiries.current_utm_source is
  'UTM source for the visit that produced the inquiry; first-touch UTM remains in utm_source.';

commit;
