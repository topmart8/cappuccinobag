-- Cappuccino Bag SEO/content operations. Additive and draft-only by design.
-- Requires the existing CRM profiles table for authenticated admin access.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.seo_keywords (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  keyword text not null,
  normalized_keyword text not null,
  language text not null default 'en',
  country text not null default 'global',
  source text not null default 'manual',
  search_volume integer,
  keyword_difficulty numeric(5,2),
  cpc numeric(12,4),
  commercial_intent_score integer check (commercial_intent_score between 0 and 100),
  search_intent text,
  buyer_stage text,
  business_fit_score integer check (business_fit_score between 0 and 100),
  ranking_opportunity_score integer check (ranking_opportunity_score between 0 and 100),
  conversion_value_score integer check (conversion_value_score between 0 and 100),
  opportunity_score integer check (opportunity_score between 0 and 100),
  target_category text,
  target_page_type text,
  target_url text,
  status text not null default 'manual_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, normalized_keyword, country)
);

create table if not exists public.seo_keyword_clusters (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  cluster_name text not null,
  primary_keyword text not null,
  supporting_keywords text[] not null default '{}',
  search_intent text,
  recommended_page_type text,
  assigned_url text,
  status text not null default 'manual_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, cluster_name)
);

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  url text not null,
  slug text not null,
  page_type text not null,
  title text,
  h1 text,
  meta_description text,
  canonical text,
  primary_keyword text,
  supporting_keywords text[] not null default '{}',
  category text,
  product_sku text,
  status text not null default 'manual_review',
  published_at timestamptz,
  last_reviewed_at timestamptz,
  content_score integer check (content_score between 0 and 100),
  inbound_internal_links integer not null default 0,
  outbound_internal_links integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, url),
  unique (site, slug)
);

create table if not exists public.content_tasks (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  task_type text not null,
  title text not null,
  primary_keyword text,
  keyword_cluster_id uuid references public.seo_keyword_clusters(id) on delete set null,
  target_url text,
  target_page_type text,
  content_brief jsonb not null default '{}'::jsonb,
  generated_content jsonb not null default '{}'::jsonb,
  review_status text not null default 'manual_review',
  review_score integer check (review_score between 0 and 100),
  assigned_to text,
  scheduled_at timestamptz,
  published_at timestamptz,
  branch_name text,
  pull_request_url text,
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (review_status <> 'published' or published_at is not null)
);

create table if not exists public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  content_task_id uuid not null references public.content_tasks(id) on delete cascade,
  factual_accuracy_score integer check (factual_accuracy_score between 0 and 100),
  seo_score integer check (seo_score between 0 and 100),
  buyer_value_score integer check (buyer_value_score between 0 and 100),
  brand_consistency_score integer check (brand_consistency_score between 0 and 100),
  language_score integer check (language_score between 0 and 100),
  duplicate_risk integer check (duplicate_risk between 0 and 100),
  hallucination_risk integer check (hallucination_risk between 0 and 100),
  review_notes jsonb not null default '[]'::jsonb,
  decision text not null default 'manual_review_required',
  reviewer_type text not null default 'automation',
  reviewer_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_link_suggestions (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  source_url text not null,
  target_url text not null,
  anchor_text text not null,
  reason text,
  relevance_score integer check (relevance_score between 0 and 100),
  status text not null default 'manual_review',
  inserted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (site, source_url, target_url, anchor_text)
);

create table if not exists public.image_jobs (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  content_task_id uuid references public.content_tasks(id) on delete cascade,
  sku text,
  image_type text not null,
  source_image text,
  prompt text not null,
  negative_prompt text,
  aspect_ratio text not null default '1:1' check (aspect_ratio in ('1:1','4:5','16:9','9:16')),
  output_filename text not null,
  output_path text,
  alt_text text not null,
  status text not null default 'manual_review',
  review_notes text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, output_filename)
);

create table if not exists public.publishing_runs (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  run_type text not null,
  branch_name text,
  commit_sha text,
  pull_request_url text,
  preview_url text,
  production_url text,
  build_status text not null default 'pending',
  seo_check_status text not null default 'pending',
  link_check_status text not null default 'pending',
  image_check_status text not null default 'pending',
  approval_status text not null default 'manual_review',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (approval_status <> 'published' or production_url is not null)
);

create table if not exists public.analytics_page_performance (
  id uuid primary key default gen_random_uuid(),
  site text not null default 'cappuccinobag' check (site = 'cappuccinobag'),
  url text not null,
  date date not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric(8,6) not null default 0,
  average_position numeric(8,3),
  sessions integer,
  inquiries integer,
  conversion_rate numeric(8,6),
  content_decay_score integer check (content_decay_score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (site, url, date)
);

create index if not exists seo_keywords_keyword_idx on public.seo_keywords (normalized_keyword);
create index if not exists seo_keywords_status_idx on public.seo_keywords (site, status, opportunity_score desc);
create index if not exists seo_keywords_created_idx on public.seo_keywords (created_at desc);
create index if not exists seo_keywords_category_idx on public.seo_keywords (target_category, status);
create index if not exists seo_clusters_status_idx on public.seo_keyword_clusters (site, status, created_at desc);
create index if not exists seo_pages_status_idx on public.seo_pages (site, status, updated_at desc);
create index if not exists seo_pages_url_idx on public.seo_pages (url);
create index if not exists seo_pages_category_idx on public.seo_pages (category, status);
create index if not exists content_tasks_status_idx on public.content_tasks (site, review_status, created_at desc);
create index if not exists content_tasks_target_url_idx on public.content_tasks (target_url);
create index if not exists content_tasks_keyword_cluster_idx on public.content_tasks (keyword_cluster_id); create index if not exists content_reviews_task_idx on public.content_reviews (content_task_id, created_at desc);
create index if not exists internal_links_status_idx on public.internal_link_suggestions (site, status, relevance_score desc);
create index if not exists internal_links_source_idx on public.internal_link_suggestions (source_url);
create index if not exists internal_links_target_idx on public.internal_link_suggestions (target_url);
create index if not exists image_jobs_status_idx on public.image_jobs (site, status, created_at desc);
create index if not exists image_jobs_content_task_idx on public.image_jobs (content_task_id); create index if not exists publishing_runs_status_idx on public.publishing_runs (site, approval_status, created_at desc);
create index if not exists analytics_page_date_idx on public.analytics_page_performance (url, date desc);
create index if not exists analytics_decay_idx on public.analytics_page_performance (site, content_decay_score desc, date desc);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'seo_keywords','seo_keyword_clusters','seo_pages','content_tasks','content_reviews',
    'internal_link_suggestions','image_jobs','publishing_runs','analytics_page_performance'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "seo admins manage" on public.%I', table_name);
    execute format(
      'create policy "seo admins manage" on public.%I for all to authenticated using (coalesce(((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'', false)) with check (coalesce(((select auth.jwt()) -> ''app_metadata'' ->> ''role'') = ''admin'', false))',
      table_name
    );
    execute format('drop policy if exists "seo service role manages" on public.%I', table_name);
    execute format(
      'create policy "seo service role manages" on public.%I for all to service_role using (true) with check (true)',
      table_name
    );
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'seo_keywords','seo_keyword_clusters','seo_pages','content_tasks','image_jobs'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_updated_at', table_name
    );
  end loop;
end $$;
