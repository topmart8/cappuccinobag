import { pathToFileURL } from "node:url";

export const EXPECTED_PROJECT = "ityfgdoswmmczsyhwhtc";
export const PREVIEW_BRANCH = "codex/b2b-growth-review-20261027";
const EXPECTED_ORIGIN = "https://" + EXPECTED_PROJECT + ".supabase.co";
const EXPECTED_EMAIL = "info@cappuccinobag.net";

// Protected build-time check; never an HTTP handler. No customer/inquiry rows,
// key output, raw errors, response body/header reads or credentialed redirects.
export async function checkPreviewCrm(env = process.env, request = fetch) {
  if (env.VERCEL_ENV !== "preview" || env.VERCEL_GIT_COMMIT_REF !== PREVIEW_BRANCH) {
    return { status: "skipped", code: "outside_pr50_preview" };
  }
  const result = { check: "pr50-preview-crm-readonly", projectRef: EXPECTED_PROJECT };
  const fail = (code, httpStatus) => ({
    ...result, status: "failed", code,
    ...(Number.isInteger(httpStatus) ? { httpStatus } : {}),
  });
  try {
    const url = new URL(env.SUPABASE_URL || "");
    if (url.origin !== EXPECTED_ORIGIN || url.pathname !== "/" ||
        url.username || url.password || url.search || url.hash) {
      return fail("crm_target_mismatch");
    }
  } catch {
    return fail("crm_target_missing_or_invalid");
  }
  if (env.INQUIRY_TO_EMAIL !== EXPECTED_EMAIL) return fail("recipient_mismatch");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof key !== "string" || !key || key.trim() !== key) return fail("credential_missing_or_invalid");

  let keyKind = "secret";
  if (!key.startsWith("sb_secret_")) {
    keyKind = "legacy_service_role";
    try {
      const parts = key.split(".");
      if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
        return fail("credential_format_unsupported");
      }
      const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (claims?.role !== "service_role") return fail("credential_role_mismatch");
      if (claims?.ref !== EXPECTED_PROJECT) return fail("credential_project_claim_mismatch");
    } catch {
      return fail("credential_format_unsupported");
    }
  }

  let response;
  try {
    response = await request(EXPECTED_ORIGIN + "/rest/v1/inquiries?select=id&limit=0", {
      method: "HEAD",
      headers: {
        // Mirror the application's current lib/crm/supabase.js authentication.
        // Using different headers would not validate its current setup.
        Authorization: "Bearer " + key,
        apikey: key,
        "Content-Type": "application/json",
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return fail("data_api_network_or_timeout");
  }
  const status = response.status;
  if (status >= 300 && status < 400) return fail("redirect_refused", status);
  if (status === 401) return fail("credential_rejected", status);
  if (status === 403) return fail("data_api_access_denied", status);
  if (status === 404) return fail("inquiries_endpoint_not_found", status);
  if (![200, 206].includes(status)) return fail("data_api_unexpected_status", status);
  return {
    ...result, status: "passed", keyKind, httpStatus: status,
    recipientMatches: true, method: "HEAD", rowsRequested: 0,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await checkPreviewCrm();
    console.log("PR50_CRM_READONLY_CHECK " + JSON.stringify(result));
    if (result.status === "failed") process.exitCode = 1;
  } catch {
    console.error('PR50_CRM_READONLY_CHECK {"status":"failed","code":"unexpected_check_error"}');
    process.exitCode = 1;
  }
}
