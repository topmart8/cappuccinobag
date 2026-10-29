import test from 'node:test';
import assert from 'node:assert/strict';
import { ingestSharedInquiry } from '../lib/crm/shared-ingest.js';

const raw = { name: 'ISOLATED QA', email: 'qa@example.invalid', submission_id: '33333333-3333-4333-8333-333333333333' };
function fixture(failure) {
  let existing = null;
  const calls = { create: 0, workflow: 0, email: 0, status: 0 };
  const deps = {
    findExisting: async () => existing,
    createDraft: async () => ({ human_review_required: true }),
    createStored: async (input) => { calls.create++; existing = { id: 'isolated-inquiry', inquiry_number: 'QA-ONLY', ...input }; return { customer: { id: 'isolated-customer' }, inquiry: existing }; },
    persistWorkflow: async () => { calls.workflow++; if (failure === 'workflow') throw new Error('synthetic workflow failure'); },
    deliverEmails: async () => { calls.email++; return 'sent'; },
    setEmailStatus: async () => { calls.status++; if (failure === 'status') throw new Error('synthetic status failure'); },
  };
  return { deps, calls };
}
for (const [failure,stage] of [['workflow','workflow'],['status','email_status']]) {
  test(`canonical acceptance survives ${failure} failure and lost-response retry does not duplicate`, async () => {
    const { deps, calls } = fixture(failure);
    const first = await ingestSharedInquiry({ siteSource: 'cappuccino', raw }, deps);
    assert.equal(first.inquiry.inquiry_number, 'QA-ONLY');
    assert.deepEqual(first.postSaveFailures, [stage]);
    assert.equal(first.emailStatusPersisted, failure !== 'status');
    if (failure === 'status') assert.equal(first.inquiry.email_status, 'pending');
    // Simulate losing the accepted response. The same logical ID finds the saved inquiry.
    const retry = await ingestSharedInquiry({ siteSource: 'cappuccino', raw }, deps);
    assert.equal(retry.idempotent, true);
    assert.equal(retry.inquiry.inquiry_number, 'QA-ONLY');
    assert.deepEqual(calls, { create: 1, workflow: 1, email: 1, status: 1 });
  });
}
test('canonical persistence failure still rejects before workflow or notification', async () => {
  const { deps, calls } = fixture();
  deps.createStored = async () => { throw new Error('synthetic persistence failure'); };
  await assert.rejects(ingestSharedInquiry({ siteSource: 'cappuccino', raw }, deps), /persistence failure/);
  assert.deepEqual(calls, { create: 0, workflow: 0, email: 0, status: 0 });
});
