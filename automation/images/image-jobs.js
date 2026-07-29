import path from "node:path";
import { slugify } from "../lib/slug.js";

const imageTypes = new Set([
  "hero", "white_background", "front", "back", "side", "top", "bottom",
  "interior", "pocket_detail", "zipper_detail", "hardware_detail", "strap_detail",
  "material_detail", "logo_detail", "lining_detail", "dimension", "capacity",
  "lifestyle", "packaging", "customization", "color_options", "social_media",
]);
const aspectRatios = new Set(["1:1", "4:5", "16:9", "9:16"]);

export function imageFilename(keyword, type) {
  const safeType = imageTypes.has(type) ? type.replaceAll("_", "-") : "product";
  return `${slugify(keyword)}-${safeType}.webp`;
}

export function generateAltText(keyword, type) {
  const view = type.replaceAll("_", " ");
  return `${keyword} ${view} for OEM and private-label product development`.replace(/\s+/g, " ").trim().slice(0, 150);
}

export function createImageJob({ taskId, sku, keyword, category, type, ratio = "1:1", referenceImage = null }) {
  const imageType = imageTypes.has(type) ? type : "hero";
  const aspectRatio = aspectRatios.has(ratio) ? ratio : "1:1";
  const concept = ["lifestyle", "hero", "social_media"].includes(imageType);
  return {
    site: "cappuccinobag", content_task_id: taskId || null, sku: sku || null,
    product_category: category, image_type: imageType, source_image: referenceImage,
    structure_requirements: "Preserve the approved bag shape, pocket count, zipper positions, straps, hardware and logo placement.",
    material_requirements: "Match only the approved material direction and reference photography.",
    color_requirements: "Use approved colour references; do not invent branded colourways.",
    logo_requirements: "No third-party brand logos or certification marks.",
    scene: concept ? "Buyer-relevant commercial context with accurate scale and product construction." : "Neutral product-documentation view.",
    prompt: `${concept ? "Concept visualization" : "Product documentation"} of ${keyword}, ${imageType.replaceAll("_", " ")} view. Preserve approved construction and materials. Clean B2B manufacturer presentation.`,
    negative_prompt: "extra pockets, extra zippers, altered straps, moved hardware, third-party logos, certification marks, misleading construction, text artifacts",
    aspect_ratio: aspectRatio,
    output_filename: imageFilename(keyword, imageType),
    output_path: path.posix.join("/images/seo-drafts", imageFilename(keyword, imageType)),
    alt_text: generateAltText(keyword, imageType),
    page_position: imageType,
    disclosure: concept ? "Concept visualization — final construction subject to sampling." : null,
    status: "manual_review", approved_at: null,
  };
}

export function validateImageJobs(jobs = []) {
  const filenames = new Set();
  const issues = [];
  for (const job of jobs) {
    if (filenames.has(job.output_filename)) issues.push({ issue: "duplicate_filename", filename: job.output_filename });
    filenames.add(job.output_filename);
    if (!job.output_filename?.endsWith(".webp")) issues.push({ issue: "invalid_format", filename: job.output_filename });
    if (!job.alt_text || job.alt_text.length > 150) issues.push({ issue: "invalid_alt", filename: job.output_filename });
    if (!aspectRatios.has(job.aspect_ratio)) issues.push({ issue: "invalid_aspect_ratio", filename: job.output_filename });
  }
  return { ok: issues.length === 0, issues };
}
