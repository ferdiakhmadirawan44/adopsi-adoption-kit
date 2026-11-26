// Tests for the ADOPSI second audit (src/second-audit.ts) — the same
// engine, a second real template (TAGIHAN) — and for the missingRoots
// fix it exposed. Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { failingChecks } from "../src/scoring.js";
import {
  auditCoverage,
  auditFindings,
  auditLevel,
  auditMigrationEffort,
  auditNumbers,
  auditPhaseEffort,
  auditScore,
  auditScoreAfterPhase,
  auditTotalEffort,
  defaultData,
  validateData,
} from "../src/data.js";
import { secondAuditData } from "../src/second-audit.js";

test("the second audit record validates", () => {
  assert.doesNotThrow(() => validateData(secondAuditData));
});

test("the TAGIHAN audit scores 40", () => {
  assert.equal(auditScore(secondAuditData), 40);
});

test("the TAGIHAN audit level is Berkembang / Growing", () => {
  const level = auditLevel(secondAuditData);
  assert.equal(level.id, "Berkembang");
  assert.equal(level.en, "Growing");
});

test("failing checks are the four gaps (multi-root passes here)", () => {
  const failed = failingChecks(secondAuditData.checks).map((c) => c.id);
  assert.deepEqual(failed, ["validate-gate", "client-previews", "tests", "live-preview"]);
  assert.equal(secondAuditData.checks.find((c) => c.id === "multi-root")?.passed, true);
  assert.equal(secondAuditData.checks.find((c) => c.id === "defineTheme")?.passed, true);
});

test("findings: one per failed check, phases 1-4", () => {
  const findings = auditFindings(secondAuditData);
  assert.equal(findings.length, 4);
  assert.equal(findings[0].checkId, "validate-gate");
  assert.deepEqual(
    findings.map((f) => f.phase),
    [1, 2, 3, 4],
  );
});

test("second audit shares the mapping table: coverage 84,0%, effort 18 h", () => {
  const cov = auditCoverage(secondAuditData);
  assert.equal(cov.mapped, 21);
  assert.equal(cov.partial, 3);
  assert.equal(cov.manual, 1);
  assert.equal(cov.total, 25);
  assert.equal(cov.pct, 84);
  assert.equal(auditMigrationEffort(secondAuditData), 18);
});

test("phase effort is computed from the second audit's numbers", () => {
  // Fase 1: 7 output x 0,5 jam = 3,5 -> 4
  assert.equal(auditPhaseEffort(secondAuditData, 1), 4);
  // Fase 2: 2 email root x 7 klien x 0,5 jam = 7
  assert.equal(auditPhaseEffort(secondAuditData, 2), 7);
  // Fase 3: 6 fungsi hitung x 1,5 jam = 9
  assert.equal(auditPhaseEffort(secondAuditData, 3), 9);
  // Fase 4: 7 output x 0,5 jam = 3,5 -> 4
  assert.equal(auditPhaseEffort(secondAuditData, 4), 4);
  // Total 24 jam
  assert.equal(auditTotalEffort(secondAuditData), 24);
});

test("score climbs 40 -> 55 -> 70 -> 85 -> 100 across the four phases", () => {
  assert.equal(auditScoreAfterPhase(secondAuditData, 0), 40);
  assert.equal(auditScoreAfterPhase(secondAuditData, 1), 55);
  assert.equal(auditScoreAfterPhase(secondAuditData, 2), 70);
  assert.equal(auditScoreAfterPhase(secondAuditData, 3), 85);
  assert.equal(auditScoreAfterPhase(secondAuditData, 4), 100);
});

test("missingRoots counts missing root KINDS, not 4 minus the root count", () => {
  // TAGIHAN holds two Email roots plus one of each other kind: 5 roots,
  // 0 kinds missing. The old formula (4 - 5) gave -1.
  const tagihan = auditNumbers(secondAuditData);
  assert.equal(tagihan.missingRoots, 0);
  assert.equal(tagihan.emailRoots, 2);
  // A template with two Email roots and nothing else still misses 3 kinds.
  const twoEmailOnly = auditNumbers({
    ...defaultData,
    measured: {
      ...defaultData.measured,
      roots: { email: 2, page: 0, document: 0, canvas: 0 },
    },
  });
  assert.equal(twoEmailOnly.missingRoots, 3);
  // The Ledger is unchanged by the fix.
  assert.equal(auditNumbers(defaultData).missingRoots, 3);
  assert.equal(auditScore(defaultData), 30);
});
