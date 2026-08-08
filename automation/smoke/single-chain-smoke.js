import { pathToFileURL } from "node:url";
import { assertSafeAutomationEnvironment } from "../config/cappuccinobag.config.js";
import { generateContentBrief } from "../content/generate-content-brief.js";
import { processKeyword, toSeoKeywordRow } from "../keywords/pipeline.js";
import { seoSupabaseRequest } from "../lib/supabase.js";

const EXPECTED_PROJECT_REF = "ityfgdoswmmczsyhwhtc";
const KEYWORD = "custom padel bag manufacturer";
const CLUSTER_NAME = "smoke-custom-padel-bag-manufacturer-20260808";
const TASK_TYPE = "single_chain_smoke";
const KEYWORD_FILTER = "seo_keywords?source=eq.single_chain_smoke&country=eq.test&normalized_keyword=eq.custom%20padel%20bag%20manufacturer";
const CLUSTER_FILTER = `seo_keyword_clusters?cluster_name=eq.${CLUSTER_NAME}`;
const TASK_FILTER = `content_tasks?task_type=eq.${TASK_TYPE}`;
const SEO_TABLES = Object.freeze([
  "seo_keywords",
  "seo_keyword_clusters",
  "seo_pages",
  "content_tasks",
  "content_reviews",
  "internal_link_suggestions",
  "image_jobs",
  "publishing_runs",
  "analytics_page_performance",
]);
const DOWNSTREAM_TABLES = Object.freeze([
  "seo_pages",
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
  const projectRef = new URL(env.SUPABASE_URL).hostname.split(".")[0];
  if (projectRef !== EXPECTED_PROJECT_REF) {
    throw new Error("Supabase project ref does not match the approved single-chain smoke-test project.");
  }
  return projectRef;
}

async function requireEmptyRows(request, path, label) {
  const rows = await request(`${path}&select=id`);
  if (!Array.isArray(rows) || rows.length !== 0) {
    throw new Error(`${label} marker already exists.`);
  }
}

async function tablesAreEmpty(request, tables) {
  const counts = await Promise.all(tables.map(async (table) => {
    const rows = await request(`${table}?select=id&limit=1`);
    if (!Array.isArray(rows)) throw new Error(`${table} REST check did not return an array.`);
    return rows.length;
  }));
  return counts.every((count) => count === 0);
}

export async function runSingleChainSmoke({
  env = process.env,
  request = seoSupabaseRequest,
  existingPages = [],
} = {}) {
  const projectRef = assertServerEnvironment(env);
  const result = {
    project_ref_matched: projectRef === EXPECTED_PROJECT_REF,
    rest_preflight_passed: false,
    keyword_inserted: false,
    keyword_manual_review: false,
    cluster_inserted: false,
    cluster_manual_review: false,
    brief_generated: false,
    content_task_inserted: false,
    content_task_manual_review: false,
    generated_content_empty: false,
    downstream_six_tables_stayed_zero: false,
    cleanup_succeeded: false,
    all_nine_tables_returned_to_zero: false,
  };
  let cleanupRequired = false;
  let failure;

  try {
    for (const table of ["seo_keywords", "seo_keyword_clusters", "content_tasks"]) {
      const rows = await request(`${table}?select=id&limit=1`);
      if (!Array.isArray(rows)) throw new Error(`${table} REST preflight did not return an array.`);
    }
    result.rest_preflight_passed = true;

    await requireEmptyRows(request, KEYWORD_FILTER, "Keyword smoke");
    await requireEmptyRows(request, CLUSTER_FILTER, "Cluster smoke");
    await requireEmptyRows(request, TASK_FILTER, "Content-task smoke");
    cleanupRequired = true;

    const keywordRecord = {
      ...processKeyword({ keyword: KEYWORD }, existingPages),
      country: "test",
      source: "single_chain_smoke",
      status: "manual_review",
    };
    if (keywordRecord.normalized_keyword !== KEYWORD) {
      throw new Error("Keyword normalization did not match the approved marker.");
    }
    const keywordRows = await request("seo_keywords", {
      method: "POST",
      body: [toSeoKeywordRow(keywordRecord)],
      prefer: "return=representation",
    });
    result.keyword_inserted = Array.isArray(keywordRows) && keywordRows.length === 1;
    result.keyword_manual_review = result.keyword_inserted
      && keywordRows[0].site === "cappuccinobag"
      && keywordRows[0].country === "test"
      && keywordRows[0].source === "single_chain_smoke"
      && keywordRows[0].status === "manual_review";
    if (!result.keyword_manual_review) throw new Error("Keyword insert failed its manual-review assertions.");

    const clusterRows = await request("seo_keyword_clusters", {
      method: "POST",
      body: [{
        site: "cappuccinobag",
        cluster_name: CLUSTER_NAME,
        primary_keyword: KEYWORD,
        supporting_keywords: [],
        search_intent: keywordRecord.search_intent,
        recommended_page_type: keywordRecord.target_page_type,
        assigned_url: keywordRecord.target_url,
        status: "manual_review",
      }],
      prefer: "return=representation",
    });
    result.cluster_inserted = Array.isArray(clusterRows) && clusterRows.length === 1 && Boolean(clusterRows[0].id);
    result.cluster_manual_review = result.cluster_inserted && clusterRows[0].status === "manual_review";
    if (!result.cluster_manual_review) throw new Error("Cluster insert failed its manual-review assertions.");

    const brief = generateContentBrief(keywordRecord, { existingPages });
    result.brief_generated = brief.status === "manual_review"
      && brief.site === "cappuccinobag"
      && brief.primary_keyword === KEYWORD;
    if (!result.brief_generated) throw new Error("Generated brief failed its manual-review assertions.");

    const taskRows = await request("content_tasks", {
      method: "POST",
      body: [{
        site: "cappuccinobag",
        task_type: TASK_TYPE,
        title: brief.recommended_title,
        primary_keyword: KEYWORD,
        keyword_cluster_id: clusterRows[0].id,
        target_url: brief.recommended_url,
        target_page_type: brief.target_page_type,
        content_brief: brief,
        generated_content: {},
        review_status: "manual_review",
        review_score: null,
        published_at: null,
        branch_name: null,
        pull_request_url: null,
        preview_url: null,
      }],
      prefer: "return=representation",
    });
    result.content_task_inserted = Array.isArray(taskRows) && taskRows.length === 1;
    const task = result.content_task_inserted ? taskRows[0] : null;
    result.content_task_manual_review = Boolean(task)
      && task.review_status === "manual_review"
      && task.published_at === null
      && task.pull_request_url === null
      && task.preview_url === null
      && task.keyword_cluster_id === clusterRows[0].id;
    result.generated_content_empty = Boolean(task)
      && task.generated_content !== null
      && typeof task.generated_content === "object"
      && !Array.isArray(task.generated_content)
      && Object.keys(task.generated_content).length === 0;
    if (!result.content_task_manual_review || !result.generated_content_empty) {
      throw new Error("Content task failed its manual-review safety assertions.");
    }

    result.downstream_six_tables_stayed_zero = await tablesAreEmpty(request, DOWNSTREAM_TABLES);
    if (!result.downstream_six_tables_stayed_zero) {
      throw new Error("One or more downstream SEO tables are not empty.");
    }
  } catch (error) {
    failure = error;
  } finally {
    if (cleanupRequired) {
      try {
        await request(TASK_FILTER, { method: "DELETE", prefer: "return=representation" });
        await request(CLUSTER_FILTER, { method: "DELETE", prefer: "return=representation" });
        await request(KEYWORD_FILTER, { method: "DELETE", prefer: "return=representation" });

        const markerChecks = await Promise.all([
          request(`${KEYWORD_FILTER}&select=id`),
          request(`${CLUSTER_FILTER}&select=id`),
          request(`${TASK_FILTER}&select=id`),
        ]);
        result.cleanup_succeeded = markerChecks.every((rows) => Array.isArray(rows) && rows.length === 0);
        result.all_nine_tables_returned_to_zero = await tablesAreEmpty(request, SEO_TABLES);
        if (!result.cleanup_succeeded || !result.all_nine_tables_returned_to_zero) {
          throw new Error("Single-chain cleanup verification failed.");
        }
      } catch (cleanupError) {
        failure = failure
          ? new AggregateError([failure, cleanupError], "Single-chain smoke test and cleanup failed.")
          : cleanupError;
      }
    }
  }

  if (failure) {
    failure.smokeResult = result;
    throw failure;
  }
  return result;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  runSingleChainSmoke()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      if (error.smokeResult) console.error(JSON.stringify(error.smokeResult, null, 2));
      console.error(error.message);
      process.exitCode = 1;
    });
}
