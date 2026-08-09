import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifyCustomer } from "../lib/crm/identity.js";
import {
  ingestSharedInquiry,
  mapSharedInquiryPayload,
} from "../lib/crm/shared-ingest.js";
import { evaluateOutboundEligibility } from "../lib/crm/supabase.js";
import { POST as checkProspect } from "../app/api/shared-crm/prospect-check/route.js";

const CAP_ID = "31111111-1111-4111-8111-111111111111";
const NOV_ID = "32222222-2222-4222-8222-222222222222";

function matchesCustomer(filter, customer) {
  return [
    ["email_normalized", customer.email_normalized],
    ["phone_normalized", customer.phone_normalized],
    ["whatsapp_phone", customer.whatsapp_phone],
    ["domain", customer.domain],
    ["company_normalized", customer.company_normalized],
  ].some(([field, value]) => value && filter.includes(`${field}.eq.${value}`));
}

async function withCrmDatabase(seed, run) {
  const saved = {
    fetch: global.fetch,
    url: process.env.SUPABASE_URL,
    publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    expectedRef: process.env.CRM_EXPECTED_SUPABASE_PROJECT_REF,
    openai: process.env.OPENAI_API_KEY,
    automatedEmail: process.env.CRM_AUTOMATED_EMAIL_ENABLED,
  };
  const state = {
    customers: structuredClone(seed.customers || []),
    inquiries: structuredClone(seed.inquiries || []),
    suppressions: structuredClone(seed.suppressions || []),
    activities: [],
    tasks: [],
    emailDrafts: [],
    aiReplyLogs: [],
    customerPosts: 0,
    inquiryPosts: 0,
  };
  process.env.SUPABASE_URL = "https://crm.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-role";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.CRM_EXPECTED_SUPABASE_PROJECT_REF;
  delete process.env.OPENAI_API_KEY;
  process.env.CRM_AUTOMATED_EMAIL_ENABLED = "false";

  global.fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    const table = url.pathname.split("/").pop();
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;

    if (table === "inquiries" && method === "GET") {
      const submission = (url.searchParams.get("submission_id") || "").replace(/^eq\./, "");
      const customerId = (url.searchParams.get("customer_id") || "").replace(/^eq\./, "");
      if (submission) return Response.json(state.inquiries.filter((row) => row.submission_id === submission));
      if (customerId) return Response.json(state.inquiries.filter((row) => row.customer_id === customerId));
      return Response.json([]);
    }
    if (table === "customers" && method === "GET") {
      const filter = url.searchParams.get("or") || "";
      return Response.json(state.customers.filter((customer) => matchesCustomer(filter, customer)).slice(0, 5));
    }
    if (table === "crm_suppressions" && method === "GET") {
      const type = (url.searchParams.get("match_type") || "").replace(/^eq\./, "");
      const value = (url.searchParams.get("normalized_value") || "").replace(/^eq\./, "");
      return Response.json(state.suppressions.filter(
        (row) => row.active !== false && row.match_type === type && row.normalized_value === value,
      ).slice(0, 1));
    }
    if (table === "crm_resolve_customer" && method === "POST") {
      const candidate = body.p_input;
      const matchPairs = [
        ["email", "email_normalized"],
        ["phone", "phone_normalized"],
        ["whatsapp", "whatsapp_phone"],
        ["domain", "domain"],
        ["website", "website_normalized"],
      ];
      const strong = matchPairs.find(([, field]) => (
        candidate[field] && state.customers.some((row) => row[field] === candidate[field])
      ));
      let customer = strong
        ? state.customers.find((row) => row[strong[1]] === candidate[strong[1]])
        : null;
      let matchMethod = strong?.[0] || null;
      let duplicateReview = false;
      if (!customer && candidate.company_normalized) {
        customer = state.customers.find(
          (row) => row.company_normalized === candidate.company_normalized,
        ) || null;
        if (customer) {
          matchMethod = "company_review";
          duplicateReview = true;
        }
      }
      const suppression = state.suppressions.find((row) => row.active !== false && [
        ["email", candidate.email_normalized],
        ["phone", candidate.phone_normalized],
        ["whatsapp", candidate.whatsapp_phone],
        ["domain", candidate.domain],
        ["website", candidate.website_normalized],
        ["company", candidate.company_normalized],
        ["contact_person", candidate.contact_normalized],
      ].some(([type, value]) => value && row.match_type === type && row.normalized_value === value));
      let created = false;
      if (!customer) {
        created = true;
        matchMethod = "created";
        state.customerPosts += 1;
        customer = {
          id: `customer-${state.customers.length + 1}`,
          ...candidate,
          relationship_status: suppression ? "blocked" : "new_lead",
          do_not_prospect: Boolean(suppression),
          duplicate_review: false,
          duplicate_of: null,
        };
        state.customers.push(customer);
      }
      return Response.json({
        customer,
        created,
        match_method: matchMethod,
        duplicate_review: duplicateReview,
        suppression_id: suppression?.id || null,
      });
    }
    if (table === "customers" && method === "POST") {
      state.customerPosts += 1;
      const duplicate = state.customers.find((row) => (
        body.email_normalized && row.email_normalized === body.email_normalized
      ));
      if (duplicate) return Response.json({ message: "duplicate customer" }, { status: 409 });
      const customer = { id: `customer-${state.customers.length + 1}`, ...body };
      state.customers.push(customer);
      return Response.json([customer]);
    }
    if (table === "customers" && method === "PATCH") {
      throw new Error("ingest must never overwrite an existing customer");
    }
    if (table === "inquiries" && method === "POST") {
      state.inquiryPosts += 1;
      const duplicate = state.inquiries.find((row) => row.submission_id === body.submission_id);
      if (duplicate && url.searchParams.get("on_conflict") === "submission_id") return Response.json([]);
      const inquiry = {
        id: `inquiry-${state.inquiries.length + 1}`,
        inquiry_number: `${body.site === "novlane" ? "NOV" : "CAP"}-TEST-${state.inquiries.length + 1}`,
        ...body,
      };
      state.inquiries.push(inquiry);
      return Response.json([inquiry]);
    }
    if (table === "inquiries" && method === "PATCH") {
      const id = (url.searchParams.get("id") || "").replace(/^eq\./, "");
      const inquiry = state.inquiries.find((row) => row.id === id);
      Object.assign(inquiry, body);
      return Response.json([inquiry]);
    }
    const stores = {
      activities: state.activities,
      tasks: state.tasks,
      email_drafts: state.emailDrafts,
      ai_reply_logs: state.aiReplyLogs,
    };
    if (stores[table] && method === "POST") {
      const row = { id: `${table}-${stores[table].length + 1}`, ...body };
      stores[table].push(row);
      return Response.json([row]);
    }
    throw new Error(`Unexpected mock request: ${method} ${url}`);
  };

  try {
    return await run(state);
  } finally {
    global.fetch = saved.fetch;
    if (saved.url === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = saved.url;
    if (saved.publicUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = saved.publicUrl;
    if (saved.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = saved.key;
    if (saved.expectedRef === undefined) delete process.env.CRM_EXPECTED_SUPABASE_PROJECT_REF;
    else process.env.CRM_EXPECTED_SUPABASE_PROJECT_REF = saved.expectedRef;
    if (saved.openai === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = saved.openai;
    if (saved.automatedEmail === undefined) delete process.env.CRM_AUTOMATED_EMAIL_ENABLED;
    else process.env.CRM_AUTOMATED_EMAIL_ENABLED = saved.automatedEmail;
  }
}

function inquiry(siteSource, submissionId, overrides = {}) {
  return ingestSharedInquiry({
    siteSource,
    raw: {
      submission_id: submissionId,
      name: "Alice Buyer",
      email: "alice@acme.example",
      company: "Acme Sports Ltd.",
      company_website: "https://www.acme.example/about",
      ...overrides,
    },
  });
}

test("A. Cappuccino new inquiry uses the canonical CRM workflow without sending email", async () => {
  await withCrmDatabase({}, async (state) => {
    const saved = await inquiry("cappuccino", CAP_ID);
    assert.equal(saved.identityStatus, "new_lead");
    assert.equal(saved.emailStatus, "skipped");
    assert.equal(saved.inquiry.site_source, "cappuccino");
    assert.equal(saved.inquiry.brand, "Cappuccino Bag");
    assert.equal(state.customers.length, 1);
    assert.equal(state.activities.length, 1);
    assert.equal(state.tasks.length, 1);
    assert.equal(state.emailDrafts.length, 1);
  });
});

test("B. Novlane new inquiry uses the same canonical CRM workflow", async () => {
  await withCrmDatabase({}, async (state) => {
    const saved = await inquiry("novlane", NOV_ID, { email: "nora@atelier.example" });
    assert.equal(saved.inquiry.site_source, "novlane");
    assert.equal(saved.inquiry.brand, "Novlane");
    assert.equal(state.inquiries.length, 1);
    assert.equal(state.customers.length, 1);
  });
});

test("C. same email with different submissions keeps one customer and separate inquiries", async () => {
  await withCrmDatabase({}, async (state) => {
    const first = await inquiry("cappuccino", CAP_ID);
    const second = await inquiry("cappuccino", NOV_ID);
    assert.equal(first.customer.id, second.customer.id);
    assert.equal(second.identityStatus, "existing_lead");
    assert.equal(state.customerPosts, 1);
    assert.equal(state.inquiries.length, 2);
  });
});

test("D. same normalized company with different email keeps one customer for duplicate review", async () => {
  await withCrmDatabase({}, async (state) => {
    const first = await inquiry("cappuccino", CAP_ID, { company_website: "" });
    const second = await inquiry("cappuccino", NOV_ID, {
      email: "procurement@other-mail.example",
      company: "ACME SPORTS LTD",
      company_website: "",
    });
    assert.equal(first.customer.id, second.customer.id);
    assert.equal(second.matchMethod, "company_review");
    assert.equal(second.identityStatus, "duplicate_review");
    assert.equal(state.customerPosts, 1);
    assert.equal(state.emailDrafts.length, 1);
  });
});

test("E. same customer across Cappuccino and Novlane remains one identity with two brands", async () => {
  await withCrmDatabase({}, async (state) => {
    const cap = await inquiry("cappuccino", CAP_ID);
    const nov = await inquiry("novlane", NOV_ID);
    assert.equal(cap.customer.id, nov.customer.id);
    assert.deepEqual(state.inquiries.map((row) => row.site_source), ["cappuccino", "novlane"]);
    assert.deepEqual(state.inquiries.map((row) => row.brand), ["Cappuccino Bag", "Novlane"]);
    assert.equal(state.customers.length, 1);
  });
});

test("F. existing customer submits a new inquiry without customer overwrite", async () => {
  const existing = {
    id: "customer-existing",
    email: "original@acme.example",
    email_normalized: "alice@acme.example",
    company: "Original Company Name",
    domain: "acme.example",
    relationship_status: "existing_customer",
  };
  await withCrmDatabase({ customers: [existing] }, async (state) => {
    const before = structuredClone(state.customers[0]);
    const saved = await inquiry("cappuccino", CAP_ID, { company: "Do Not Overwrite" });
    assert.equal(saved.identityStatus, "existing_customer");
    assert.deepEqual(state.customers[0], before);
    assert.equal(state.customerPosts, 0);
  });
});

test("G. blocked domain is ingested as blocked and never receives an email draft", async () => {
  await withCrmDatabase({
    suppressions: [{ id: "suppression-1", match_type: "domain", normalized_value: "acme.example", active: true }],
  }, async (state) => {
    const saved = await inquiry("cappuccino", CAP_ID);
    assert.equal(saved.identityStatus, "blocked");
    assert.equal(saved.inquiry.suppression_id, "suppression-1");
    assert.equal(state.customers[0].do_not_prospect, true);
    assert.equal(state.emailDrafts.length, 0);
    assert.equal(state.tasks[0].priority, "urgent");
  });
});

test("H. retry with the same submission_id is fully idempotent", async () => {
  await withCrmDatabase({}, async (state) => {
    const first = await inquiry("cappuccino", CAP_ID);
    const retry = await inquiry("cappuccino", CAP_ID);
    assert.equal(retry.idempotent, true);
    assert.equal(retry.identityStatus, "duplicate");
    assert.equal(retry.inquiry.id, first.inquiry.id);
    assert.equal(state.customerPosts, 1);
    assert.equal(state.inquiryPosts, 1);
    assert.equal(state.activities.length, 1);
    assert.equal(state.tasks.length, 1);
  });
});

test("I. failed email_status persistence remains an explicit failure", async () => {
  await assert.rejects(() => ingestSharedInquiry({
    siteSource: "cappuccino",
    raw: { submission_id: CAP_ID, name: "Alice", email: "alice@example.com" },
  }, {
    findExisting: async () => null,
    createDraft: async () => ({
      lead_score: 20, intent: "inquiry", risk_level: "low", human_review_required: false,
      customer_summary: "summary", recommended_action: "review", reply_body: "draft",
    }),
    createStored: async (input) => ({
      customer: { id: "customer-1" },
      inquiry: { id: "inquiry-1", inquiry_number: "CAP-TEST-1", ...input },
      idempotent: false,
      identityStatus: "new_lead",
      matchMethod: "created",
    }),
    persistWorkflow: async () => {},
    setEmailStatus: async () => { throw new Error("email status write failed"); },
  }), /email status write failed/);
});

test("J. missing optional attribution fields remains valid and null-safe", () => {
  const mapped = mapSharedInquiryPayload("cappuccino", {
    submission_id: CAP_ID,
    name: "Alice",
    email: "alice@example.com",
  });
  for (const field of [
    "first_landing_page", "referrer", "utm_source", "utm_medium", "utm_campaign",
    "utm_term", "utm_content", "gclid", "msclkid", "device", "country", "first_visit_time",
  ]) assert.equal(mapped[field], null);
  assert.ok(mapped.submit_time);
});

test("relationship classifications and outbound guard cover old, blocked and supplier records", async () => {
  assert.equal(classifyCustomer({ relationship_status: "old_customer" }), "old_customer");
  assert.equal(classifyCustomer({ relationship_status: "supplier_non_buyer" }), "supplier_non_buyer");
  assert.equal(classifyCustomer({ do_not_contact: true }), "blocked");
  await withCrmDatabase({
    suppressions: [{ id: "suppression-2", match_type: "email", normalized_value: "alice@acme.example", active: true }],
  }, async () => {
    const result = await evaluateOutboundEligibility({ email: "ALICE@ACME.EXAMPLE" });
    assert.deepEqual({ allowed: result.allowed, reason: result.reason }, { allowed: false, reason: "suppressed" });
  });
});

test("conflicting strong identifiers are blocked for duplicate review", async () => {
  await withCrmDatabase({
    customers: [
      { id: "customer-email", email_normalized: "alice@acme.example" },
      { id: "customer-phone", phone_normalized: "+8613900000000" },
    ],
  }, async () => {
    const result = await evaluateOutboundEligibility({
      email: "alice@acme.example",
      phone: "+86 139 0000 0000",
    });
    assert.deepEqual(
      { allowed: result.allowed, reason: result.reason },
      { allowed: false, reason: "duplicate_review" },
    );
  });
});

test("future prospect check rejects an invalid secret before reading JSON", async () => {
  const saved = process.env.CRM_PROSPECT_CHECK_SECRET;
  process.env.CRM_PROSPECT_CHECK_SECRET = "configured-prospect-secret";
  let parsed = false;
  try {
    const response = await checkProspect({
      headers: new Headers({ authorization: "Bearer incorrect-secret" }),
      json: async () => { parsed = true; throw new Error("must not parse"); },
    });
    assert.equal(response.status, 401);
    assert.equal(parsed, false);
  } finally {
    if (saved === undefined) delete process.env.CRM_PROSPECT_CHECK_SECRET;
    else process.env.CRM_PROSPECT_CHECK_SECRET = saved;
  }
});

test("identity and suppression migration is additive, constrained and protected", async () => {
  const sql = await readFile(
    new URL("../supabase/migrations/20260809164921_crm_identity_suppression.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /create table if not exists public\.crm_suppressions/);
  assert.match(sql, /relationship_status is null/);
  assert.match(sql, /'new_lead'.*'existing_lead'.*'existing_customer'.*'old_customer'/s);
  assert.match(sql, /'blocked'.*'duplicate'.*'supplier_non_buyer'/s);
  assert.match(sql, /alter table public\.crm_suppressions enable row level security/);
  assert.match(sql, /revoke all on table public\.crm_suppressions from anon/);
  assert.match(sql, /crm admins manage suppressions/);
  assert.match(sql, /security invoker/);
  assert.doesNotMatch(sql, /update public\.customers/);
  assert.doesNotMatch(sql, /set email_normalized/);
});
