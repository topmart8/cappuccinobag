begin;

alter table public.inquiries
  drop constraint if exists inquiries_site_source_alignment_check;

alter table public.inquiries
  add constraint inquiries_site_source_alignment_check
  check (
    site_source is null
    or (
      site_source = 'cappuccino'
      and site = 'cappuccinobag'
      and brand = 'Cappuccino Bag'
    )
    or (
      site_source = 'novlane'
      and site = 'novlane'
      and brand = 'Novlane'
    )
  ) not valid;

alter table public.inquiries
  validate constraint inquiries_site_source_alignment_check;

commit;
