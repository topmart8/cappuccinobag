begin;

create table if not exists public.crm_suppressions (
  id uuid primary key default gen_random_uuid(),
  match_type text not null check (
    match_type in ('email', 'domain', 'website', 'phone', 'whatsapp', 'company', 'contact_person')
  ),
  normalized_value text not null check (length(trim(normalized_value)) > 0),
  display_value text,
  reason text,
  active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists phone_normalized text,
  add column if not exists company_normalized text,
  add column if not exists website_normalized text,
  add column if not exists relationship_status text,
  add column if not exists is_existing_customer boolean not null default false,
  add column if not exists do_not_prospect boolean not null default false,
  add column if not exists blocked_reason text,
  add column if not exists duplicate_review boolean not null default false,
  add column if not exists duplicate_of uuid references public.customers(id) on delete set null,
  add column if not exists last_contacted_at timestamptz;

alter table public.inquiries
  add column if not exists identity_status text,
  add column if not exists identity_match_method text,
  add column if not exists suppression_id uuid references public.crm_suppressions(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'customers_relationship_status_check'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_relationship_status_check
      check (
        relationship_status is null or relationship_status in (
          'new_lead', 'existing_lead', 'existing_customer', 'old_customer',
          'blocked', 'supplier_non_buyer'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiries_identity_status_check'
      and conrelid = 'public.inquiries'::regclass
  ) then
    alter table public.inquiries
      add constraint inquiries_identity_status_check
      check (
        identity_status is null or identity_status in (
          'new_lead', 'existing_lead', 'existing_customer', 'old_customer',
          'blocked', 'duplicate', 'duplicate_review', 'supplier_non_buyer'
        )
      );
  end if;
end
$$;

create index if not exists customers_phone_normalized_idx
  on public.customers (phone_normalized) where phone_normalized is not null;
create index if not exists customers_company_normalized_idx
  on public.customers (company_normalized) where company_normalized is not null;
create index if not exists customers_website_normalized_idx
  on public.customers (website_normalized) where website_normalized is not null;
create index if not exists customers_relationship_status_idx
  on public.customers (relationship_status, is_existing_customer, do_not_prospect);
create index if not exists customers_duplicate_review_idx
  on public.customers (duplicate_review, duplicate_of)
  where duplicate_review or duplicate_of is not null;
create unique index if not exists crm_suppressions_active_match_uidx
  on public.crm_suppressions (match_type, normalized_value) where active;
create index if not exists inquiries_identity_status_idx
  on public.inquiries (identity_status, created_at desc);

alter table public.crm_suppressions enable row level security;

revoke all on table public.crm_suppressions from anon;
revoke all on table public.crm_suppressions from authenticated;
grant select, insert, update on table public.crm_suppressions to authenticated;
grant select, insert, update on table public.crm_suppressions to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'crm_suppressions'
      and policyname = 'crm admins manage suppressions'
  ) then
    create policy "crm admins manage suppressions"
      on public.crm_suppressions
      for all
      to authenticated
      using ((select public.crm_is_admin()))
      with check ((select public.crm_is_admin()));
  end if;
end
$$;

drop trigger if exists crm_suppressions_updated_at on public.crm_suppressions;
create trigger crm_suppressions_updated_at
before update on public.crm_suppressions
for each row execute function public.set_updated_at();

create or replace function public.crm_resolve_customer(p_input jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  p_email text := nullif(lower(trim(p_input->>'email_normalized')), '');
  p_phone text := nullif(trim(p_input->>'phone_normalized'), '');
  p_whatsapp text := nullif(trim(p_input->>'whatsapp_phone'), '');
  p_domain text := nullif(lower(trim(p_input->>'domain')), '');
  p_website text := nullif(lower(trim(p_input->>'website_normalized')), '');
  p_company text := nullif(lower(trim(p_input->>'company_normalized')), '');
  p_contact text := nullif(lower(trim(p_input->>'contact_normalized')), '');
  identity_key text;
  match_method text;
  customer_row public.customers%rowtype;
  possible_row public.customers%rowtype;
  suppression_row public.crm_suppressions%rowtype;
  strong_match_count integer := 0;
begin
  -- Every caller that can create a customer takes the same ordered identity locks.
  -- Overlapping submissions therefore serialize inside one database transaction.
  for identity_key in
    select value from unnest(array[
      case when p_email is not null then 'email:' || p_email end,
      case when p_phone is not null then 'phone:' || p_phone end,
      case when p_whatsapp is not null then 'whatsapp:' || p_whatsapp end,
      case when p_domain is not null then 'domain:' || p_domain end,
      case when p_website is not null then 'website:' || p_website end,
      case when p_company is not null then 'company:' || p_company end
    ]) as value
    where value is not null
    order by value
  loop
    perform pg_advisory_xact_lock(hashtextextended('crm-customer:' || identity_key, 0));
  end loop;

  select * into suppression_row
  from public.crm_suppressions
  where active and (
    (match_type = 'email' and normalized_value = p_email) or
    (match_type = 'phone' and normalized_value = p_phone) or
    (match_type = 'whatsapp' and normalized_value = p_whatsapp) or
    (match_type = 'domain' and normalized_value = p_domain) or
    (match_type = 'website' and normalized_value = p_website) or
    (match_type = 'company' and normalized_value = p_company) or
    (match_type = 'contact_person' and normalized_value = p_contact)
  )
  order by created_at asc
  limit 1;

  select * into customer_row
  from public.customers
  where (p_email is not null and email_normalized = p_email)
     or (p_phone is not null and phone_normalized = p_phone)
     or (p_whatsapp is not null and whatsapp_phone = p_whatsapp)
     or (p_domain is not null and domain = p_domain)
     or (p_website is not null and website_normalized = p_website)
  order by created_at asc
  limit 1;

  select count(*) into strong_match_count
  from public.customers
  where (p_email is not null and email_normalized = p_email)
     or (p_phone is not null and phone_normalized = p_phone)
     or (p_whatsapp is not null and whatsapp_phone = p_whatsapp)
     or (p_domain is not null and domain = p_domain)
     or (p_website is not null and website_normalized = p_website);

  if strong_match_count > 1 then
    return jsonb_build_object(
      'customer', to_jsonb(customer_row), 'created', false,
      'match_method', 'identity_conflict_review', 'duplicate_review', true,
      'suppression_id', suppression_row.id
    );
  end if;

  if customer_row.id is not null then
    match_method := case
      when p_email is not null and customer_row.email_normalized = p_email then 'email'
      when p_phone is not null and customer_row.phone_normalized = p_phone then 'phone'
      when p_whatsapp is not null and customer_row.whatsapp_phone = p_whatsapp then 'whatsapp'
      when p_domain is not null and customer_row.domain = p_domain then 'domain'
      else 'website'
    end;
    return jsonb_build_object(
      'customer', to_jsonb(customer_row), 'created', false,
      'match_method', match_method, 'duplicate_review', customer_row.duplicate_review,
      'suppression_id', suppression_row.id
    );
  end if;

  if p_company is not null then
    select * into possible_row
    from public.customers
    where company_normalized = p_company
    order by created_at asc
    limit 1;
  end if;

  -- A company-only match is deliberately conservative: associate the inquiry
  -- with the existing customer for human duplicate review, but never mutate
  -- that customer and never create a second customer automatically.
  if possible_row.id is not null then
    return jsonb_build_object(
      'customer', to_jsonb(possible_row), 'created', false,
      'match_method', 'company_review', 'duplicate_review', true,
      'suppression_id', suppression_row.id
    );
  end if;

  insert into public.customers (
    site, brand, source_channel, source, owner, assigned_owner,
    email, email_normalized, phone, phone_normalized, whatsapp_phone,
    name, company, company_normalized, website, website_normalized, domain,
    country, language, relationship_status, do_not_prospect, blocked_reason,
    duplicate_review, duplicate_of
  ) values (
    nullif(p_input->>'site', ''), nullif(p_input->>'brand', ''),
    coalesce(nullif(p_input->>'source_channel', ''), 'website'),
    coalesce(nullif(p_input->>'source', ''), 'website'),
    nullif(p_input->>'owner', ''), nullif(p_input->>'assigned_owner', ''),
    nullif(p_input->>'email', ''), p_email, nullif(p_input->>'phone', ''), p_phone, p_whatsapp,
    nullif(p_input->>'name', ''), nullif(p_input->>'company', ''), p_company,
    nullif(p_input->>'website', ''), p_website, p_domain,
    nullif(p_input->>'country', ''), coalesce(nullif(p_input->>'language', ''), 'en'),
    case when suppression_row.id is not null then 'blocked' else 'new_lead' end,
    suppression_row.id is not null,
    case when suppression_row.id is not null then coalesce(suppression_row.reason, 'Suppression list match') end,
    false,
    null
  ) returning * into customer_row;

  return jsonb_build_object(
    'customer', to_jsonb(customer_row), 'created', true,
    'match_method', 'created',
    'duplicate_review', false,
    'suppression_id', suppression_row.id
  );
end;
$$;

revoke execute on function public.crm_resolve_customer(jsonb) from public, anon, authenticated;
grant execute on function public.crm_resolve_customer(jsonb) to service_role;

comment on table public.crm_suppressions is
  'Manual CRM suppression list checked before any future automated outbound action.';
comment on column public.customers.relationship_status is
  'Manual CRM relationship classification; ingest never overwrites an existing value.';
comment on column public.customers.do_not_prospect is
  'Hard exclusion flag for Snowivio, Codex lead generation and every outbound workflow.';
comment on column public.customers.duplicate_review is
  'True when only a weak company-name match exists and a human must review before outreach.';
comment on column public.inquiries.identity_status is
  'Identity resolution result for this inquiry without mutating the matched customer.';

commit;
