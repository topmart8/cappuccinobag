create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text unique,
  site text check (site in ('cappuccinobag', 'novlane')),
  brand text check (brand in ('Cappuccino Bag', 'Novlane')),
  source_channel text not null default 'website',
  email text,
  email_normalized text,
  whatsapp_phone text,
  name text,
  company text,
  phone text,
  country text,
  language text not null default 'en',
  assigned_owner text,
  stage text not null default 'new',
  next_follow_up timestamptz,
  human_takeover boolean not null default false,
  auto_reply_enabled boolean not null default true,
  last_customer_message_at timestamptz,
  last_business_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_normalized_uidx
  on public.customers (email_normalized) where email_normalized is not null;
create unique index if not exists customers_whatsapp_phone_uidx
  on public.customers (whatsapp_phone) where whatsapp_phone is not null;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  site text not null check (site in ('cappuccinobag', 'novlane')),
  brand text not null check (brand in ('Cappuccino Bag', 'Novlane')),
  brand_confirmed boolean not null default true,
  source_channel text not null default 'website' check (source_channel in ('website', 'whatsapp', 'email', 'manual')),
  name text,
  company text,
  email text,
  phone text,
  whatsapp text,
  country text,
  language text not null default 'en',
  product text,
  product_category text,
  quantity text,
  material text,
  logo_method text,
  target_price text,
  target_delivery_date text,
  message text,
  uploaded_files jsonb not null default '[]'::jsonb,
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  intent text,
  risk_level text not null default 'low' check (risk_level in ('low', 'medium', 'high')),
  assigned_owner text,
  stage text not null default 'new',
  next_follow_up timestamptz,
  human_takeover boolean not null default false,
  auto_reply_enabled boolean not null default true,
  first_landing_page text,
  current_page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  msclkid text,
  first_visit_time timestamptz,
  submit_time timestamptz not null default now(),
  device text,
  attribution_country text,
  ai_customer_summary text,
  ai_recommended_action text,
  ai_reply_draft text,
  ai_result jsonb,
  reply_status text not null default 'unreplied',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  site text not null check (site in ('cappuccinobag', 'novlane')),
  brand text not null check (brand in ('Cappuccino Bag', 'Novlane')),
  brand_confirmed boolean not null default true,
  source_channel text not null,
  external_conversation_id text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  external_message_id text unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null default 'text',
  body text,
  status text not null default 'received',
  provider_timestamp timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_reply_logs (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  site text not null check (site in ('cappuccinobag', 'novlane')),
  brand text not null check (brand in ('Cappuccino Bag', 'Novlane')),
  mode text not null check (mode in ('manual', 'draft_only', 'safe_auto')),
  model text,
  input_summary text,
  result jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  site text not null check (site in ('cappuccinobag', 'novlane')),
  brand text not null check (brand in ('Cappuccino Bag', 'Novlane')),
  sequence_number integer not null check (sequence_number between 0 and 2),
  due_at timestamptz not null,
  channel text not null default 'whatsapp',
  draft_body text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inquiry_id, sequence_number)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'meta_whatsapp',
  provider_event_id text not null unique,
  event_type text not null,
  payload_hash text not null,
  status text not null default 'received',
  attempt_count integer not null default 1,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  storage_bucket text,
  storage_path text,
  original_name text,
  content_type text,
  size_bytes bigint,
  provider_media_id text,
  scan_status text not null default 'pending',
  risk_level text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_customer_idx on public.inquiries (customer_id, created_at desc);
create index if not exists inquiries_site_idx on public.inquiries (site, created_at desc);
create index if not exists inquiries_review_idx on public.inquiries (human_takeover, risk_level, reply_status);
create index if not exists conversations_customer_idx on public.conversations (customer_id, updated_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists follow_up_due_idx on public.follow_up_tasks (status, due_at);

alter table public.inquiries add column if not exists brand_confirmed boolean not null default true;
alter table public.conversations add column if not exists brand_confirmed boolean not null default true;
alter table public.customers add column if not exists customer_number text;
alter table public.customers add column if not exists site text check (site in ('cappuccinobag', 'novlane'));
alter table public.customers add column if not exists brand text check (brand in ('Cappuccino Bag', 'Novlane'));
alter table public.customers add column if not exists source_channel text not null default 'website';
create unique index if not exists customers_customer_number_uidx on public.customers (customer_number)
  where customer_number is not null;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_customer_number()
returns trigger language plpgsql as $$
declare
  prefix text;
  date_part text;
  next_value integer;
begin
  if new.customer_number is not null or new.site is null then return new; end if;
  prefix := case when new.site = 'cappuccinobag' then 'CAP' else 'NOV' end;
  date_part := to_char(coalesce(new.created_at, now()) at time zone 'UTC', 'YYYYMMDD');
  perform pg_advisory_xact_lock(hashtext('customer-' || prefix || date_part));
  select coalesce(max(nullif(split_part(customer_number, '-', 3), '')::integer), 0) + 1
    into next_value
    from public.customers
   where customer_number like prefix || '-' || date_part || '-%';
  new.customer_number := prefix || '-' || date_part || '-' || lpad(next_value::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists customers_assign_number on public.customers;
create trigger customers_assign_number before insert or update of site on public.customers
for each row execute function public.assign_customer_number();

with first_inquiry as (
  select distinct on (customer_id) customer_id, site, brand, source_channel
    from public.inquiries
   order by customer_id, created_at asc
)
update public.customers as customer
   set site = coalesce(customer.site, first_inquiry.site),
       brand = coalesce(customer.brand, first_inquiry.brand),
       source_channel = coalesce(customer.source_channel, first_inquiry.source_channel)
  from first_inquiry
 where customer.id = first_inquiry.customer_id
   and (customer.site is null or customer.brand is null or customer.customer_number is null);

create or replace function public.assign_inquiry_number()
returns trigger language plpgsql as $$
declare
  prefix text;
  date_part text;
  next_value integer;
begin
  if new.inquiry_number is not null then return new; end if;
  prefix := case when new.site = 'cappuccinobag' then 'CAP' else 'NOV' end;
  date_part := to_char(coalesce(new.created_at, now()) at time zone 'UTC', 'YYYYMMDD');
  perform pg_advisory_xact_lock(hashtext(prefix || date_part));
  select coalesce(max(nullif(split_part(inquiry_number, '-', 3), '')::integer), 0) + 1
    into next_value
    from public.inquiries
   where inquiry_number like prefix || '-' || date_part || '-%';
  new.inquiry_number := prefix || '-' || date_part || '-' || lpad(next_value::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists inquiries_assign_number on public.inquiries;
create trigger inquiries_assign_number before insert on public.inquiries
for each row execute function public.assign_inquiry_number();

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at before update on public.customers
for each row execute function public.set_updated_at();
drop trigger if exists inquiries_updated_at on public.inquiries;
create trigger inquiries_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();
drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at before update on public.conversations
for each row execute function public.set_updated_at();
drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at before update on public.messages
for each row execute function public.set_updated_at();
drop trigger if exists follow_up_tasks_updated_at on public.follow_up_tasks;
create trigger follow_up_tasks_updated_at before update on public.follow_up_tasks
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.inquiries enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.ai_reply_logs enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.webhook_events enable row level security;
alter table public.attachments enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['customers','inquiries','conversations','messages','ai_reply_logs','follow_up_tasks','webhook_events','attachments']
  loop
    if not exists (
      select 1 from pg_policies
       where schemaname = 'public' and tablename = table_name and policyname = 'service role only'
    ) then
      execute format(
        'create policy "service role only" on public.%I for all to service_role using (true) with check (true)',
        table_name
      );
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('crm-attachments', 'crm-attachments', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'service role manages crm attachments'
  ) then
    create policy "service role manages crm attachments"
      on storage.objects for all to service_role
      using (bucket_id = 'crm-attachments')
      with check (bucket_id = 'crm-attachments');
  end if;
end $$;
