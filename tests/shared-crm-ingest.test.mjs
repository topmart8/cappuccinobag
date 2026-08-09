import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverInquiryEmails,
  generateDedupeKey,
  ingestSharedInquiry,
  mapSharedInquiryPayload,
  validSharedSecret,
  validateSiteSource,
} from "../lib/crm/shared-ingest.js";

const CAP_ID = "11111111-1111-4111-8111-111111111111";
const NOV_ID = "22222222-2222-4222-8222-222222222222";

test("Cappuccino payload mapping preserves the canonical inquiry contract", () => {
  const mapped = mapSharedInquiryPayload("cappuccino", {
    submission_id: CAP_ID,
    name: "  Alice Buyer ",
    company: "Acme Sports",
    email: "ALICE@EXAMPLE.COM",
    phone: "+1 555 000 1000",
    country: "US",
    product_needed: "Padel Bags",
    quantity: "1000 pcs",
    material: "Recycled nylon",
    function_requirement: "Shoe pocket and custom woven logo",
    message: "Need an OEM proposal",
    utm_source: "google",
    current_utm_campaign: "padel-rfq",
    firstLandingPage: "/custom-padel-bag-manufacturer",
    pageUrl: "/inquiry",
    device: "desktop",
  }, [{ name: "tech-pack.pdf", type: "application/pdf", size: 42, path: "crm/tech-pack.pdf" }]);

  assert.equal(mapped.site_source, "cappuccino");
  assert.equal(mapped.site, "cappuccinobag");
  assert.equal(mapped.brand, "Cappuccino Bag");
  assert.equal(mapped.submission_id, CAP_ID);
  assert.equal(mapped.email_status, "pending");
  assert.equal(mapped.name, "Alice Buyer");
  assert.equal(mapped.email, "alice@example.com");
  assert.equal(mapped.product_category, "Padel Bags");
  assert.equal(mapped.customization, "Shoe pocket and custom woven logo");
  assert.equal(mapped.utm_source, "google");
  assert.equal(mapped.current_utm_campaign, "padel-rfq");
  assert.equal(mapped.first_landing_page, "/custom-padel-bag-manufacturer");
  assert.equal(mapped.current_page_url, "/inquiry");
  assert.equal(mapped.uploaded_files[0].name, "tech-pack.pdf");
});

test("Novlane payload mapping uses the same canonical module", () => {
  const mapped = mapSharedInquiryPayload("novlane", {
    submissionId: NOV_ID,
    contact_name: "Nora Buyer",
    company_name: "Atelier Example",
    contact_email: "nora@example.com",
    whats_app: "+33 600 000 000",
    productType: "Tartan Collection",
    estimatedQuantity: "500",
    preferredMaterial: "Tartan textile",
    customization: "Embossed logo",
    attachments: [{ name: "brief.png", type: "image/png", size: 128, path: "novlane/brief.png" }],
  });

  assert.equal(mapped.site_source, "novlane");
  assert.equal(mapped.site, "novlane");
  assert.equal(mapped.brand, "Novlane");
  assert.equal(mapped.product, "Tartan Collection");
  assert.equal(mapped.quantity, "500");
  assert.equal(mapped.material, "Tartan textile");
  assert.equal(mapped.customization, "Embossed logo");
  assert.equal(mapped.whatsapp, "+33 600 000 000");
  assert.equal(mapped.uploaded_files[0].path, "novlane/brief.png");
});

test("dedupe_key generation is deterministic and site scoped", () => {
  const first = generateDedupeKey("cappuccino", CAP_ID);
  assert.equal(first, generateDedupeKey("cappuccino", CAP_ID));
  assert.notEqual(first, generateDedupeKey("novlane", CAP_ID));
  assert.match(first, /^[0-9a-f]{64}$/);
});

test("site_source validation allows only cappuccino and novlane", () => {
  assert.equal(validateSiteSource("cappuccino"), "cappuccino");
  assert.equal(validateSiteSource("NOVLANE"), "novlane");
  assert.throws(() => validateSiteSource("legacy-site"), /Unsupported site_source/);
  assert.throws(() => mapSharedInquiryPayload("cappuccinobag", {}), /Unsupported site_source/);
});

test("invalid shared secret is rejected, including when no secret is configured", () => {
  assert.equal(validSharedSecret("wrong", "correct"), false);
  assert.equal(validSharedSecret("correct", "correct"), true);
  assert.equal(validSharedSecret("anything", ""), false);
});

test("same submission_id returns success without duplicate writes or emails", async () => {
  let existing = null;
  let creates = 0;
  let workflowWrites = 0;
  let emailRuns = 0;
  const dependencies = {
    findExisting: async () => existing,
    createDraft: async () => ({
      lead_score: 40,
      intent: "inquiry",
      risk_level: "low",
      human_review_required: false,
      customer_summary: "summary",
      recommended_action: "reply",
      reply_body: "Thanks",
    }),
    createStored: async (input) => {
      creates += 1;
      existing = { id: "inquiry-1", inquiry_number: "CAP-20260809-0001", ...input };
      return { customer: { id: "customer-1" }, inquiry: existing, idempotent: false };
    },
    persistWorkflow: async () => { workflowWrites += 1; },
    deliverEmails: async () => { emailRuns += 1; return "sent"; },
    setEmailStatus: async () => {},
  };
  const request = {
    siteSource: "cappuccino",
    raw: { submission_id: CAP_ID, name: "Alice", email: "alice@example.com" },
  };

  const first = await ingestSharedInquiry(request, dependencies);
  const duplicate = await ingestSharedInquiry(request, dependencies);
  assert.equal(first.idempotent, false);
  assert.equal(duplicate.idempotent, true);
  assert.equal(duplicate.inquiry.inquiry_number, first.inquiry.inquiry_number);
  assert.equal(creates, 1);
  assert.equal(workflowWrites, 1);
  assert.equal(emailRuns, 1);
});

test("existing Cappuccino notification and safe auto-reply behavior is preserved", async () => {
  const savedEnabled = process.env.CAP_INQUIRY_AUTO_REPLY_ENABLED;
  const savedMode = process.env.CAP_INQUIRY_REPLY_MODE;
  process.env.CAP_INQUIRY_AUTO_REPLY_ENABLED = "true";
  process.env.CAP_INQUIRY_REPLY_MODE = "safe_auto";
  const calls = [];
  const send = async (message) => { calls.push(message); return true; };
  const input = mapSharedInquiryPayload("cappuccino", {
    submission_id: CAP_ID,
    name: "Alice",
    email: "alice@example.com",
    product_category: "Padel Bags",
  });
  const inquiry = { inquiry_number: "CAP-20260809-0001" };
  const status = await deliverInquiryEmails(input, inquiry, {
    human_review_required: false,
    reply_body: "Thank you\nWe will reply soon.",
  }, send);
  assert.equal(status, "sent");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].subject, "[Cappuccino RFQ] CAP-20260809-0001 | Padel Bags");
  assert.equal(calls[0].replyTo, "alice@example.com");
  assert.equal(calls[1].to, "alice@example.com");
  assert.match(calls[1].subject, /We received your Cappuccino Bag inquiry/);
  if (savedEnabled === undefined) delete process.env.CAP_INQUIRY_AUTO_REPLY_ENABLED;
  else process.env.CAP_INQUIRY_AUTO_REPLY_ENABLED = savedEnabled;
  if (savedMode === undefined) delete process.env.CAP_INQUIRY_REPLY_MODE;
  else process.env.CAP_INQUIRY_REPLY_MODE = savedMode;
});

test("shared website ingest never writes a legacy lead or submission table", async () => {
  const originalFetch = global.fetch;
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const savedOpenAi = process.env.OPENAI_API_KEY;
  const writes = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-role";
  delete process.env.OPENAI_API_KEY;
  global.fetch = async (url, options = {}) => {
    const target = new URL(String(url));
    const table = target.pathname.split("/").pop();
    if (options.method && options.method !== "GET") writes.push(table);
    if (table === "inquiries" && options.method === "POST") {
      const body = JSON.parse(options.body);
      return Response.json([{ id: "inquiry-2", inquiry_number: "NOV-20260809-0001", ...body }]);
    }
    if (table === "customers" && target.searchParams.has("select")) {
      return Response.json([{ id: "customer-2", email_normalized: "nora@example.com" }]);
    }
    if (table === "customers") return Response.json([{ id: "customer-2" }]);
    if (options.method === "POST") return Response.json([{ id: `${table}-1` }]);
    return Response.json([]);
  };

  try {
    const result = await ingestSharedInquiry({
      siteSource: "novlane",
      raw: { submission_id: NOV_ID, name: "Nora", email: "nora@example.com" },
    });
    assert.equal(result.idempotent, false);
    assert.ok(writes.includes("inquiries"));
    for (const legacy of ["leads", "contact_submissions", "inquiry_submissions", "form_submissions"]) {
      assert.ok(!writes.includes(legacy), `unexpected legacy write: ${legacy}`);
    }
  } finally {
    global.fetch = originalFetch;
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
    if (savedOpenAi === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = savedOpenAi;
  }
});
