export const PAGE_STATUSES = Object.freeze([
  "idea", "keyword_approved", "brief_ready", "content_draft", "content_review",
  "image_pending", "manual_review", "approved", "scheduled", "published",
  "needs_update", "archived",
]);

export function canGeneratePage(status) {
  return status === "approved";
}

export function canPublishPage(status, environment = process.env) {
  return status === "approved"
    && (environment.AUTOMATION_MODE || "draft_only") !== "draft_only"
    && String(environment.CONTENT_AUTO_PUBLISH || "false").toLowerCase() === "true";
}

export function assertDraftOnlyRecord(record) {
  if (record?.status === "published" || record?.published_at || record?.production_url) {
    throw new Error("draft_only records cannot be published.");
  }
  return { ...record, status: "manual_review", published_at: null, production_url: null };
}
