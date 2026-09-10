import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { POST } from "../app/api/inquiries/route.js";

const NORMAL_ID = "10000000-0000-4000-8000-000000000001";
const ATTACHMENT_ID = "10000000-0000-4000-8000-000000000002";
const EXISTING_ID = "10000000-0000-4000-8000-000000000003";
const FAILURE_ID = "10000000-0000-4000-8000-000000000004";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function createCanonicalCrmMock() {
  const customers = new Map([
    ["existing@example.com", {
      id: "customer-existing",
      email: "existing@example.com",
      email_normalized: "existing@example.com",
      name: "Existing Buyer",
      site: "cappuccinobag",
    }],
  ]);
  const inquiries = new Map();
  const storageUploads = [];
  const emails = [];
  let customerSequence = 0;
  let inquirySequence = 0;
  let failNextInquiryWrite = false;

  async function fetchMock(input, options = {}) {
    const url = new URL(String(input));
    const method = options.method || "GET";

    if (url.origin === "https://api.resend.com") {
      emails.push(JSON.parse(options.body));
      return json({ id: `email-${emails.length}` });
    }

    if (url.pathname.startsWith("/storage/v1/object/")) {
      storageUploads.push({ path: url.pathname, type: options.headers["Content-Type"] });
      return json({ Key: url.pathname });
    }

    const table = url.pathname.split("/").pop();
    if (table === "inquiries" && method === "GET") {
      const submissionId = String(url.searchParams.get("submission_id") || "")
        .replace(/^eq\./, "");
      return json(submissionId && inquiries.has(submissionId) ? [inquiries.get(submissionId)] : []);
    }

    if (table === "customers" && method === "GET") {
      const email = String(url.searchParams.get("email_normalized") || "")
        .replace(/^eq\./, "");
      return json(email && customers.has(email) ? [customers.get(email)] : []);
    }

    if (table === "customers" && method === "POST") {
      const body = JSON.parse(options.body);
      const customer = { id: `customer-new-${++customerSequence}`, ...body };
      customers.set(body.email_normalized, customer);
      return json([customer]);
    }

    if (table === "customers" && method === "PATCH") {
      const id = String(url.searchParams.get("id") || "").replace(/^eq\./, "");
      const existing = [...customers.values()].find((customer) => customer.id === id);
      const updated = { ...existing, ...JSON.parse(options.body) };
      customers.set(updated.email_normalized, updated);
      return json([updated]);
    }

    if (table === "inquiries" && method === "POST") {
      if (failNextInquiryWrite) {
        failNextInquiryWrite = false;
        return json({ message: "controlled CRM failure" }, 503);
      }
      const body = JSON.parse(options.body);
      if (inquiries.has(body.submission_id)) return json([]);
      const inquiry = {
        id: `inquiry-${++inquirySequence}`,
        inquiry_number: `CAP-TEST-${String(inquirySequence).padStart(4, "0")}`,
        ...body,
      };
      inquiries.set(body.submission_id, inquiry);
      return json([inquiry]);
    }

    if (table === "inquiries" && method === "PATCH") {
      const id = String(url.searchParams.get("id") || "").replace(/^eq\./, "");
      const inquiry = [...inquiries.values()].find((item) => item.id === id);
      Object.assign(inquiry, JSON.parse(options.body));
      return json([inquiry]);
    }

    if (["ai_reply_logs", "activities", "email_drafts"].includes(table) && method === "POST") {
      return json([{ id: `${table}-1` }]);
    }

    throw new Error(`Unexpected controlled E2E request: ${method} ${url}`);
  }

  return {
    customers,
    inquiries,
    storageUploads,
    emails,
    fetchMock,
    failNextInquiryWrite() { failNextInquiryWrite = true; },
  };
}

function inquiryRequest(body, ip) {
  return new Request("https://preview.example/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

test("Website RFQ completes the nine controlled canonical CRM scenarios", async () => {
  const savedFetch = global.fetch;
  const savedEnv = { ...process.env };
  const crm = createCanonicalCrmMock();
  global.fetch = crm.fetchMock;
  process.env.SUPABASE_URL = "https://unified-inquiry-crm.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-test-role";
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.INQUIRY_FROM_EMAIL = "rfq@example.test";
  process.env.INQUIRY_TO_EMAIL = "sales@example.test";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.OPENAI_API_KEY;

  try {
    // 1. Normal submission and 6. new customer.
    const normalPayload = {
      submission_id: NORMAL_ID,
      name: "New Buyer",
      email: "new@example.com",
      product_needed: "Travel Bags",
    };
    const normal = await POST(inquiryRequest(normalPayload, "203.0.113.1"));
    const normalResult = await normal.json();
    assert.equal(normal.status, 200, JSON.stringify(normalResult));
    assert.equal(normalResult.ok, true);
    assert.equal(normalResult.submissionId, NORMAL_ID);
    assert.equal(crm.customers.get("new@example.com").id, "customer-new-1");
    assert.equal(crm.inquiries.get(NORMAL_ID).customer_id, "customer-new-1");

    // 2. Duplicate retry and 8. email exactly once.
    const duplicate = await POST(inquiryRequest(normalPayload, "203.0.113.2"));
    const duplicateResult = await duplicate.json();
    assert.equal(duplicate.status, 200);
    assert.equal(duplicateResult.idempotent, true);
    assert.equal(crm.inquiries.size, 1);
    assert.equal(crm.emails.length, 1);

    // 3. Attachment is stored and attached to the one canonical inquiry.
    const form = new FormData();
    form.set("submission_id", ATTACHMENT_ID);
    form.set("name", "Attachment Buyer");
    form.set("email", "attachment@example.com");
    form.set("product_needed", "Padel Bags");
    form.set("attachment", new File(["controlled brief"], "brief.pdf", { type: "application/pdf" }));
    const attachment = await POST(new Request("https://preview.example/api/inquiries", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.3" },
      body: form,
    }));
    assert.equal(attachment.status, 200);
    assert.equal(crm.storageUploads.length, 1);
    assert.equal(crm.inquiries.get(ATTACHMENT_ID).uploaded_files[0].name, "brief.pdf");

    // 4. Attribution is preserved.
    assert.equal(crm.inquiries.get(ATTACHMENT_ID).source_channel, "website");
    const attributedPayload = {
      submission_id: EXISTING_ID,
      name: "Existing Buyer Updated",
      email: "existing@example.com",
      product_needed: "Racket Bags",
      first_landing_page: "https://www.cappuccinobag.com/custom-padel-bag-manufacturer",
      current_page_url: "https://www.cappuccinobag.com/inquiry",
      utm_source: "google",
      current_utm_campaign: "controlled-rfq",
    };

    // 5. Existing customer is reused rather than duplicated.
    const existing = await POST(inquiryRequest(attributedPayload, "203.0.113.4"));
    assert.equal(existing.status, 200);
    assert.equal(crm.customers.get("existing@example.com").id, "customer-existing");
    assert.equal(crm.inquiries.get(EXISTING_ID).customer_id, "customer-existing");
    assert.equal(crm.inquiries.get(EXISTING_ID).utm_source, "google");
    assert.equal(crm.inquiries.get(EXISTING_ID).current_utm_campaign, "controlled-rfq");

    // 7. Backend failure returns failure and creates no notification.
    const emailsBeforeFailure = crm.emails.length;
    crm.failNextInquiryWrite();
    const failed = await POST(inquiryRequest({
      submission_id: FAILURE_ID,
      name: "Failure Buyer",
      email: "failure@example.com",
      product_needed: "Duffel Bags",
    }, "203.0.113.5"));
    assert.equal(failed.status, 502);
    assert.equal(crm.inquiries.has(FAILURE_ID), false);
    assert.equal(crm.emails.length, emailsBeforeFailure);

    // 9. Frontend success is reachable only after an OK CRM response.
    const client = await readFile(new URL("../public/site/assets/script.js", import.meta.url), "utf8");
    const inquiryPage = await readFile(new URL("../public/site/inquiry/index.html", import.meta.url), "utf8");
    assert.match(inquiryPage, /data-endpoint="\/api\/inquiries"/);
    assert.doesNotMatch(inquiryPage, /formsubmit\.co/i);
    const responseGate = client.indexOf('if (!response.ok) throw new Error("Inquiry endpoint failed.");');
    const successState = client.indexOf('"Submitted successfully. Our sales team will contact you soon.",', responseGate);
    assert.ok(responseGate >= 0);
    assert.ok(successState > responseGate);
    assert.doesNotMatch(client, /SUPABASE_SERVICE_ROLE_KEY|service-role-test|server-only-test-role/);
  } finally {
    global.fetch = savedFetch;
    for (const key of Object.keys(process.env)) {
      if (!(key in savedEnv)) delete process.env[key];
    }
    Object.assign(process.env, savedEnv);
  }
});
