// Unit tests for the ADOPSI computed functions (src/scoring.ts) and the
// audit record (src/data.ts). Run with: npm test  (tsx --test tests/)
// These tests ARE the "tests" check the kit audits for — they prove the
// score, the level, the coverage and the effort hours are arithmetic,
// not typed-in numbers.
import test from "node:test";
import assert from "node:assert/strict";
import {
  computeScore,
  failingChecks,
  findingsFor,
  levelFor,
  migrationCoverage,
  migrationEffortHours,
  phaseEffortHours,
  scoreAfterPhase,
  totalEffortHours,
  type Check,
} from "../src/scoring.js";
import {
  auditCoverage,
  auditFindings,
  auditLevel,
  auditMigrationEffort,
  auditPhaseEffort,
  auditScore,
  auditScoreAfterPhase,
  auditTotalEffort,
  defaultData,
  validateData,
} from "../src/data.js";

const mkCheck = (id: string, weight: number, passed: boolean): Check => ({
  id,
  labelId: id,
  labelEn: id,
  weight,
  passed,
  evidenceId: "bukti",
  evidenceEn: "evidence",
});

test("score is the sum of passing weights", () => {
  assert.equal(computeScore([mkCheck("a", 25, true), mkCheck("b", 15, false)]), 25);
  assert.equal(computeScore([]), 0);
  assert.equal(computeScore([mkCheck("a", 25, true), mkCheck("b", 15, true)]), 40);
});

test("the real Ledger audit scores 30", () => {
  assert.equal(auditScore(defaultData), 30);
});

test("level bands", () => {
  assert.equal(levelFor(0).id, "Memulai");
  assert.equal(levelFor(30).id, "Memulai");
  assert.equal(levelFor(39).id, "Memulai");
  assert.equal(levelFor(40).id, "Berkembang");
  assert.equal(levelFor(69).id, "Berkembang");
  assert.equal(levelFor(70).id, "Siap Produksi");
  assert.equal(levelFor(89).id, "Siap Produksi");
  assert.equal(levelFor(90).id, "Production Ready");
  assert.equal(levelFor(100).id, "Production Ready");
  assert.equal(levelFor(100).en, "Production Ready");
  assert.throws(() => levelFor(101), /No readiness level/);
});

test("the real Ledger audit level is Memulai / Getting Started", () => {
  const level = auditLevel(defaultData);
  assert.equal(level.id, "Memulai");
  assert.equal(level.en, "Getting Started");
});

test("failing checks are the four gaps", () => {
  const failed = failingChecks(defaultData.checks).map((c) => c.id);
  assert.deepEqual(failed, ["multi-root", "client-previews", "tests", "live-preview"]);
});

test("findings: one per failed check, heaviest first, with phase", () => {
  const findings = auditFindings(defaultData);
  assert.equal(findings.length, 4);
  assert.equal(findings[0].checkId, "multi-root");
  assert.equal(findings[0].weight, 25);
  assert.equal(findings[0].phase, 1);
  assert.deepEqual(
    findings.map((f) => f.phase),
    [1, 2, 3, 4],
  );
  assert.ok(findings.every((f) => f.actionId.length > 0 && f.actionEn.length > 0));
});

test("findingsFor throws when an action is missing", () => {
  assert.throws(() => findingsFor([mkCheck("x", 10, false)], {}), /No finding action/);
});

test("migration coverage: 21 mapped of 25 rows = 84.0%", () => {
  const cov = auditCoverage(defaultData);
  assert.equal(cov.mapped, 21);
  assert.equal(cov.partial, 3);
  assert.equal(cov.manual, 1);
  assert.equal(cov.total, 25);
  assert.equal(cov.pct, 84);
});

test("migration coverage on a toy table", () => {
  const cov = migrationCoverage([
    { source: "a", sourceKind: "MJML", target: "b", status: "mapped", noteId: "", noteEn: "" },
    { source: "c", sourceKind: "MJML", target: "d", status: "manual", noteId: "", noteEn: "" },
  ]);
  assert.equal(cov.pct, 50);
  assert.equal(migrationEffortHours(defaultData.mapping), 18);
});

test("phase effort is computed from the audit numbers", () => {
  // Fase 1: 3 missing roots x 4 jam = 12
  assert.equal(auditPhaseEffort(defaultData, 1), 12);
  // Fase 2: 1 email root x 7 klien x 0,5 jam = 3,5 -> 4
  assert.equal(auditPhaseEffort(defaultData, 2), 4);
  // Fase 3: 6 fungsi hitung x 1,5 jam = 9
  assert.equal(auditPhaseEffort(defaultData, 3), 9);
  // Fase 4: 7 output x 0,5 jam = 3,5 -> 4
  assert.equal(auditPhaseEffort(defaultData, 4), 4);
  // Total 29 jam
  assert.equal(auditTotalEffort(defaultData), 29);
});

test("phaseEffortHours honours roundUp=false", () => {
  const nums = { missingRoots: 3, emailRoots: 1, clients: 7, computedFunctions: 6, outputs: 7 };
  assert.equal(phaseEffortHours({ basis: "emailClients", perUnit: 0.5, roundUp: false }, nums), 3.5);
  assert.equal(phaseEffortHours({ basis: "emailClients", perUnit: 0.5 }, nums), 4);
});

test("score climbs 30 -> 55 -> 70 -> 85 -> 100 across the four phases", () => {
  assert.equal(auditScoreAfterPhase(defaultData, 0), 30);
  assert.equal(auditScoreAfterPhase(defaultData, 1), 55);
  assert.equal(auditScoreAfterPhase(defaultData, 2), 70);
  assert.equal(auditScoreAfterPhase(defaultData, 3), 85);
  assert.equal(auditScoreAfterPhase(defaultData, 4), 100);
  assert.equal(scoreAfterPhase(defaultData.checks, defaultData.phases, 4), 100);
});

test("audit record validates", () => {
  assert.doesNotThrow(() => validateData(defaultData));
  const broken = { ...defaultData, checks: defaultData.checks.slice(0, 5) };
  assert.throws(() => validateData(broken as never), /expected 6 checks/);
});
