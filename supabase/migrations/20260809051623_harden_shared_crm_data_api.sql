begin;

alter function public.set_updated_at()
  set search_path = public, pg_temp;
alter function public.assign_customer_number()
  set search_path = public, pg_temp;
alter function public.assign_inquiry_number()
  set search_path = public, pg_temp;

revoke all on table public.customers from anon;
revoke all on table public.inquiries from anon;
revoke all on table public.ai_reply_logs from anon;
revoke all on table public.activities from anon;
revoke all on table public.email_drafts from anon;

grant select, insert, update on table public.customers to service_role;
grant select, insert, update on table public.inquiries to service_role;
grant select, insert on table public.ai_reply_logs to service_role;
grant select, insert on table public.activities to service_role;
grant select, insert on table public.email_drafts to service_role;

revoke execute on function public.crm_is_admin() from public, anon;
revoke execute on function public.crm_can_access(text, text) from public, anon;
grant execute on function public.crm_is_admin() to authenticated, service_role;
grant execute on function public.crm_can_access(text, text) to authenticated, service_role;

commit;
