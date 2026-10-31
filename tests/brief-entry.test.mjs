import test from 'node:test';
import assert from 'node:assert/strict';
import { briefEntryUrl, readBriefEntry, applyBriefEntry, pdb001Colours } from '../lib/brief-entry.mjs';

test('all six gallery choices arrive as explicitly unapproved colour references', () => {
  for (const [colour, label] of pdb001Colours) {
    const url = new URL(briefEntryUrl({ model: 'pdb001', colour }), 'https://example.invalid');
    assert.equal(url.pathname, '/oem-odm-bag-manufacturer');
    assert.equal(url.hash, '#project-brief');
    const received = readBriefEntry(url.search);
    assert.equal(received.product_needed, 'Padel Bags');
    assert.match(received.brief_product, /PDB001/);
    assert.ok(received.brief_colour.startsWith(label));
    assert.match(received.brief_colour, /digital reference; swatch and sample approval required/);
  }
});

test('four business entries route to the existing RFQ paths', () => {
  const expected = ['Concept development', 'Tech Pack', 'Clubs / events procurement', 'Existing-customer reorder'];
  ['concept', 'tech-pack', 'clubs', 'reorder'].forEach((path, index) => {
    const url = new URL(briefEntryUrl({ path }), 'https://example.invalid');
    assert.equal(readBriefEntry(url.search).brief_path, expected[index]);
  });
});

test('untrusted query values cannot invent a product, colour or RFQ route', () => {
  assert.deepEqual(readBriefEntry('?rfq=unknown&model=anything&colour=%3Cscript%3E&email=buyer@example.invalid'), {
    brief_path: '', product_needed: '', brief_product: '', brief_colour: '',
  });
  assert.equal(readBriefEntry('?colour=charcoal-grey').brief_colour, '');
  assert.equal(readBriefEntry('?model=pdb001&colour=unknown').brief_colour, '');
  assert.doesNotMatch(briefEntryUrl({ model: 'other', colour: 'secret', email: 'buyer@example.invalid' }), /secret|email|buyer/);
});

test('prefill survives re-initialization without resetting buyer edits or contacts', () => {
  const fields = Object.fromEntries(['brief_path', 'product_needed', 'brief_product', 'brief_colour', 'name', 'message'].map(name => [name, {
    value: name === 'name' ? 'QA buyer' : name === 'message' ? 'Keep my dimensions' : '',
    tagName: ['brief_path', 'product_needed'].includes(name) ? 'SELECT' : 'INPUT',
    dispatchEvent() {},
  }]));
  const form = { dataset: {}, querySelector: selector => fields[selector.match(/name="([^"]+)/)[1]] };
  applyBriefEntry(form, 'model=pdb001&colour=sage-green-cream&rfq=clubs');
  assert.equal(fields.brief_path.value, 'Clubs / events procurement');
  fields.brief_colour.value = 'Buyer edited colour';
  fields.brief_path.value = 'Tech Pack';
  applyBriefEntry(form, 'model=pdb001&colour=sage-green-cream&rfq=clubs');
  assert.equal(fields.brief_path.value, 'Tech Pack');
  assert.equal(fields.brief_colour.value, 'Buyer edited colour');
  assert.equal(fields.name.value, 'QA buyer');
  assert.equal(fields.message.value, 'Keep my dimensions');
});
