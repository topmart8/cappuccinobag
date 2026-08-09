export function calculatePagePerformance(row) {
  const impressions = Math.max(0, Number(row.impressions) || 0);
  const clicks = Math.max(0, Number(row.clicks) || 0);
  const ctr = impressions ? clicks / impressions : 0;
  const position = Math.max(0, Number(row.average_position) || 0);
  const previousClicks = Math.max(0, Number(row.previous_clicks) || clicks);
  const clickDecline = previousClicks ? Math.max(0, (previousClicks - clicks) / previousClicks) : 0;
  const ageDays = Math.max(0, Number(row.content_age_days) || 0);
  const content_decay_score = Math.min(100, Math.round(clickDecline * 55 + Math.min(ageDays / 365, 1) * 25 + (position > 20 ? 20 : 0)));
  const recommendations = [];
  if (impressions >= 100 && ctr < 0.02) recommendations.push("Test a clearer buyer-intent title and meta description.");
  if (clickDecline >= 0.2) recommendations.push("Refresh outdated sections and validate search intent.");
  if (position >= 8 && position <= 20) recommendations.push("Improve internal links and deepen buyer-specific coverage.");
  if (content_decay_score >= 50) recommendations.push("Create a human-reviewed content update task.");
  return { ...row, ctr, content_decay_score, recommendations, status: "manual_review" };
}

export function detectLowPerformers(rows = []) {
  return rows.map(calculatePagePerformance).filter((row) =>
    row.content_decay_score >= 40 || (row.impressions >= 100 && row.ctr < 0.02)
  );
}
