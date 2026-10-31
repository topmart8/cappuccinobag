import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { uploadInquiryAttachments, validateInquiryAttachments } from '../lib/inquiry/attachments.js';
import { storageUpload } from '../lib/crm/supabase.js';

const id = '33333333-3333-4333-8333-333333333333';
const file = (size, type = 'application/pdf', name = 'internal.pdf') => new File([new Uint8Array(size)], name, { type });
test('attachment exact boundary, cumulative overflow, count and MIME are checked before writes', () => {
  assert.doesNotThrow(() => validateInquiryAttachments([]));
  assert.doesNotThrow(() => validateInquiryAttachments(Array.from({length: 5}, () => file(800_000))));
  assert.throws(() => validateInquiryAttachments([file(2_000_000), file(2_000_001)]), /4 MB/);
  assert.throws(() => validateInquiryAttachments(Array.from({length: 6}, () => file(1))), /5 files/);
  assert.throws(() => validateInquiryAttachments([file(1, 'text/html')]), /Unsupported/);
});
test('partial storage failure and parallel identical retries reuse immutable object paths', async () => {
  const objects = new Map(); let failSecond = true;
  const store = async (bucket, path, blob, options) => {
    assert.equal(options.contentAddressed, true);
    if (path.includes('/1-') && failSecond) { failSecond = false; throw new Error('injected storage outage'); }
    const body = Buffer.from(await blob.arrayBuffer());
    if (objects.has(path)) assert.deepEqual(objects.get(path), body);
    objects.set(path, body);
  };
  const files = [file(12), file(24)];
  await assert.rejects(uploadInquiryAttachments(files, {submissionId: id}, store), /outage/);
  assert.equal(objects.size, 1);
  const [one, two] = await Promise.all([uploadInquiryAttachments(files, {submissionId: id}, store), uploadInquiryAttachments(files, {submissionId: id}, store)]);
  assert.deepEqual(one, two); assert.equal(objects.size, 2);
  const changed = await uploadInquiryAttachments([file(13)], {submissionId: id}, store);
  assert.notEqual(changed[0].path, one[0].path); assert.equal(objects.size, 3);
});
test('storage recognizes exact duplicate errors only, without enabling overwrite', async () => {
  const oldFetch = global.fetch; const oldUrl = process.env.SUPABASE_URL; const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = 'https://storage.example.invalid'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'isolated-test-only';
  try {
    for (const [status, body, accepted] of [[400, {message:'Asset already exists'}, true], [409, {code:'KeyAlreadyExists'}, true], [403, {message:'Access denied'}, false], [400, {code:'InvalidMimeType'}, false]]) {
      global.fetch = async (url, options) => { assert.equal(options.headers['x-upsert'], 'false'); return Response.json(body, {status}); };
      const request = storageUpload('test', 'immutable', file(1), {contentAddressed:true});
      if (accepted) assert.equal(await request, 'immutable'); else await assert.rejects(request, /upload failed/);
    }
  } finally { global.fetch = oldFetch; for (const [key,value] of [['SUPABASE_URL',oldUrl],['SUPABASE_SERVICE_ROLE_KEY',oldKey]]) { if(value === undefined) delete process.env[key]; else process.env[key]=value; } }
});
test('original home product routing remains the same complete block before supplemental businesses', () => {
  const base = execFileSync('git', ['show','6f2ccccb27eb53a94d1ca025429b3e3676a9b3c8:app/static-site.js'], {encoding:'utf8'});
  const current = readFileSync('app/static-site.js','utf8');
  assert.equal(current.match(/const buyerPaths = .*?;\n/)[0], base.match(/const buyerPaths = .*?;\n/)[0]);
  assert.ok(current.includes('${hero}${buyerPaths}${businessPaths}${featuredProducts}'));
  const oem = readFileSync('public/site/oem-odm-bag-manufacturer/index.html','utf8');
  assert.ok(oem.includes('<title>OEM/ODM Bag Manufacturer | Cappuccino Bag</title>'));
  assert.ok(oem.includes('<h1>From Design Brief to Bulk Bag Shipment</h1>'));
  assert.ok(oem.includes('Custom MOQ is 300 pcs per style'));
});
