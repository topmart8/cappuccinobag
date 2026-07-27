# Unified CRM migration rollback

The migration is additive and does not alter or delete the existing Novlane
`novlane_project_inquiries` table.

Preferred rollback:

1. Disable all four auto-reply environment switches.
2. Redeploy the previous application commit.
3. Keep the new CRM tables in place so inquiry history remains available.

Only after exporting and verifying the new CRM data, a Supabase administrator
may remove the new triggers, functions, policies and tables in reverse
dependency order. Do not drop the tables as part of an application rollback.

