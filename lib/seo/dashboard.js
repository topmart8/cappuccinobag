import fs from "node:fs/promises";
import path from "node:path";
import { seoSupabaseRequest } from "../../automation/lib/supabase.js";

const reportRoot = path.join(process.cwd(), "reports");
const fixtureRoot = path.join(process.cwd(), "automation", "fixtures");

async function readJson(directory, filename, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(path.join(directory, filename), "utf8"));
  } catch {
    return fallback;
  }
}

async function table(tableName, order = "created_at.desc", limit = 100) {
  try {
    const result = await seoSupabaseRequest(
      `${tableName}?site=eq.cappuccinobag&select=*&order=${order}&limit=${limit}`,
    );
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export async function loadSeoDashboard() {
  const [keywords, content, links, images, publishing, analytics, priority, orphans, broken] = await Promise.all([
    table("seo_keywords", "opportunity_score.desc"),
    table("content_tasks"),
    table("internal_link_suggestions", "relevance_score.desc"),
    table("image_jobs"),
    table("publishing_runs"),
    table("analytics_page_performance", "date.desc"),
    readJson(reportRoot, "cappuccinobag-seo-priority-report.json", { items: [] }),
    readJson(reportRoot, "cappuccinobag-orphan-pages.json", { items: [] }),
    readJson(reportRoot, "cappuccinobag-broken-links.json", { items: [] }),
  ]);
  let fixture = { tasks: [] };
  if (!keywords.length || !content.length) {
    fixture = await readJson(fixtureRoot, "initial-keyword-tasks.json", fixture);
  }
  const fallbackKeywords = fixture.tasks.map((task) => task.keyword);
  const fallbackContent = fixture.tasks.map((task) => ({
    id: task.brief.task_id, title: task.brief.recommended_title,
    primary_keyword: task.keyword.normalized_keyword,
    target_url: task.brief.recommended_url, target_page_type: task.brief.target_page_type,
    review_status: task.status, review_score: task.review.finalScore,
    content_brief: task.brief, generated_content: task.draft,
  }));
  return {
    keywords: keywords.length ? keywords : fallbackKeywords,
    content: content.length ? content : fallbackContent,
    links: links.length ? links : fixture.tasks.flatMap((task) => task.internal_links),
    images: images.length ? images : fixture.tasks.flatMap((task) => task.image_jobs),
    publishing, analytics,
    reports: { priority: priority.items || [], orphans: orphans.items || [], broken: broken.items || [] },
    configured: keywords.length + content.length + links.length + images.length > 0,
  };
}
