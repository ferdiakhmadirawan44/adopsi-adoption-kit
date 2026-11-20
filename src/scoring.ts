// ---------------------------------------------------------------------------
// ADOPSI — pure computed functions.
//
// EVERY number on every output comes from these functions applied to the
// audit file (src/data.ts). No template types a score, a level, a
// percentage or an effort hour by hand — if the audit changes, every
// output changes with it. These functions are unit-tested in
// tests/scoring.test.ts.
// ---------------------------------------------------------------------------

export interface Check {
  id: string;
  labelId: string;
  labelEn: string;
  /** Weight of this check in the 0-100 readiness score. */
  weight: number;
  passed: boolean;
  evidenceId: string;
  evidenceEn: string;
}

/** Readiness level derived from the score — the bands are fixed here. */
export interface Level {
  id: string;
  en: string;
  min: number;
  max: number;
}

export const LEVELS: Level[] = [
  { id: "Memulai", en: "Getting Started", min: 0, max: 39 },
  { id: "Berkembang", en: "Growing", min: 40, max: 69 },
  { id: "Siap Produksi", en: "Ready for Production", min: 70, max: 89 },
  { id: "Production Ready", en: "Production Ready", min: 90, max: 100 },
];

export function levelFor(score: number): Level {
  const l = LEVELS.find((x) => score >= x.min && score <= x.max);
  if (!l) throw new Error(`No readiness level for score ${score}`);
  return l;
}

/** Readiness score (0-100) = sum of the weights of the checks that pass. */
export function computeScore(checks: Check[]): number {
  return checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
}

export function passingChecks(checks: Check[]): Check[] {
  return checks.filter((c) => c.passed);
}

export function failingChecks(checks: Check[]): Check[] {
  return checks.filter((c) => !c.passed);
}

export interface Finding {
  n: number;
  checkId: string;
  titleId: string;
  titleEn: string;
  actionId: string;
  actionEn: string;
  /** Which roadmap phase fixes this finding (1-4). */
  phase: number;
  weight: number;
}

/** One finding per failed check, ordered by weight (heaviest first). */
export function findingsFor(
  checks: Check[],
  actions: Record<string, { actionId: string; actionEn: string; phase: number }>,
): Finding[] {
  return failingChecks(checks)
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .map((c, i) => {
      const a = actions[c.id];
      if (!a) throw new Error(`No finding action defined for failed check ${c.id}`);
      return {
        n: i + 1,
        checkId: c.id,
        titleId: c.labelId,
        titleEn: c.labelEn,
        actionId: a.actionId,
        actionEn: a.actionEn,
        phase: a.phase,
        weight: c.weight,
      };
    });
}

export type MapStatus = "mapped" | "partial" | "manual";

export interface MapRow {
  source: string;
  sourceKind: "MJML" | "React Email";
  target: string;
  status: MapStatus;
  noteId: string;
  noteEn: string;
}

/** Migration coverage = mapped rows / total rows (as a percentage). */
export function migrationCoverage(rows: MapRow[]): {
  mapped: number;
  partial: number;
  manual: number;
  total: number;
  pct: number;
} {
  const mapped = rows.filter((r) => r.status === "mapped").length;
  const partial = rows.filter((r) => r.status === "partial").length;
  const manual = rows.filter((r) => r.status === "manual").length;
  const total = rows.length;
  const pct = total === 0 ? 0 : Math.round((mapped / total) * 1000) / 10;
  return { mapped, partial, manual, total, pct };
}

/** Hours to migrate one mapping row, by status — the documented factors. */
export const EFFORT_FACTORS: Record<MapStatus, number> = {
  mapped: 0.5,
  partial: 1.5,
  manual: 3,
};

/** Total migration effort (hours) from the mapping table and the factors. */
export function migrationEffortHours(rows: MapRow[]): number {
  const total = rows.reduce((sum, r) => sum + EFFORT_FACTORS[r.status], 0);
  return Math.round(total * 10) / 10;
}

export type EffortBasis = "missingRoots" | "emailClients" | "computedFunctions" | "outputs";

export interface PhaseEffortInput {
  basis: EffortBasis;
  /** Hours per unit of the basis. */
  perUnit: number;
  /** Round the result up to whole hours (default true). */
  roundUp?: boolean;
}

export interface AuditNumbers {
  missingRoots: number;
  emailRoots: number;
  clients: number;
  computedFunctions: number;
  outputs: number;
}

/** Effort (hours) for one roadmap phase, computed from the audit numbers. */
export function phaseEffortHours(input: PhaseEffortInput, nums: AuditNumbers): number {
  const units =
    input.basis === "missingRoots"
      ? nums.missingRoots
      : input.basis === "emailClients"
        ? nums.emailRoots * nums.clients
        : input.basis === "computedFunctions"
          ? nums.computedFunctions
          : nums.outputs;
  const hours = units * input.perUnit;
  return input.roundUp === false ? Math.round(hours * 10) / 10 : Math.ceil(hours);
}

export interface Phase {
  n: number;
  weekId: string;
  weekEn: string;
  titleId: string;
  titleEn: string;
  /** The check this phase fixes (null = no check, e.g. a closing phase). */
  checkId: string | null;
  effort: PhaseEffortInput;
  noteId: string;
  noteEn: string;
}

export function totalEffortHours(phases: Phase[], nums: AuditNumbers): number {
  return phases.reduce((sum, p) => sum + phaseEffortHours(p.effort, nums), 0);
}

/** Score after phase n = base score + weights of the checks fixed by
 *  phases 1..n. The last phase must land exactly on 100. */
export function scoreAfterPhase(checks: Check[], phases: Phase[], n: number): number {
  const base = computeScore(checks);
  let gained = 0;
  for (const p of phases) {
    if (p.n > n) break;
    if (!p.checkId) continue;
    const c = checks.find((x) => x.id === p.checkId);
    if (!c) throw new Error(`Phase ${p.n} fixes unknown check ${p.checkId}`);
    if (!c.passed) gained += c.weight;
  }
  return base + gained;
}
