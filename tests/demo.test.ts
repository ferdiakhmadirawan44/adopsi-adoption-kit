// Tests for the ADOPSI interactive demo (demo/entry.ts) — the same
// engine the seven outputs use, driven by in-memory controls.
// Run with: npm test  (tsx --test tests/scoring.test.ts tests/second-audit.test.ts tests/demo.test.ts)
import test from "node:test";
import assert from "node:assert/strict";
import {
  AUDITS,
  computeDemo,
  mappableRows,
  seedState,
} from "../demo/entry.ts";
import { defaultData } from "../src/data.ts";
import { secondAuditData } from "../src/second-audit.ts";

test("Ledger preset reproduces the real audit: 30 / Memulai / 84,0% / 4 findings", () => {
  const r = computeDemo(AUDITS.ledger, seedState("ledger"));
  assert.equal(r.score, 30);
  assert.equal(r.level.id, "Memulai");
  assert.equal(r.coverage.pct, 84);
  assert.equal(r.coverage.mapped, 21);
  assert.equal(r.findings.length, 4);
  assert.deepEqual(r.trajectory, [30, 55, 70, 85, 100]);
  assert.equal(r.totalEffort, 29);
  assert.equal(r.migrationEffort, 18);
});

test("Ledger + tests on: 45, 3 findings, flat step at phase 3 (already fixed)", () => {
  const state = seedState("ledger");
  state.checks.tests = true;
  const r = computeDemo(AUDITS.ledger, state);
  assert.equal(r.score, 45);
  assert.equal(r.findings.length, 3);
  assert.deepEqual(
    r.findings.map((f) => f.checkId),
    ["multi-root", "client-previews", "live-preview"],
  );
  // Phase 3 fixes tests — already passing, so the trajectory does not
  // climb there. A flat step is the honest output, not a bug.
  assert.deepEqual(r.trajectory, [45, 70, 85, 85, 100]);
});

test("Ledger + all four roots on: 55 / Berkembang, multi-root passes", () => {
  const state = seedState("ledger");
  state.roots = { email: true, page: true, document: true, canvas: true };
  const r = computeDemo(AUDITS.ledger, state);
  assert.equal(r.score, 55);
  assert.equal(r.level.id, "Berkembang");
  assert.equal(r.checks.find((c) => c.id === "multi-root")?.passed, true);
  assert.equal(r.findings.length, 3);
  assert.equal(r.numbers.missingRoots, 0);
  // Phase 1 has nothing left to fix, so its effort is 0 hours.
  assert.equal(r.phaseEfforts[0], 0);
});

test("every check on: 100 / Production Ready, no findings", () => {
  const state = seedState("ledger");
  state.roots = { email: true, page: true, document: true, canvas: true };
  state.checks = {
    defineTheme: true,
    validateGate: true,
    clientPreviews: true,
    tests: true,
    livePreview: true,
  };
  const r = computeDemo(AUDITS.ledger, state);
  assert.equal(r.score, 100);
  assert.equal(r.level.id, "Production Ready");
  assert.equal(r.findings.length, 0);
  assert.deepEqual(r.trajectory, [100, 100, 100, 100, 100]);
});

test("TAGIHAN preset reproduces the second audit: 40 / Berkembang / 24 h", () => {
  const r = computeDemo(AUDITS.tagihan, seedState("tagihan"));
  assert.equal(r.score, 40);
  assert.equal(r.level.id, "Berkembang");
  assert.equal(r.coverage.pct, 84);
  assert.equal(r.findings.length, 4);
  assert.deepEqual(r.trajectory, [40, 55, 70, 85, 100]);
  assert.deepEqual(r.phaseEfforts, [4, 7, 9, 4]);
  assert.equal(r.totalEffort, 24);
});

test("mapping all four unmapped rows: coverage 100%, migration effort 12,5 h", () => {
  const state = seedState("tagihan");
  state.mappingDone = [true, true, true, true];
  const r = computeDemo(AUDITS.tagihan, state);
  assert.equal(r.coverage.mapped, 25);
  assert.equal(r.coverage.partial, 0);
  assert.equal(r.coverage.manual, 0);
  assert.equal(r.coverage.pct, 100);
  assert.equal(r.migrationEffort, 12.5);
});

test("mapping one row: coverage 88%, effort 17 h", () => {
  const state = seedState("ledger");
  state.mappingDone = [true, false, false, false];
  const r = computeDemo(AUDITS.ledger, state);
  assert.equal(r.coverage.mapped, 22);
  assert.equal(r.coverage.pct, 88);
  // 22 mapped x 0,5 + 2 partial x 1,5 + 1 manual x 3 = 11 + 3 + 3 = 17
  assert.equal(r.migrationEffort, 17);
});

test("mappable rows are the 3 partial + 1 manual rows, in mapping order", () => {
  assert.deepEqual(mappableRows(defaultData), [11, 12, 23, 24]);
  assert.deepEqual(mappableRows(secondAuditData), [11, 12, 23, 24]);
  assert.equal(defaultData.mapping[11].source, "mj-carousel");
  assert.equal(defaultData.mapping[24].source, "HTML kustom / mj-raw");
});

test("seedState round-trips both audits", () => {
  const ledger = seedState("ledger");
  assert.deepEqual(ledger.roots, { email: true, page: false, document: false, canvas: false });
  assert.equal(ledger.checks.defineTheme, true);
  assert.equal(ledger.checks.validateGate, true);
  assert.equal(ledger.checks.tests, false);
  const tagihan = seedState("tagihan");
  assert.deepEqual(tagihan.roots, { email: true, page: true, document: true, canvas: true });
  assert.equal(tagihan.checks.validateGate, false);
  assert.equal(tagihan.checks.defineTheme, true);
});
