import { createHash } from "node:crypto";
import { createAiDraft } from "./ai.js";
import { BRANDS, recognizeBrand } from "./brand.js";
import { createInquiry, findOrCreateCustomer, normalizePhone, supabaseRequest } from "./supabase.js";

function eventHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function alreadyProcessed(eventId) {
  const rows = await supabaseRequest(`webhook_events?provider_event_id=eq.${encodeURIComponent(eventId)}&select=id&limit=1`);
  return Boolean(rows?.length);
}

async function recordEvent(eventId, type, raw) {
  await supabaseRequest("webhook_events", {
    method: "POST",
    body: {
      provider_event_id: eventId,
      event_type: type,
      payload_hash: eventHash(raw),
      status: "processing",
    },
  });
}

async function finishEvent(eventId, status = "processed", error = null) {
  await supabaseRequest(`webhook_events?provider_event_id=eq.${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: { status, last_error: error ? String(error).slice(0, 300) : null, processed_at: new Date().toISOString() },
  });
}

function messageBody(message) {
  if (message.type === "text") return message.text?.body || "";
  if (message.type === "button") return message.button?.text || "";
  if (message.type === "interactive") {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
  }
  return message[message.type]?.caption || "";
}

async function recentBrand(customerId) {
  const rows = await supabaseRequest(
    `inquiries?customer_id=eq.${customerId}&select=site,brand&order=created_at.desc&limit=1`,
  );
  return rows?.[0] ? BRANDS[rows[0].site] : null;
}

async function conversationFor(customer, brand, phone, confirmed) {
  if (confirmed) {
    const pending = await supabaseRequest(
      `conversations?customer_id=eq.${customer.id}&source_channel=eq.whatsapp&brand_confirmed=eq.false&select=*&order=created_at.desc&limit=1`,
    );
    if (pending?.[0]) {
      await supabaseRequest(`conversations?id=eq.${pending[0].id}`, {
        method: "PATCH",
        body: { site: brand.site, brand: brand.brand, brand_confirmed: true },
      });
      if (pending[0].inquiry_id) {
        await supabaseRequest(`inquiries?id=eq.${pending[0].inquiry_id}`, {
          method: "PATCH",
          body: { site: brand.site, brand: brand.brand, brand_confirmed: true },
        });
      }
      return { ...pending[0], site: brand.site, brand: brand.brand, brand_confirmed: true };
    }
  }
  const existing = await supabaseRequest(
    `conversations?customer_id=eq.${customer.id}&source_channel=eq.whatsapp&site=eq.${brand.site}&select=*&order=created_at.desc&limit=1`,
  );
  if (existing?.[0]) return existing[0];
  const rows = await supabaseRequest("conversations", {
    method: "POST",
    body: {
      customer_id: customer.id,
      site: brand.site,
      brand: brand.brand,
      brand_confirmed: confirmed,
      source_channel: "whatsapp",
      external_conversation_id: phone,
    },
    prefer: "return=representation",
  });
  return rows[0];
}

async function storeAttachment(message, messageId) {
  if (!["image", "document", "audio"].includes(message.type)) return;
  const media = message[message.type] || {};
  const allowed = message.type === "image" || message.type === "audio" ||
    ["application/pdf", "text/plain"].includes(media.mime_type);
  await supabaseRequest("attachments", {
    method: "POST",
    body: {
      message_id: messageId,
      original_name: media.filename || null,
      content_type: media.mime_type || null,
      provider_media_id: media.id || null,
      scan_status: "pending",
      risk_level: allowed ? "medium" : "high",
      metadata: { source: "meta_cloud_api", message_type: message.type, download_blocked_pending_scan: true },
    },
  });
}

export async function sendCloudMessage(to, body) {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return false;
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
      },
    );
    if (response.ok) return true;
    lastStatus = response.status;
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw new Error(`WhatsApp delivery failed (${lastStatus}).`);
}

async function handleStatus(status) {
  if (!status.id) return;
  await supabaseRequest(`messages?external_message_id=eq.${encodeURIComponent(status.id)}`, {
    method: "PATCH",
    body: {
      status: status.status || "unknown",
      updated_at: new Date().toISOString(),
      metadata: { provider_status: status.status, errors: status.errors || [] },
    },
  });
}

async function handleInbound(message) {
  const phone = normalizePhone(message.from);
  if (!phone) throw new Error("Invalid WhatsApp sender.");
  const customer = await findOrCreateCustomer({ phone, whatsapp: phone, language: "en" });
  const body = messageBody(message);
  const brand = recognizeBrand(body) || await recentBrand(customer.id);
  const selectedBrand = brand || BRANDS.cappuccinobag;
  const conversation = await conversationFor(customer, selectedBrand, phone, Boolean(brand));
  const inserted = await supabaseRequest("messages", {
    method: "POST",
    body: {
      conversation_id: conversation.id,
      external_message_id: message.id,
      direction: "inbound",
      message_type: message.type || "text",
      body: body || null,
      status: "received",
      provider_timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : null,
      metadata: { brand_confident: Boolean(brand) },
    },
    prefer: "return=representation",
  });
  await storeAttachment(message, inserted[0].id);
  await supabaseRequest(`customers?id=eq.${customer.id}`, {
    method: "PATCH",
    body: { last_customer_message_at: new Date().toISOString() },
  });

  let inquiryRows = await supabaseRequest(
    `inquiries?customer_id=eq.${customer.id}&site=eq.${selectedBrand.site}&select=*&order=created_at.desc&limit=1`,
  );
  if (!inquiryRows?.length) {
    const created = await createInquiry({
      site: selectedBrand.site,
      brand: selectedBrand.brand,
      brand_confirmed: Boolean(brand),
      source_channel: "whatsapp",
      phone,
      whatsapp: phone,
      language: "en",
      message: body || `[${message.type} attachment]`,
      human_takeover: !brand,
      auto_reply_enabled: Boolean(brand),
      risk_level: brand ? "low" : "medium",
    });
    inquiryRows = [created.inquiry];
    await supabaseRequest(`conversations?id=eq.${conversation.id}`, {
      method: "PATCH",
      body: { inquiry_id: created.inquiry.id },
    });
  }
  const inquiry = inquiryRows[0];
  const clarification = "Are you contacting us about Cappuccino Bag sports and outdoor products, or Novlane handbags and material development?";
  const draft = brand
    ? await createAiDraft({ ...inquiry, message: body, site: selectedBrand.site })
    : {
        site: selectedBrand.site,
        brand: selectedBrand.brand,
        language: "en",
        intent: "brand_clarification",
        product_category: "Other",
        lead_score: 20,
        risk_level: "medium",
        missing_information: ["brand"],
        customer_summary: "WhatsApp contact requires brand confirmation.",
        recommended_action: "Ask the approved brand clarification question.",
        reply_body: clarification,
        human_review_required: true,
        model: "routing-rule",
      };
  const mode = process.env[selectedBrand.site === "cappuccinobag" ? "CAP_WHATSAPP_REPLY_MODE" : "NOV_WHATSAPP_REPLY_MODE"] || "draft_only";
  await supabaseRequest("ai_reply_logs", {
    method: "POST",
    body: {
      inquiry_id: inquiry.id,
      conversation_id: conversation.id,
      site: selectedBrand.site,
      brand: selectedBrand.brand,
      mode,
      model: draft.model,
      input_summary: draft.customer_summary,
      result: draft,
      status: draft.human_review_required ? "needs_review" : "draft",
    },
  });
  if (draft.human_review_required) {
    await supabaseRequest(`customers?id=eq.${customer.id}`, {
      method: "PATCH",
      body: { human_takeover: true, auto_reply_enabled: false },
    });
  }
  if (mode === "safe_auto" && brand && !draft.human_review_required && !customer.human_takeover && customer.auto_reply_enabled !== false) {
    await sendCloudMessage(phone, draft.reply_body);
  }
}

export async function processWhatsAppPayload(payload, raw) {
  const changes = (payload.entry || []).flatMap((entry) => entry.changes || []);
  for (const change of changes) {
    const value = change.value || {};
    for (const status of value.statuses || []) {
      const id = `status:${status.id}:${status.status}:${status.timestamp || ""}`;
      if (await alreadyProcessed(id)) continue;
      await recordEvent(id, `message_${status.status || "status"}`, raw);
      try {
        await handleStatus(status);
        await finishEvent(id);
      } catch (error) {
        await finishEvent(id, "failed", error.message);
        throw error;
      }
    }
    for (const message of value.messages || []) {
      const id = `message:${message.id}`;
      if (await alreadyProcessed(id)) continue;
      await recordEvent(id, `message_${message.type || "unknown"}`, raw);
      try {
        await handleInbound(message);
        await finishEvent(id);
      } catch (error) {
        await finishEvent(id, "failed", error.message);
        throw error;
      }
    }
  }
}
