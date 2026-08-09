import fs from "node:fs/promises";
import { parseKeywordCsv, processKeywords } from "./keywords/pipeline.js";
import { generateContentBrief } from "./content/generate-content-brief.js";
import { generatePageDraft } from "./content/generate-page-draft.js";
import { reviewContent } from "./review/review-content.js";
import { scanRepository, writeReports } from "./scan.js";
import { generateInitialKeywordTasks } from "./run-initial-keywords.js";
import { requireSafeEnvironment } from "./lib/environment.js";

function value(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  requireSafeEnvironment();
  const command = process.argv[2] || "scan";
  if (command === "scan" || command === "links" || command === "seo") {
    const scan = await scanRepository();
    const files = await writeReports(scan);
    console.log(JSON.stringify({ ok: true, command, reports: files.length, pages: scan.pages.length, issues: scan.seoPriority.length }));
    return;
  }
  if (command === "keywords" || command === "clusters") {
    const input = value("--input");
    const scan = await scanRepository();
    const rows = input ? parseKeywordCsv(await fs.readFile(input, "utf8"), "csv") : [];
    console.log(JSON.stringify({ ok: true, records: processKeywords(rows, scan.pages) }, null, 2));
    return;
  }
  if (command === "briefs") {
    const result = await generateInitialKeywordTasks();
    console.log(JSON.stringify({ ok: true, command, tasks: result.tasks.length, mode: "draft_only", supabase: result.supabase }));
    return;
  }
  if (["content", "review", "images", "publish"].includes(command)) {
    throw new Error(`${command} requires an approved task-specific implementation; no action was taken.`);
  }
  if (command === "analytics") {
    console.log(JSON.stringify({ ok: true, command, message: "Import a GSC CSV or use the protected API route.", mode: "draft_only" }));
    return;
  }
  if (command === "demo") {
    const record = processKeywords([{ keyword: "custom padel bag manufacturer" }])[0];
    const brief = generateContentBrief(record);
    const draft = generatePageDraft(brief);
    console.log(JSON.stringify({ record, brief, draft, review: reviewContent(draft) }, null, 2));
    return;
  }
  throw new Error(`Unknown automation command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
