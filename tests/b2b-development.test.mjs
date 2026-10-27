import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync('public/site/oem-odm-bag-manufacturer/index.html', 'utf8');
const script = fs.readFileSync('public/site/assets/b2b-development.js', 'utf8');
test('development stages and approval boundaries are explicit, with matching visible FAQ', () => {
  const stages = ['Discovery', 'Material Selection', 'Design Approval', 'Sampling', 'Revision', 'Bulk Production & QC'];
  let last = -1;
  for (const stage of stages) { const at = html.indexOf(`<h2>${stage}</h2>`); assert.ok(at > last); last = at; }
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  for (const q of schema.mainEntity) {
    assert.ok(html.includes(`<summary>${q.name}</summary><p>${q.acceptedAnswer.text}</p>`));
  }
  assert.match(html, /300 pcs per style/);
  assert.match(html, /No automatic sample PI or charge/);
  assert.doesNotMatch(html, /NOSSA|HIP & FLO|AMIGA|71%|89%/i);
});
test('brief adapter preserves base message and does not leak fields to query strings or storage', () => {
  let listener; const button = { disabled: true };
  const form = { dataset: { inquiryInitialized: 'true' }, addEventListener: (name, fn) => { assert.equal(name, 'formdata'); listener = fn; }, querySelector: () => button };
  vm.runInNewContext(script, { document: { querySelector: () => form } });
  const data = new FormData();
  data.set('brief_path', 'Concept development'); data.set('brief_positioning', 'Premium court carry');
  data.set('brief_design', 'No design files yet'); data.set('brief_launch', '2027-03-01');
  data.set('message', 'Keep original details'); data.set('submission_id', 'stable-id');
  data.set('target_price', 'USD 25'); data.set('quantity', '300');
  listener({ formData: data });
  assert.match(data.get('message'), /Concept development/); assert.match(data.get('message'), /No design files yet/);
  assert.match(data.get('message'), /Keep original details/); assert.equal(data.get('submission_id'), 'stable-id');
  assert.equal(data.get('target_price'), 'USD 25'); assert.equal(data.get('quantity'), '300');
  assert.equal(data.has('brief_positioning'), false); assert.equal(button.disabled, false);
  assert.doesNotMatch(script, /fetch\(|localStorage|sessionStorage|location/);
});
test('three solution anchors reuse the existing owner, and RFQ remains optional-file', () => {
  for (const id of ['racket-sports','brand-development','clubs-events']) assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /name="attachment" type="file" accept=/);
  assert.doesNotMatch(html, /name="attachment"[^>]*required/);
  assert.match(html, /data-clarity-mask="true"/);
});

test('homepage exposes a Padel category entry before existing hero without product reordering', () => {
  const home = fs.readFileSync('app/page.js', 'utf8');
  assert.match(home, /aria-label="Featured category"/);
  assert.ok(home.indexOf('href="/racket-sports/padel-bags"') < home.indexOf('<StaticSitePage params='));
});
