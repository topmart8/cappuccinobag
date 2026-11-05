import test from "node:test";
import assert from "node:assert/strict";
import { checkPreviewCrm, EXPECTED_PROJECT, PREVIEW_BRANCH } from "../scripts/pr50-preview-crm-check.mjs";

const token = (claims) => [
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
  Buffer.from(JSON.stringify(claims)).toString("base64url"),
  "local_test_signature",
].join(".");
const validKey = token({ role: "service_role", ref: EXPECTED_PROJECT });
const config = (overrides = {}) => ({
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: PREVIEW_BRANCH,
  SUPABASE_URL: "https://" + EXPECTED_PROJECT + ".supabase.co",
  INQUIRY_TO_EMAIL: "info@cappuccinobag.net",
  SUPABASE_SERVICE_ROLE_KEY: validKey,
  ...overrides,
});
const forbidden = async () => { assert.fail("Unexpected network request"); };

test("production, local and unrelated branches never call the database", async () => {
  for (const overrides of [
    { VERCEL_ENV: "production" }, { VERCEL_ENV: "development" },
    { VERCEL_ENV: undefined }, { VERCEL_GIT_COMMIT_REF: "main" },
    { VERCEL_GIT_COMMIT_REF: undefined },
  ]) assert.equal((await checkPreviewCrm(config(overrides), forbidden)).status, "skipped");
});

test("wrong destinations are rejected before any credential is transmitted", async () => {
  for (const url of [
    "https://example.invalid", "http://" + EXPECTED_PROJECT + ".supabase.co",
    "https://" + EXPECTED_PROJECT + ".supabase.co.evil.invalid",
    "https://user:password@" + EXPECTED_PROJECT + ".supabase.co",
    "https://" + EXPECTED_PROJECT + ".supabase.co/path",
    "https://" + EXPECTED_PROJECT + ".supabase.co?target=other",
    "https://" + EXPECTED_PROJECT + ".supabase.co#other",
    undefined,
  ]) {
    let calls = 0;
    const result = await checkPreviewCrm(config({ SUPABASE_URL: url }), async () => { calls += 1; return { status: 200 }; });
    assert.equal(result.status, "failed");
    assert.equal(calls, 0);
  }
});

test("recipient mismatch stops the check", async () => {
  assert.equal((await checkPreviewCrm(config({ INQUIRY_TO_EMAIL: "other@example.invalid" }), forbidden)).code, "recipient_mismatch");
});

test("missing and malformed credentials cannot reach the database", async () => {
  for (const key of [undefined, "", " ", "garbage", "sb_publishable_test", validKey + "\n"]) {
    let calls = 0;
    const result = await checkPreviewCrm(config({ SUPABASE_SERVICE_ROLE_KEY: key }), async () => { calls += 1; return { status: 200 }; });
    assert.equal(result.status, "failed");
    assert.equal(calls, 0);
  }
});

test("legacy anonymous and wrong-project credentials are rejected locally", async () => {
  for (const claims of [
    { role: "anon", ref: EXPECTED_PROJECT }, { role: "service_role", ref: "otherproject" },
  ]) {
    let calls = 0;
    const result = await checkPreviewCrm(config({ SUPABASE_SERVICE_ROLE_KEY: token(claims) }), async () => { calls += 1; return { status: 200 }; });
    assert.equal(result.status, "failed");
    assert.equal(calls, 0);
  }
});

test("success requires one HEAD request with zero rows and no body or header reads", async () => {
  let calls = 0;
  const result = await checkPreviewCrm(config(), async (url, options) => {
    calls += 1;
    assert.equal(url, "https://" + EXPECTED_PROJECT + ".supabase.co/rest/v1/inquiries?select=id&limit=0");
    assert.equal(options.method, "HEAD");
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.Authorization, "Bearer " + validKey);
    assert.equal(options.headers.apikey, validKey);
    assert.equal(options.headers["Accept-Profile"], "public");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.body, undefined);
    return { status: 200, text: forbidden, json: forbidden,
      get headers() { assert.fail("Response headers must not be read"); } };
  });
  assert.equal(calls, 1);
  assert.equal(result.status, "passed");
  assert.equal(result.rowsRequested, 0);
  assert.ok(!JSON.stringify(result).includes(validKey));
});

test("secret-format keys use the same headers as the current application", async () => {
  const key = "sb_secret_local_fixture";
  const result = await checkPreviewCrm(config({ SUPABASE_SERVICE_ROLE_KEY: key }), async (_url, options) => {
    assert.equal(options.headers.apikey, key);
    assert.equal(options.headers.Authorization, "Bearer " + key);
    return { status: 401 };
  });
  assert.equal(result.code, "credential_rejected");
});

test("credential, permission, endpoint and redirect failures never retry or leak responses", async () => {
  const statuses = [[301, "redirect_refused"], [307, "redirect_refused"], [401, "credential_rejected"],
    [403, "data_api_access_denied"], [404, "inquiries_endpoint_not_found"], [500, "data_api_unexpected_status"]];
  for (const [status, code] of statuses) {
    let calls = 0;
    const result = await checkPreviewCrm(config(), async () => {
      calls += 1;
      return { status, text: forbidden, json: forbidden };
    });
    assert.equal(calls, 1);
    assert.equal(result.code, code);
    assert.equal(result.httpStatus, status);
  }
});

test("raw network errors including secrets are never included in the result", async () => {
  const result = await checkPreviewCrm(config(), async () => { throw new Error(validKey); });
  assert.equal(result.code, "data_api_network_or_timeout");
  assert.ok(!JSON.stringify(result).includes(validKey));
});
