begin;

create index if not exists customers_duplicate_of_idx
  on public.customers (duplicate_of)
  where duplicate_of is not null;

create index if not exists inquiries_suppression_id_idx
  on public.inquiries (suppression_id)
  where suppression_id is not null;

commit;
