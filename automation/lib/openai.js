import { findProhibitedClaims, prohibitedSensitivePatterns } from "../config/prohibited-claims.js";

const rate = { nextAt: 0 };

function redactInput(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (prohibitedSensitivePatterns.some((pattern) => pattern.test(text))) {
    throw new Error("Sensitive data was rejected before AI processing.");
  }
  return text.slice(0, 40000);
}

function extractText(response) {
  if (response.output_text) return response.output_text;
  return (response.output || []).flatMap((item) => item.content || [])
    .find((item) => item.type === "output_text")?.text || "";
}

export async function generateStructuredOutput({
  taskId, prompt, schema, schemaName = "seo_output", promptVersion = "v1",
  timeoutMs = 30000, maxOutputTokens = 4000, retries = 2,
}) {
  if (!process.env.OPENAI_API_KEY) return { skipped: true, reason: "OPENAI_API_KEY is not configured." };
  const safePrompt = redactInput(prompt);
  const wait = Math.max(0, rate.nextAt - Date.now());
  if (wait) await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 1500)));
  rate.nextAt = Date.now() + 250;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `${taskId || "seo"}-${promptVersion}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5.4",
          input: `[task:${taskId || "unknown"}][prompt:${promptVersion}]\n${safePrompt}`,
          max_output_tokens: maxOutputTokens,
          text: { format: { type: "json_schema", name: schemaName, strict: true, schema } },
        }),
      });
      if (!response.ok) throw new Error(`OpenAI request failed (${response.status}).`);
      const payload = await response.json();
      const output = JSON.parse(extractText(payload));
      const claims = findProhibitedClaims(JSON.stringify(output));
      if (claims.length) throw new Error("AI output contains prohibited claims.");
      return { output, usage: payload.usage || null, model: payload.model, promptVersion };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
