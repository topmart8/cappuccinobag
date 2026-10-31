import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { POST } from '../app/api/inquiries/route.js';
import { ingestSharedInquiry, mapSharedInquiryPayload, sendEmail } from '../lib/crm/shared-ingest.js';

const script = fs.readFileSync('public/site/assets/b2b-development.js', 'utf8');

function briefForm(path = 'Concept development') {
  const listeners = {};
  const pathListeners = {};
  const pathField = {
    value: path,
    options: ['Concept development', 'Tech Pack', 'Clubs / events procurement', 'Existing-customer reorder'].map((value) => ({ value })),
    addEventListener(name, fn) { pathListeners[name] = fn; },
    dispatchEvent(event) { pathListeners[event.type]?.(event); },
  };
  const help = { textContent: '' };
  const groups = ['Clubs / events procurement', 'Existing-customer reorder'].map((value) => {
    const field = { disabled: false };
    return { dataset: { rfqPath: value }, hidden: false, field, querySelectorAll: () => [field] };
  });
  const button = { disabled: true };
  return {
    dataset: { inquiryInitialized: 'true' }, button, help, groups, listeners, pathField,
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    querySelector(selector) {
      if (selector.startsWith('button')) return button;
      if (selector.includes('brief_path')) return pathField;
      if (selector === '[data-path-help]') return help;
      return null;
    },
    querySelectorAll: () => groups,
  };
}

function runBrief(forms) {
  const body = {};
  const events = {};
  let currentForms = forms;
  let added;
  vm.runInNewContext(script, {
    document: {
      body,
      querySelectorAll: () => currentForms,
      querySelector: () => currentForms[0],
      addEventListener(name, fn) { events[name] = fn; },
    },
    Event,
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target) { if (target === body) added = this.callback; }
    },
  });
  const add = (form) => {
    currentForms = [form];
    added([{ addedNodes: [{ nodeType: 1, matches: () => false, querySelectorAll: () => [form] }] }]);
  };
  add.click = (path = 'Clubs / events procurement', eventOverrides = {}, entryOverrides = {}) => events.click({
    button: 0,
    target: { closest: () => ({ dataset: { briefPath: path }, hasAttribute: () => false, ...entryOverrides }) },
    ...eventOverrides,
  });
  return add;
}

test('club CTA selects the club RFQ while preserving entered contact and project details', () => {
  const html = fs.readFileSync('public/site/oem-odm-bag-manufacturer/index.html', 'utf8');
  assert.match(html, /<a href="\/oem-odm-bag-manufacturer#project-brief" data-brief-path="Clubs \/ events procurement">Prepare a club or event brief<\/a>/);
  const form = briefForm('Existing-customer reorder');
  form.entered = { name: 'QA Buyer', email: 'qa@example.invalid', message: 'TEST ONLY: keep this brief' };
  const saved = structuredClone(form.entered);
  const run = runBrief([form]);
  run.click();
  assert.equal(form.pathField.value, 'Clubs / events procurement');
  assert.equal(form.groups[0].hidden, false);
  assert.equal(form.groups[0].field.disabled, false);
  assert.equal(form.groups[1].hidden, true);
  assert.equal(form.groups[1].field.disabled, true);
  assert.match(form.help.textContent, /recipient groups/);
  assert.deepEqual(form.entered, saved);
});

test('club CTA targets the replacement form after client navigation', () => {
  const first = briefForm();
  const run = runBrief([first]);
  const replacement = briefForm('Tech Pack');
  run(replacement);
  run.click();
  assert.equal(first.pathField.value, 'Concept development');
  assert.equal(replacement.pathField.value, 'Clubs / events procurement');
  assert.equal(replacement.groups[0].field.disabled, false);
  assert.equal(replacement.button.disabled, false);
});

test('club CTA leaves modified/new-tab/download actions and unknown paths unchanged', () => {
  const form = briefForm();
  const run = runBrief([form]);
  for (const overrides of [{ button: 1 }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }]) run.click(undefined, overrides);
  run.click(undefined, {}, { target: '_blank' });
  run.click(undefined, {}, { hasAttribute: () => true });
  run.click('Not an RFQ path');
  assert.equal(form.pathField.value, 'Concept development');
  assert.equal(form.groups[0].field.disabled, true);
});

test('club CTA tolerates navigation while no development form is mounted', () => {
  const run = runBrief([]);
  assert.doesNotThrow(() => run.click());
});

test('client navigation initializes a replacement brief once and enables submission', () => {
  const first = briefForm();
  const add = runBrief([first]);
  const replacement = briefForm('Existing-customer reorder');
  add(replacement);
  add(replacement);
  assert.equal(replacement.button.disabled, false);
  assert.equal(replacement.listeners.formdata.length, 1);
  assert.equal(replacement.groups[1].hidden, false);
  assert.equal(replacement.groups[0].field.disabled, true);
});

for (const path of ['Concept development', 'Tech Pack', 'Clubs / events procurement', 'Existing-customer reorder']) {
  test(`brief maps to Company OS without a mandatory design file: ${path}`, () => {
    const form = briefForm(path);
    runBrief([form]);
    const data = new FormData();
    const values = {
      name: 'PR50 SYNTHETIC QA', email: 'pr50-qa@example.invalid',
      brief_path: path, brief_design: 'No design files yet', brief_positioning: 'QA court carry',
      brief_launch: '2027-03-01', material: 'QA nylon', target_price: 'USD 25',
      quantity: '300 pcs/style', product_needed: 'Padel Bags', message: 'TEST ONLY - do not quote',
      submission_id: '11111111-1111-4111-8111-111111111111',
    };
    if (path === 'Clubs / events procurement') values.brief_event_mix = 'QA team bags with gift boxes';
    if (path === 'Existing-customer reorder') values.brief_reference = 'QA-NOT-A-REAL-ORDER';
    Object.entries(values).forEach(([key, value]) => data.set(key, value));
    form.listeners.formdata[0]({ formData: data });
    const input = mapSharedInquiryPayload('cappuccino', Object.fromEntries(data));
    assert.equal(input.site, 'cappuccinobag');
    assert.equal(input.quantity, values.quantity);
    assert.equal(input.material, values.material);
    assert.equal(input.target_price, values.target_price);
    assert.equal(input.product_category, 'Padel Bags');
    for (const value of [path, values.brief_launch, values.brief_design, values.message,
      values.brief_event_mix, values.brief_reference].filter(Boolean)) assert.ok(input.message.includes(value));
    assert.deepEqual(input.uploaded_files, []);
    assert.ok(input.message.includes('design approval and sample fee authorization are separate'));
  });
}

test('oversized and unsupported multipart uploads fail before any storage write', async () => {
  const oldFetch = global.fetch;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = 'https://qa.supabase.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic-test-key';
  let reads = 0;
  global.fetch = async (url, options) => {
    assert.equal(options.method, 'GET');
    assert.match(String(url), /\/inquiries\?/);
    reads += 1;
    return Response.json([]);
  };
  try {
    for (const [size, type, status, count = 1] of [[4_000_001, 'application/pdf', 413], [12, 'text/html', 422], [12, 'application/pdf', 422, 6], [2_000_001, 'application/pdf', 413, 2]]) {
      const data = new FormData();
      data.set('name', 'PR50 SYNTHETIC QA'); data.set('email', 'qa@example.invalid');
      for (let i = 0; i < count; i += 1) data.append('attachment', new Blob([new Uint8Array(size)], { type }), `qa-${i}.pdf`);
      const response = await POST(new Request('https://example.test/api/inquiries', { method: 'POST', body: data }));
      assert.equal(response.status, status);
    }
    assert.equal(reads, 0);
  } finally {
    global.fetch = oldFetch;
    for (const [key, value] of [['SUPABASE_URL', oldUrl], ['SUPABASE_SERVICE_ROLE_KEY', oldKey]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('small multipart attachment is saved in the canonical inquiry with private object metadata', async () => {
  let storedInput;
  const pending = [{ name: 'PR50-QA.pdf', size: 12, type: 'application/pdf' }];
  const result = await ingestSharedInquiry({
    siteSource: 'cappuccino', raw: { name: 'QA', email: 'qa@example.invalid' }, pendingFiles: pending,
    uploadFiles: async (files) => {
      assert.equal(files, pending);
      return [{ ...files[0], path: 'cappuccinobag/qa/synthetic.pdf', scan_status: 'pending' }];
    },
  }, {
    findExisting: async () => null,
    createDraft: async () => ({ human_review_required: true }),
    createStored: async (input) => { storedInput = input; return { inquiry: { id: 'qa', ...input }, customer: { id: 'qa' } }; },
    persistWorkflow: async () => {}, deliverEmails: async () => 'sent', setEmailStatus: async () => {},
  });
  assert.equal(storedInput.uploaded_files[0].path, 'cappuccinobag/qa/synthetic.pdf');
  assert.equal(storedInput.uploaded_files[0].scan_status, 'pending');
  assert.equal(result.emailStatus, 'sent');
});

test('internal notification retries are bounded, deduplicated, and distinguish failed from unconfigured', async () => {
  const oldKey = process.env.RESEND_API_KEY;
  const oldFrom = process.env.INQUIRY_FROM_EMAIL;
  const payload = { to: 'qa@example.invalid', subject: 'TEST', html: 'Synthetic', idempotencyKey: 'internal-rfq/qa/1' };
  try {
    delete process.env.RESEND_API_KEY;
    assert.equal(await sendEmail(payload, { request: () => assert.fail('No request without configuration') }), false);
    process.env.RESEND_API_KEY = 'synthetic-test-key';
    process.env.INQUIRY_FROM_EMAIL = 'qa@example.invalid';
    const calls = []; const delays = [];
    assert.equal(await sendEmail(payload, {
      request: async (_, options) => { calls.push(options); return new Response('', { status: calls.length === 1 ? 429 : 200 }); },
      wait: async (ms) => { delays.push(ms); },
    }), true);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].body, calls[1].body);
    assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
    assert.deepEqual(delays, [500]);
    let attempts = 0;
    await assert.rejects(() => sendEmail(payload, {
      request: async () => { attempts += 1; return new Response('', { status: 503 }); }, wait: async () => {},
    }), /retry limit/);
    assert.equal(attempts, 3);
    attempts = 0;
    await assert.rejects(() => sendEmail(payload, {
      request: async () => { attempts += 1; return new Response('', { status: 401 }); }, wait: async () => assert.fail(),
    }), /rejected \(401\)/);
    assert.equal(attempts, 1);
    await assert.rejects(() => sendEmail(payload, {
      request: async () => new Response('', { status: 429, headers: { 'retry-after': '60' } }), wait: async () => assert.fail(),
    }), /later retry/);
  } finally {
    for (const [key, value] of [['RESEND_API_KEY', oldKey], ['INQUIRY_FROM_EMAIL', oldFrom]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
