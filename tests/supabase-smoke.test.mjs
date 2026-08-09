import assert from "node:assert/strict";
import test from "node:test";
import { runSupabaseSmoke } from "../automation/smoke/supabase-smoke.js";

const safeEnvironment = {
  SUPABASE_URL: "https://ityfgdoswmmczsyhwhtc.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-only",
  AUTOMATION_MODE: "draft_only",
  CONTENT_AUTO_PUBLISH: "false",
  CONTENT_AUTO_MERGE: "false",
  INTERNAL_LINK_AUTO_INSERT: "false",
  IMAGE_AUTO_GENERATE: "false",
  IMAGE_AUTO_PUBLISH: "false",
  GITHUB_OWNER: "topmart8",
  GITHUB_REPO: "cappuccinobag",
  GITHUB_DEFAULT_BRANCH: "main",
};

function createRequest({ failReadback = false } = {}) {
  let marker = [];
  const calls = [];
  return {
    calls,
    request: async (path, options = {}) => {
      calls.push({ path, method: options.method || "GET" });
      if (path === "seo_keywords?select=id&limit=1") return [];
      if (options.method === "POST") {
        marker = options.body;
        return marker;
      }
      if (options.method === "DELETE") {
        marker = [];
        return [];
      }
      if (path.includes("source=eq.smoke_test")) return marker.map(({ site, status, source }, index) => ({ id: index + 1, site, status, source }));
      if (path.startsWith("seo_keywords?site=eq.cappuccinobag")) {
        if (failReadback && marker.length) throw new Error("simulated readback failure");
        return marker.map(({ site, status, source }) => ({ site, status, source }));
      }
      return [];
    },
  };
}

test("Supabase smoke touches one marker row and cleans it up", async () => {
  const mock = createRequest();
  const result = await runSupabaseSmoke({ env: safeEnvironment, request: mock.request });
  assert.equal(result.project_ref_matched, true);
  assert.equal(result.rest_get_succeeded, true);
  assert.equal(result.smoke_row_inserted, true);
  assert.equal(result.row_was_manual_review, true);
  assert.equal(result.cleanup_succeeded, true);
  assert.equal(result.remaining_smoke_rows, 0);
  assert.equal(result.other_tables_all_zero, true);
  assert.deepEqual([...new Set(mock.calls.filter((call) => call.method !== "GET").map((call) => call.path.split("?")[0]))], ["seo_keywords"]);
});

test("Supabase smoke cleanup runs after a readback assertion fails", async () => {
  const mock = createRequest({ failReadback: true });
  await assert.rejects(runSupabaseSmoke({ env: safeEnvironment, request: mock.request }), /simulated readback failure/);
  assert.ok(mock.calls.some((call) => call.method === "DELETE" && call.path.startsWith("seo_keywords?")));
  const finalSmokeRead = mock.calls.findLast((call) => call.path === "seo_keywords?source=eq.smoke_test&select=id");
  assert.ok(finalSmokeRead);
});

test("Supabase smoke stops before REST when the project ref is wrong", async () => {
  const mock = createRequest();
  await assert.rejects(
    runSupabaseSmoke({ env: { ...safeEnvironment, SUPABASE_URL: "https://novlane-seo.supabase.co" }, request: mock.request }),
    /project ref does not match/,
  );
  assert.equal(mock.calls.length, 0);
});
