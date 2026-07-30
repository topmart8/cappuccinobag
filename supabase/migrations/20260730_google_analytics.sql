begin;

create table if not exists public.analytics_daily (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'google',
  owner text not null default 'system',
  metric_date date not null,
  clicks bigint not null default 0 check (clicks >= 0),
  impressions bigint not null default 0 check (impressions >= 0),
  ctr numeric(12,8) not null default 0 check (ctr >= 0),
  position numeric(12,4) not null default 0 check (position >= 0),
  sessions bigint not null default 0 check (sessions >= 0),
  active_users bigint not null default 0 check (active_users >= 0),
  engaged_sessions bigint not null default 0 check (engaged_sessions >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, metric_date)
);

create table if not exists public.analytics_search_rows (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'gsc',
  owner text not null default 'system',
  snapshot_date date not null,
  range_start date not null,
  range_end date not null,
  dimension_type text not null check (dimension_type in ('query','page')),
  dimension_value text not null,
  clicks bigint not null default 0 check (clicks >= 0),
  impressions bigint not null default 0 check (impressions >= 0),
  ctr numeric(12,8) not null default 0 check (ctr >= 0),
  position numeric(12,4) not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, snapshot_date, dimension_type, dimension_value)
);

create table if not exists public.analytics_sync_runs (
  id uuid primary key default gen_random_uuid(),
  site text not null check (site in ('cappuccinobag','novlane')),
  source text not null default 'google',
  owner text not null default 'system',
  status text not null check (status in ('completed','partial','failed')),
  range_start date not null,
  range_end date not null,
  row_count integer not null default 0 check (row_count >= 0),
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analytics_daily_site_date_idx
  on public.analytics_daily (site, metric_date desc);
create index if not exists analytics_search_site_snapshot_idx
  on public.analytics_search_rows (site, snapshot_date desc, dimension_type, clicks desc);
create index if not exists analytics_sync_site_created_idx
  on public.analytics_sync_runs (site, created_at desc);

create or replace function public.crm_can_view_analytics(row_site text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and active = true
      and (site = 'all' or site = row_site)
  );
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'analytics_daily','analytics_search_rows','analytics_sync_runs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "analytics members read" on public.%I', table_name);
    execute format(
      'create policy "analytics members read" on public.%I for select to authenticated using (public.crm_can_view_analytics(site))',
      table_name
    );
    execute format('drop policy if exists "analytics service role manages" on public.%I', table_name);
    execute format(
      'create policy "analytics service role manages" on public.%I for all to service_role using (true) with check (true)',
      table_name
    );
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_updated_at', table_name
    );
  end loop;
end $$;

commit;
