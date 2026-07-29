-- Lead CRM v2: multi-site lead library, roles, imports, tasks, drafts and activity timeline.
-- Safe to run after 20260728_unified_crm.sql.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists industry text,
  add column if not exists website text,
  add column if not exists domain text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists linkedin_url text,
  add column if not exists product_keywords text[] not null default '{}',
  add column if not exists source_url text,
  add column if not exists source text not null default 'website',
  add column if not exists owner text,
  add column if not exists score integer not null default 0,
  add column if not exists score_override integer,
  add column if not exists tags text[] not null default '{}',
  add column if not exists notes text,
  add column if not exists is_demo boolean not null default false;

alter table public.inquiries
  add column if not exists source text not null default 'website',
  add column if not exists owner text,
  add column if not exists company_website text,
  add column if not exists source_url text,
  add column if not exists is_demo boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'customers_stage_v2_check'
  ) then
    alter table public.customers add constraint customers_stage_v2_check
      check (stage in ('new','qualified','contacted','replied','quoted','sample','negotiation','won','lost')) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'inquiries_stage_v2_check'
  ) then
    alter table public.inquiries add constraint inquiries_stage_v2_check
      check (stage in ('new','qualified','contacted','replied','quoted','sample','negotiation','won','lost')) not valid;
  end if;
end $$;

create index if not exists customers_site_stage_idx on public.customers (site, stage, updated_at desc);
create index if not exists customers_owner_follow_up_idx on public.customers (owner, next_follow_up)
  where next_follow_up is not null;
create index if not exists customers_country_industry_idx on public.customers (country, industry);
create index if not exists customers_domain_idx on public.customers (lower(domain))
  where domain is not null;
create index if not exists customers_tags_gin_idx on public.customers using gin (tags);
create index if not exists customers_product_keywords_gin_idx on public.customers using gin (product_keywords);
create index if not exists inquiries_site_source_created_idx on public.inquiries (site, source, created_at desc);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'sales' check (role in ('admin','sales')),
  site text not null default 'all' check (site in ('all','cappuccinobag','novlane')),
  source text not null default 'system',
  owner text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'crm',
  owner text,
  activity_type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'crm',
  owner text,
  title text not null,
  description text,
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','doing','done','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'crm',
  owner text,
  recipient text,
  subject text,
  body text not null,
  status text not null default 'draft' check (status in ('draft','approved','sent','rejected')),
  requires_human_review boolean not null default true,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_drafts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'crm',
  owner text,
  recipient text,
  body text not null,
  source_page text,
  product_category text,
  status text not null default 'draft' check (status in ('draft','approved','sent','rejected')),
  mode text not null default 'draft_only' check (mode = 'draft_only'),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'csv',
  owner text,
  filename text not null,
  status text not null default 'preview' check (status in ('preview','processing','completed','failed')),
  mapping jsonb not null default '{}'::jsonb,
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  error_rows integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.imports(id) on delete cascade,
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'csv',
  owner text,
  row_number integer not null,
  raw_data jsonb not null default '{}'::jsonb,
  normalized_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','imported','duplicate','error')),
  error_message text,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (import_id, row_number)
);

create index if not exists activities_customer_created_idx on public.activities (customer_id, created_at desc);
create index if not exists activities_site_created_idx on public.activities (site, created_at desc);
create index if not exists tasks_owner_due_idx on public.tasks (owner, status, due_at);
create index if not exists email_drafts_review_idx on public.email_drafts (site, status, created_at desc);
create index if not exists whatsapp_drafts_review_idx on public.whatsapp_drafts (site, status, created_at desc);
create index if not exists imports_site_created_idx on public.imports (site, created_at desc);
create index if not exists import_rows_import_status_idx on public.import_rows (import_id, status);

create or replace function public.crm_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role = 'admin'
  );
$$;

create or replace function public.crm_can_access(row_site text, row_owner text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and active = true
      and (role = 'admin' or row_owner = profiles.email or row_owner = profiles.owner)
      and (site = 'all' or site = row_site)
  );
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','activities','tasks','email_drafts','whatsapp_drafts','imports','import_rows'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "profiles read self or admin" on public.profiles;
create policy "profiles read self or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.crm_is_admin());
drop policy if exists "profiles admin manages" on public.profiles;
create policy "profiles admin manages" on public.profiles for all to authenticated
  using (public.crm_is_admin()) with check (public.crm_is_admin());

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'activities','tasks','email_drafts','whatsapp_drafts','imports','import_rows'
  ]
  loop
    execute format('drop policy if exists "crm member access" on public.%I', table_name);
    execute format(
      'create policy "crm member access" on public.%I for all to authenticated using (public.crm_can_access(site, owner)) with check (public.crm_can_access(site, owner))',
      table_name
    );
    execute format('drop policy if exists "service role only" on public.%I', table_name);
    execute format(
      'create policy "service role only" on public.%I for all to service_role using (true) with check (true)',
      table_name
    );
  end loop;
end $$;

drop policy if exists "crm attachment members read" on storage.objects;
create policy "crm attachment members read" on storage.objects for select to authenticated
  using (
    bucket_id = 'crm-attachments'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and active = true
        and (
          role = 'admin'
          or site = 'all'
          or site = (storage.foldername(name))[1]
        )
    )
  );

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','activities','tasks','email_drafts','whatsapp_drafts','imports','import_rows'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_updated_at', table_name
    );
  end loop;
end $$;
