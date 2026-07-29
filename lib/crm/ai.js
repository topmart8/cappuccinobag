import { getBrand, requiresHumanReview } from "./brand.js";
import { scoreLead } from "./scoring.js";

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "site", "brand", "language", "intent", "product_category", "lead_score",
    "risk_level", "missing_information", "customer_summary",
    "recommended_action", "reply_body", "human_review_required",
  ],
  properties: {
    site: { type: "string", enum: ["cappuccinobag", "novlane"] },
    brand: { type: "string", enum: ["Cappuccino Bag", "Novlane"] },
    language: { type: "string" },
    intent: { type: "string" },
    product_category: { type: "string" },
    lead_score: { type: "integer", minimum: 0, maximum: 100 },
    risk_level: { type: "string", enum: ["low", "medium", "high"] },
    missing_information: { type: "array", items: { type: "string" } },
    customer_summary: { type: "string" },
    recommended_action: { type: "string" },
    reply_body: { type: "string" },
    human_review_required: { type: "boolean" },
  },
};

function fallback(input) {
  const brand = getBrand(input.site);
  const missing = [
    !input.quantity && "quantity",
    !input.material && "material",
    !input.logo_method && "logo method",
    !input.target_delivery_date && "target delivery date",
  ].filter(Boolean).slice(0, 3);
  const score = scoreLead(input).final;
  const human = requiresHumanReview(`${input.message || ""} ${input.target_price || ""}`, score);
  const questions = missing.length ? `Could you please share ${missing.join(", ")}?` : "Could you confirm the target quantity and delivery market?";
  return {
    site: brand.site,
    brand: brand.brand,
    language: input.language || "en",
    intent: human ? "human_review" : "product_inquiry",
    product_category: input.product_category || "Other",
    lead_score: score,
    risk_level: human ? "high" : "low",
    missing_information: missing,
    customer_summary: `${input.company || input.name || "Customer"} is interested in ${input.product || input.product_category || "a custom product"}.`,
    recommended_action: human ? "Sales review is required before any reply." : "Review the brief and confirm the next sample-development step.",
    reply_body: `Thank you for contacting ${brand.brand}. We received your inquiry about ${input.product || input.product_category || "your custom project"}. ${questions}\n\n${brand.signature}`,
    human_review_required: human,
  };
}

function extractOutputText(response) {
  if (response.output_text) return response.output_text;
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return "";
}

export async function createAiDraft(input) {
  const safeFallback = fallback(input);
  if (!process.env.OPENAI_API_KEY) return { ...safeFallback, model: "rules-fallback" };
  const brand = getBrand(input.site);
  const prompt = [
    `You are the ${brand.brand} B2B inquiry drafting assistant.`,
    `Use only this brand knowledge: ${brand.knowledge.join("; ")}.`,
    "Never mix the other brand into the reply.",
    "Do not confirm price, final MOQ, fees, PI, bank details, payment, contract, compensation, shipping cost or final delivery date.",
    "For those topics, complaints, suspicious attachments, high-value leads, low confidence or requests for a person, require human review.",
    "Reply in the customer's language, professionally and briefly, with 1-3 useful procurement questions.",
    `Inquiry: ${JSON.stringify(input)}`,
  ].join("\n");
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SALES_MODEL || "gpt-5.6-luna",
        input: prompt,
        text: { format: { type: "json_schema", name: "sales_reply", strict: true, schema } },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed (${response.status}).`);
    const result = JSON.parse(extractOutputText(await response.json()));
    if (result.site !== brand.site || result.brand !== brand.brand) throw new Error("Brand mismatch.");
    if (requiresHumanReview(`${input.message || ""} ${input.target_price || ""}`, result.lead_score)) {
      result.human_review_required = true;
      result.risk_level = "high";
    }
    return { ...result, model: process.env.OPENAI_SALES_MODEL || "gpt-5.6-luna" };
  } catch {
    return { ...safeFallback, model: "rules-fallback", recommended_action: `${safeFallback.recommended_action} AI API fallback used.` };
  }
}
