import assert from "node:assert/strict";
import test from "node:test";
import { runSingleChainSmoke } from "../automation/smoke/single-chain-smoke.js";

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

function createRequest({ failPreflightTable, failAfterCluster = false } = {}) {
  const rows = new Map([
    ["seo_keywords", []],
    ["seo_keyword_clusters", []],
    ["content_tasks", []],
  ]);
  const calls = [];
  let nextId = 1;

  return {
    calls,
    rows,
    request: async (path, options = {}) => {
      const method = options.method || "GET";
      const table = path.split("?")[0];
      calls.push({ path, method, body: options.body });
      if (method === "GET" && path === `${failPreflightTable}?select=id&limit=1`) {
        throw new Error("simulated preflight failure");
      }
      if (method === "POST") {
        const inserted = options.body.map((row) => ({ id: `id-${nextId++}`, ...row }));
        rows.set(table, inserted);
        if (table === "content_tasks" && failAfterCluster) throw new Error("simulated mid-chain failure");
        return inserted;
      }
      if (method === "DELETE") {
        rows.set(table, []);
        return [];
      }
      return rows.get(table) || [];
    },
  };
}

test("single-chain smoke creates manual-review records and cleans all markers", async () => {
  const mock = createRequest();
  const result = await runSingleChainSmoke({ env: safeEnvironment, request: mock.request });
  assert.equal(result.project_ref_matched, true);
  assert.equal(result.rest_preflight_passed, true);
  assert.equal(result.keyword_manual_review, true);
  assert.equal(result.cluster_manual_review, true);
  assert.equal(result.brief_generated, true);
  assert.equal(result.content_task_manual_review, true);
  assert.equal(result.generated_content_empty, true);
  assert.equal(result.downstream_six_tables_stayed_zero, true);
  assert.equal(result.cleanup_succeeded, true);
  assert.equal(result.all_nine_tables_returned_to_zero, true);

  const writes = mock.calls.filter((call) => call.method === "POST");
  assert.deepEqual(writes.map((call) => call.path), ["seo_keywords", "seo_keyword_clusters", "content_tasks"]);
  assert.equal(writes[0].body[0].status, "manual_review");
  assert.equal(writes[1].body[0].status, "manual_review");
  assert.equal(writes[2].body[0].review_status, "manual_review");
  assert.deepEqual(writes[2].body[0].generated_content, {});
  assert.equal(writes[2].body[0].published_at, null);
  assert.equal(writes[2].body[0].pull_request_url, null);
  assert.equal(writes[2].body[0].preview_url, null);

  const deletes = mock.calls.filter((call) => call.method === "DELETE");
  assert.deepEqual(deletes.map((call) => call.path.split("?")[0]), [
    "content_tasks",
    "seo_keyword_clusters",
    "seo_keywords",
  ]);
});

test("single-chain smoke stops before REST when the project ref is wrong", async () => {
  const mock = createRequest();
  await assert.rejects(
    runSingleChainSmoke({
      env: { ...safeEnvironment, SUPABASE_URL: "https://novlane-seo.supabase.co" },
      request: mock.request,
    }),
    /project ref does not match/,
  );
  assert.equal(mock.calls.length, 0);
});

test("single-chain smoke stops before writes when a REST preflight fails", async () => {
  const mock = createRequest({ failPreflightTable: "seo_keyword_clusters" });
  await assert.rejects(
    runSingleChainSmoke({ env: safeEnvironment, request: mock.request }),
    /simulated preflight failure/,
  );
  assert.equal(mock.calls.some((call) => call.method !== "GET"), false);
});

test("single-chain smoke cleans task, cluster, and keyword after a mid-chain failure", async () => {
  const mock = createRequest({ failAfterCluster: true });
  await assert.rejects(
    runSingleChainSmoke({ env: safeEnvironment, request: mock.request }),
    /simulated mid-chain failure/,
  );
  assert.deepEqual(mock.calls.filter((call) => call.method === "DELETE").map((call) => call.path.split("?")[0]), [
    "content_tasks",
    "seo_keyword_clusters",
    "seo_keywords",
  ]);
  assert.equal([...mock.rows.values()].every((tableRows) => tableRows.length === 0), true);
});

test("single-chain smoke never writes downstream tables", async () => {
  const mock = createRequest();
  await runSingleChainSmoke({ env: safeEnvironment, request: mock.request });
  const writtenTables = new Set(mock.calls.filter((call) => call.method !== "GET").map((call) => call.path.split("?")[0]));
  for (const table of [
    "seo_pages",
    "content_reviews",
    "internal_link_suggestions",
    "image_jobs",
    "publishing_runs",
    "analytics_page_performance",
  ]) {
    assert.equal(writtenTables.has(table), false);
  }
});
