import { pathToFileURL } from "node:url";
import { assertSafeAutomationEnvironment } from "../config/cappuccinobag.config.js";
import { seoSupabaseRequest } from "../lib/supabase.js";

const EXPECTED_PROJECT_REF = "ityfgdoswmmczsyhwhtc";
const MARKER = Object.freeze({
  site: "cappuccinobag",
  keyword: "Cappuccino SEO Supabase smoke test",
  normalized_keyword: "cappuccino-seo-supabase-smoke-test-20260808",
  language: "en",
  country: "test",
  source: "smoke_test",
  status: "manual_review",
});
const READ_FILTER = "seo_keywords?site=eq.cappuccinobag&normalized_keyword=eq.cappuccino-seo-supabase-smoke-test-20260808&country=eq.test";
const DELETE_FILTER = `${READ_FILTER}&source=eq.smoke_test`;
const OTHER_TABLES = Object.freeze([
  "seo_keyword_clusters",
  "seo_pages",
  "content_tasks",
  "content_reviews",
  "internal_link_suggestions",
  "image_jobs",
  "publishing_runs",
  "analytics_page_performance",
]);

function assertServerEnvironment(env) {
  const safety = assertSafeAutomationEnvironment(env);
  if (!safety.ok) throw new Error(`Unsafe automation environment: ${safety.errors.join(" ")}`);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Server-side Supabase credentials are not configured.");
  }
  const url = new URL(env.SUPABASE_URL);
  const projectRef = url.hostname.split(".")[0];
  if (projectRef !== EXPECTED_PROJECT_REF) {
    throw new Error("Supabase project ref does not match the approved smoke-test project.");
  }
  return projectRef;
}

export async function runSupabaseSmoke({ env = process.env, request = seoSupabaseRequest } = {}) {
  const projectRef = assertServerEnvironment(env);
  const result = {
    project_ref_matched: projectRef === EXPECTED_PROJECT_REF,
    rest_get_succeeded: false,
    smoke_row_inserted: false,
    row_was_manual_review: false,
    cleanup_succeeded: false,
    remaining_smoke_rows: null,
    other_tables_all_zero: false,
  };
  let restAvailable = false;
  let failure;

  try {
    const preflight = await request("seo_keywords?select=id&limit=1");
    if (!Array.isArray(preflight)) throw new Error("Supabase REST preflight did not return an array.");
    restAvailable = true;
    result.rest_get_succeeded = true;

    const before = await request(`${READ_FILTER}&select=id`);
    if (!Array.isArray(before) || before.length !== 0) {
      throw new Error("The deterministic smoke-test marker already exists.");
    }

    const inserted = await request("seo_keywords", {
      method: "POST",
      body: [MARKER],
      prefer: "return=representation",
    });
    result.smoke_row_inserted = Array.isArray(inserted) && inserted.length === 1;
    if (!result.smoke_row_inserted) throw new Error("Expected exactly one inserted smoke row.");

    const rows = await request(`${READ_FILTER}&select=site,status,source`);
    if (!Array.isArray(rows) || rows.length !== 1) throw new Error("Expected exactly one smoke row after insert.");
    result.row_was_manual_review = rows[0].status === "manual_review"
      && rows[0].site === "cappuccinobag"
      && rows[0].source === "smoke_test";
    if (!result.row_was_manual_review) throw new Error("Smoke row failed the manual-review safety assertion.");
  } catch (error) {
    failure = error;
  } finally {
    if (restAvailable) {
      try {
        await request(DELETE_FILTER, { method: "DELETE", prefer: "return=representation" });
        const remaining = await request("seo_keywords?source=eq.smoke_test&select=id");
        if (!Array.isArray(remaining)) throw new Error("Smoke cleanup verification did not return an array.");
        result.remaining_smoke_rows = remaining.length;
        result.cleanup_succeeded = remaining.length === 0;

        const otherCounts = await Promise.all(OTHER_TABLES.map(async (table) => {
          const rows = await request(`${table}?select=id&limit=1`);
          if (!Array.isArray(rows)) throw new Error(`${table} REST check did not return an array.`);
          return rows.length;
        }));
        result.other_tables_all_zero = otherCounts.every((count) => count === 0);
      } catch (cleanupError) {
        failure = failure
          ? new AggregateError([failure, cleanupError], "Smoke test and cleanup verification failed.")
          : cleanupError;
      }
    }
  }

  if (!result.cleanup_succeeded && restAvailable && !failure) {
    failure = new Error("Smoke row cleanup did not succeed.");
  }
  if (!result.other_tables_all_zero && restAvailable && !failure) {
    failure = new Error("One or more unrelated SEO tables are not empty.");
  }
  if (failure) {
    failure.smokeResult = result;
    throw failure;
  }
  return result;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  runSupabaseSmoke()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      if (error.smokeResult) console.error(JSON.stringify(error.smokeResult, null, 2));
      console.error(error.message);
      process.exitCode = 1;
    });
}
