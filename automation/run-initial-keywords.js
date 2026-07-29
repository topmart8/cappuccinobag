import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processKeywords, toSeoKeywordRow } from "./keywords/pipeline.js";
import { generateContentBrief } from "./content/generate-content-brief.js";
import { generatePageDraft } from "./content/generate-page-draft.js";
import { reviewContent } from "./review/review-content.js";
import { createImageJob } from "./images/image-jobs.js";
import { recommendInternalLinks } from "./internal-links/audit.js";
import { saveSeoRows } from "./lib/supabase.js";
import { scanRepository } from "./scan.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keywords = [
  "custom padel bag manufacturer",
  "private label pickleball bag",
  "custom tennis bag manufacturer",
  "custom running waist pack manufacturer",
  "custom hiking backpack manufacturer",
  "custom travel bag manufacturer",
  "RFID wallet manufacturer China",
  "recycled outdoor bag manufacturer",
  "OEM racket sports bag factory",
  "custom passport holder manufacturer",
];

export async function generateInitialKeywordTasks({ persist = true } = {}) {
  const scan = await scanRepository();
  const records = processKeywords(keywords.map((keyword) => ({ keyword, source: "initial_test" })), scan.pages);
  const tasks = records.map((record) => {
    const brief = generateContentBrief(record, { existingPages: scan.pages });
    const draft = generatePageDraft(brief);
    const review = reviewContent(draft, scan.pages);
    const internalLinks = recommendInternalLinks({
      url: brief.recommended_url, title: brief.recommended_title, h1: brief.recommended_h1,
      primary_keyword: record.normalized_keyword, category: record.target_category,
    }, scan.pages);
    const imageJobs = brief.image_tasks.map((type) => createImageJob({
      taskId: brief.task_id, keyword: record.normalized_keyword,
      category: record.target_category, type, ratio: type === "hero" ? "16:9" : "1:1",
    }));
    return {
      keyword: record, brief, draft, review, internal_links: internalLinks,
      image_jobs: imageJobs, status: "manual_review", publishing_record: null,
    };
  });
  if (persist) {
    const outputDir = path.join(root, "automation", "fixtures");
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, "initial-keyword-tasks.json"), `${JSON.stringify({
      site: "cappuccinobag", mode: "draft_only", generated_at: new Date().toISOString(), tasks,
    }, null, 2)}\n`);
  }
  const keywordSave = await saveSeoRows("seo_keywords", records.map(toSeoKeywordRow));
  if (!keywordSave?.skipped) {
    await saveSeoRows("content_tasks", tasks.map((task) => ({
      site: "cappuccinobag", task_type: "initial_test", title: task.brief.recommended_title,
      primary_keyword: task.keyword.normalized_keyword, target_url: task.brief.recommended_url,
      target_page_type: task.brief.target_page_type, content_brief: task.brief,
      generated_content: task.draft, review_status: "manual_review",
      review_score: task.review.finalScore,
    })));
  }
  return { tasks, supabase: keywordSave?.skipped ? keywordSave : { skipped: false } };
}
