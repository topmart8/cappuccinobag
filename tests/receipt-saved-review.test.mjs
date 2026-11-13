import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createSubmissionGuard } from '../lib/inquiry/client-contract.js';

const script = readFileSync(new URL('../public/site/assets/script.js', import.meta.url), 'utf8');
const padel = readFileSync(new URL('../app/racket-sports/padel-bags/PadelRfqForm.jsx', import.meta.url), 'utf8');

async function exercise(kind, receipt, httpOk = true) {
  const handlers = {}; const statuses = []; const tracked = []; let resets = 0;
  const button = { disabled: false, classList: { add() {}, remove() {} } };
  const form = { dataset: {}, fields: { name: 'TEST ONLY', message: 'Keep my brief' },
    setAttribute() {}, removeAttribute() {},
    querySelector: () => button, querySelectorAll: () => [],
    addEventListener: (key, fn) => { handlers[key] = fn; }, appendChild(node) { this.statusNode = node; },
    reset() { resets++; this.fields.message = ''; } };
  const guard = createSubmissionGuard(() => 'submission-test');
  const context = {
    form, forms: [form], document: { createElement: () => ({ setAttribute() {} }) },
    window: { crypto: { randomUUID: () => 'submission-test' }, cappuccinoAnalytics: { trackLeadSuccess: (...args) => tracked.push(args) } },
    FormData: class { constructor(f) { this.values = new Map(Object.entries(f.fields)); } entries() { return this.values.entries(); } delete(k) { this.values.delete(k); } set(k, v) { this.values.set(k, v); } },
    getAttribution: () => ({}), preselectInquiryContext() {}, updatePetProjectField() {}, validateInquiryForm: () => true,
    setInquiryStatus: (_f, message, type) => statuses.push({ message, type }),
    setStatus: (status) => statuses.push(status), submissionGuard: { current: guard },
    readInquiryAttribution: () => ({}), buildPadelInquiryPayload: (fields, _a, id) => ({ ...fields, submission_id: id }),
    fetch: async () => ({ ok: httpOk, json: async () => receipt }),
  };
  if (kind === 'lead') {
    vm.runInNewContext(script.slice(script.indexOf('function submissionIdFor'), script.indexOf('function setInquiryStatus')), context);
    await handlers.submit({ preventDefault() {} });
    return { success: /has been saved/.test(form.statusNode.textContent), resets, message: form.fields.message, tracked: tracked.length, retryId: form.dataset.submissionId, buttonDisabled: button.disabled };
  }
  if (kind === 'inquiry') {
    const helper = script.slice(script.indexOf('function submissionIdFor'), script.indexOf('forms.forEach'));
    vm.runInNewContext(helper + script.slice(script.indexOf('function initializeInquiryForm'), script.indexOf('document.querySelectorAll(".inquiry-form")')) + '\ninitializeInquiryForm(form);', context);
    await handlers.submit({ preventDefault() {} });
  } else {
    vm.runInNewContext(padel.slice(padel.indexOf('async function submitRfq'), padel.indexOf('\n  return (')) + '\nthis.submitRfq = submitRfq;', context);
    await context.submitRfq({ preventDefault() {}, currentTarget: form });
  }
  return { success: statuses.at(-1)?.type === 'success', resets, message: form.fields.message, tracked: tracked.length,
    retryId: kind === 'padel' ? guard.currentSubmissionId() : form.dataset.submissionId };
}

const valid = { ok: true, saved: true, inquiryNumber: 'TEST-ONLY-RECEIPT', submissionId: 'submission-test', notification: { status: 'accepted' } };
const cases = [
  ['explicit not saved', { ...valid, saved: false }, true, false],
  ['missing saved flag', { ...valid, saved: undefined }, true, false],
  ['string saved flag', { ...valid, saved: 'true' }, true, false],
  ['non-boolean ok flag', { ...valid, ok: 'true' }, true, false],
  ['mismatched submission', { ...valid, submissionId: 'other' }, true, false],
  ['HTTP failure', valid, false, false],
  ['saved with notification accepted', valid, true, true],
  ['saved with notification pending', { ...valid, notification: { status: 'pending' } }, true, true],
];
for (const kind of ['lead', 'inquiry', 'padel']) {
  for (const [name, receipt, httpOk, expected] of cases) {
    test(`${kind}: ${name}`, async () => {
      const result = await exercise(kind, receipt, httpOk);
      assert.equal(result.success, expected);
      assert.equal(result.tracked, expected ? 1 : 0);
      if (!expected) {
        assert.equal(result.resets, 0);
        assert.equal(result.message, 'Keep my brief');
        assert.equal(result.retryId, 'submission-test');
        if (kind === 'lead') assert.equal(result.buttonDisabled, false);
      } else if (kind !== 'lead') {
        assert.equal(result.resets, 1);
      }
    });
  }
}
