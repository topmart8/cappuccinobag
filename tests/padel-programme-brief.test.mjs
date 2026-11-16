import test from "node:test";
import assert from "node:assert/strict";
import { initialProgrammeRows, buildProgrammeBrief } from "../lib/padel-programme-brief.mjs";

test("per-style MOQ cannot be met by combining two insufficient quantities", () => {
  const rows = initialProgrammeRows("member").map(p => ({ ...p, quantity: "150" }));
  assert.equal(buildProgrammeBrief("member", rows).valid, false);
});

test("blank, fractional and negative quantities do not become valid quotes", () => {
  for (const quantity of ["", "300.5", "-300", "abc", "1e3"]) {
    const rows = initialProgrammeRows("member");
    rows[0].quantity = quantity;
    assert.equal(buildProgrammeBrief("member", rows).valid, false);
  }
});

test("programme enquiry preserves uneven quantities and excludes unselected items", () => {
  const rows = initialProgrammeRows("event");
  rows.find(p => p.sku === "S004").quantity = "600";
  const result = buildProgrammeBrief("event", rows);
  assert.equal(result.valid, true);
  assert.equal(result.totalPieces, 900);
  const url = new URL(result.href, "https://www.cappuccinobag.com");
  assert.equal(url.pathname, "/inquiry");
  assert.equal(url.searchParams.get("product"), "Padel Bags");
  assert.match(url.searchParams.get("format"), /S004 Court essentials pouch: 600 pieces/);
  assert.match(url.searchParams.get("format"), /S003 Separate shoe bag: 300 pieces/);
  assert.doesNotMatch(url.searchParams.get("format"), /S005|PDB016/);
});

test("an empty selection does not produce an enquiry URL", () => {
  const result = buildProgrammeBrief("club", initialProgrammeRows("club").map(p => ({ ...p, selected: false })));
  assert.equal(result.valid, false);
  assert.equal(result.href, undefined);
});
