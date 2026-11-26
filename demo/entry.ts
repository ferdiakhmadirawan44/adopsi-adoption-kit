// ---------------------------------------------------------------------------
// ADOPSI — interactive readiness calculator (demo/entry.ts)
//
// The demo is the kit's engine running live in the browser: the viewer
// changes the audit inputs and every number on the page — score, level,
// findings, trajectory, phase effort, coverage, migration effort — is
// recomputed by the SAME functions in src/scoring.ts that the seven
// outputs use. Nothing on the page is a typed-in number.
//
// What the viewer changes (all real engine inputs):
//   - The four root kinds (Email / Page / Document / Canvas present?)
//     -> the multi-root check passes only when all four are present, and
//     the missing-roots count feeds the phase-1 effort.
//   - The five other checks (defineTheme, validate gate, email-client
//     proof, tests, live preview) -> the score, the level, the findings
//     and the trajectory.
//   - The four mapping rows that are not yet mapped (3 partial + 1
//     manual) -> flipping one to "mapped" recomputes the coverage % and
//     the migration effort from the same mapping table.
//
// The demo's variants exist only in memory in the browser. The seven
// outputs still render from src/data.ts (defaultData) — there is no
// second on-disk data file (AGENTS.md invariant 2).
//
// Two presets seed the controls from the two real audits: The Ledger
// (score 30) and TAGIHAN (score 40). Importing this module in node does
// NOT touch the DOM — the browser wiring runs only when `document`
// exists — so the pure functions below are unit-tested in tests/.
// ---------------------------------------------------------------------------

import {
  computeScore,
  findingsFor,
  levelFor,
  migrationCoverage,
  migrationEffortHours,
  phaseEffortHours,
  scoreAfterPhase,
  totalEffortHours,
  type AuditNumbers,
  type Check,
  type Finding,
  type MapRow,
} from "../src/scoring.js";
import {
  auditNumbers,
  defaultData,
  type AuditData,
} from "../src/data.js";
import { secondAuditData } from "../src/second-audit.js";

export type AuditChoice = "ledger" | "tagihan";

/** The two real audits the demo can start from. */
export const AUDITS: Record<AuditChoice, AuditData> = {
  ledger: defaultData,
  tagihan: secondAuditData,
};

export interface DemoRoots {
  email: boolean;
  page: boolean;
  document: boolean;
  canvas: boolean;
}

export interface DemoChecks {
  defineTheme: boolean;
  validateGate: boolean;
  clientPreviews: boolean;
  tests: boolean;
  livePreview: boolean;
}

/** Everything the viewer can change — all in-memory, never saved. */
export interface DemoState {
  auditId: AuditChoice;
  roots: DemoRoots;
  checks: DemoChecks;
  /** One flag per mappable row (partial/manual), in mapping order. */
  mappingDone: boolean[];
}

/** Indices of the mapping rows that are not yet mapped. */
export function mappableRows(audit: AuditData): number[] {
  return audit.mapping
    .map((r, i) => (r.status === "mapped" ? -1 : i))
    .filter((i) => i >= 0);
}

/** Seed the controls from a real audit record — the preset IS the audit. */
export function seedState(auditId: AuditChoice): DemoState {
  const audit = AUDITS[auditId];
  const byId: Record<string, boolean> = Object.fromEntries(
    audit.checks.map((c) => [c.id, c.passed]),
  );
  return {
    auditId,
    roots: {
      email: audit.measured.roots.email > 0,
      page: audit.measured.roots.page > 0,
      document: audit.measured.roots.document > 0,
      canvas: audit.measured.roots.canvas > 0,
    },
    checks: {
      defineTheme: byId["defineTheme"] ?? false,
      validateGate: byId["validate-gate"] ?? false,
      clientPreviews: byId["client-previews"] ?? false,
      tests: byId["tests"] ?? false,
      livePreview: byId["live-preview"] ?? false,
    },
    mappingDone: mappableRows(audit).map(() => false),
  };
}

export interface DemoResult {
  audit: AuditData;
  checks: Check[];
  score: number;
  level: { id: string; en: string };
  findings: Finding[];
  trajectory: number[];
  phaseEfforts: number[];
  totalEffort: number;
  coverage: { mapped: number; partial: number; manual: number; total: number; pct: number };
  migrationEffort: number;
  rows: MapRow[];
  numbers: AuditNumbers;
}

/**
 * Recompute everything from the current controls, using only the kit's
 * own functions. No number in the result is typed by hand.
 */
export function computeDemo(audit: AuditData, state: DemoState): DemoResult {
  const allRoots =
    state.roots.email && state.roots.page && state.roots.document && state.roots.canvas;
  const passById: Record<string, boolean> = {
    "multi-root": allRoots,
    defineTheme: state.checks.defineTheme,
    "validate-gate": state.checks.validateGate,
    "client-previews": state.checks.clientPreviews,
    tests: state.checks.tests,
    "live-preview": state.checks.livePreview,
  };
  const checks: Check[] = audit.checks.map((c) => ({
    ...c,
    passed: passById[c.id] ?? c.passed,
  }));
  const score = computeScore(checks);
  const level = levelFor(score);
  const findings = findingsFor(checks, audit.findingActions);
  const mappable = mappableRows(audit);
  const rows: MapRow[] = audit.mapping.map((r, i) => {
    const k = mappable.indexOf(i);
    return k >= 0 && state.mappingDone[k] ? { ...r, status: "mapped" } : r;
  });
  const coverage = migrationCoverage(rows);
  const migrationEffort = migrationEffortHours(rows);
  // A root toggle means "this kind is present". Turning one on restores
  // the audit's own count for that kind (TAGIHAN holds two Email roots),
  // or adds one root of the kind when the audit has none (the Ledger has
  // no Page root — flipping Page on adds one). Turning it off removes
  // all roots of that kind.
  const roots = {
    email: state.roots.email ? Math.max(1, audit.measured.roots.email) : 0,
    page: state.roots.page ? Math.max(1, audit.measured.roots.page) : 0,
    document: state.roots.document ? Math.max(1, audit.measured.roots.document) : 0,
    canvas: state.roots.canvas ? Math.max(1, audit.measured.roots.canvas) : 0,
  };
  const numbers = auditNumbers({
    ...audit,
    measured: { ...audit.measured, roots },
  });
  const trajectory = [0, 1, 2, 3, 4].map((n) => scoreAfterPhase(checks, audit.phases, n));
  const phaseEfforts = audit.phases.map((p) => phaseEffortHours(p.effort, numbers));
  const totalEffort = totalEffortHours(audit.phases, numbers);
  return {
    audit,
    checks,
    score,
    level,
    findings,
    trajectory,
    phaseEfforts,
    totalEffort,
    coverage,
    migrationEffort,
    rows,
    numbers,
  };
}

// ---------------------------------------------------------------------------
// Browser wiring — runs only when `document` exists (never in node/tests).
// ---------------------------------------------------------------------------

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`demo: missing element #${id}`);
  return node as T;
}

function pct1(n: number): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function render(state: DemoState, phaseStep: number): void {
  const audit = AUDITS[state.auditId];
  const r = computeDemo(audit, state);

  el("demo-project").textContent = `${audit.audit.project} · ${audit.audit.id}`;
  el("demo-date").textContent = `${audit.audit.dateLabelId} · ${audit.audit.dateLabelEn}`;
  const multi = r.checks.find((c) => c.id === "multi-root");
  el("multiroot-status").textContent =
    multi && multi.passed
      ? "Multi-root: ✓ Lolos / Passing — keempat root ada / all four roots present (25 poin / points)"
      : "Multi-root: ✗ Belum / Not yet — butuh keempat root / needs all four roots (25 poin / points)";
  el("score-value").textContent = `${r.score}`;
  el("score-level").textContent = `${r.level.id} / ${r.level.en}`;
  el("score-note").textContent =
    r.findings.length === 0
      ? "Semua check lolos — tidak ada temuan. / Every check passes — no findings."
      : `${r.findings.length} temuan / findings — ${r.checks.filter((c) => c.passed).length} dari / of ${r.checks.length} check lolos / passing.`;
  el("coverage-value").textContent = `${pct1(r.coverage.pct)}%`;
  el("coverage-detail").textContent =
    `${r.coverage.mapped} mapped · ${r.coverage.partial} partial · ${r.coverage.manual} manual — ${r.coverage.total} baris / rows`;
  el("migration-effort").textContent = `${r.migrationEffort} jam / hours`;
  el("total-effort").textContent = `${r.totalEffort} jam / hours`;

  // Findings — one per failed check, heaviest first (from the engine).
  const fl = el("findings-list");
  fl.innerHTML = "";
  if (r.findings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Tidak ada temuan — semua check lolos. / No findings — every check passes.";
    fl.appendChild(li);
  } else {
    for (const f of r.findings) {
      const li = document.createElement("li");
      const b = document.createElement("b");
      b.textContent = `${f.n}. ${f.titleId} / ${f.titleEn} — Fase / Phase ${f.phase}`;
      li.appendChild(b);
      li.appendChild(document.createElement("br"));
      li.appendChild(
        document.createTextNode(`${f.actionId} / ${f.actionEn}`),
      );
      fl.appendChild(li);
    }
  }

  // Trajectory — the score after each phase, computed live.
  const tr = el("trajectory");
  tr.innerHTML = "";
  r.trajectory.forEach((s, n) => {
    const chip = document.createElement("div");
    chip.className = "traj-chip" + (n === phaseStep ? " active" : "");
    const label = document.createElement("div");
    label.className = "traj-label";
    label.textContent = n === 0 ? "Awal / Start" : `Fase / Phase ${n}`;
    const val = document.createElement("div");
    val.className = "traj-value";
    val.textContent = `${s}`;
    const bar = document.createElement("div");
    bar.className = "traj-bar";
    bar.style.width = `${s}%`;
    chip.appendChild(label);
    chip.appendChild(val);
    chip.appendChild(bar);
    tr.appendChild(chip);
  });

  // Phases — effort and score-after, both computed.
  const pb = el("phases-body");
  pb.innerHTML = "";
  audit.phases.forEach((p, i) => {
    const check = r.checks.find((c) => c.id === p.checkId);
    const done = check ? check.passed : false;
    const row = document.createElement("tr");
    const cells = [
      `${p.n}`,
      `${p.weekId}`,
      `${p.titleId} / ${p.titleEn}${done ? " ✓ selesai / done" : ""}`,
      `${r.phaseEfforts[i]} jam / h`,
      `${r.trajectory[p.n]}`,
    ];
    for (const text of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    }
    pb.appendChild(row);
  });

  el("phase-slider-label").textContent =
    `Lihat skor setelah fase ${phaseStep} / See the score after phase ${phaseStep}: ${r.trajectory[phaseStep]}`;
}

function buildMappingToggles(state: DemoState, onChange: () => void): void {
  const audit = AUDITS[state.auditId];
  const box = el("mapping-toggles");
  box.innerHTML = "";
  mappableRows(audit).forEach((rowIndex, k) => {
    const row = audit.mapping[rowIndex];
    const label = document.createElement("label");
    label.className = "toggle-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.mappingDone[k] ?? false;
    input.addEventListener("change", () => {
      state.mappingDone[k] = input.checked;
      onChange();
    });
    const span = document.createElement("span");
    span.textContent = `${row.source} → ${row.target} — ${row.noteId} / ${row.noteEn} (${row.status})`;
    label.appendChild(input);
    label.appendChild(span);
    box.appendChild(label);
  });
}

function syncControls(state: DemoState): void {
  (el("root-email") as HTMLInputElement).checked = state.roots.email;
  (el("root-page") as HTMLInputElement).checked = state.roots.page;
  (el("root-document") as HTMLInputElement).checked = state.roots.document;
  (el("root-canvas") as HTMLInputElement).checked = state.roots.canvas;
  (el("check-definetheme") as HTMLInputElement).checked = state.checks.defineTheme;
  (el("check-validate") as HTMLInputElement).checked = state.checks.validateGate;
  (el("check-previews") as HTMLInputElement).checked = state.checks.clientPreviews;
  (el("check-tests") as HTMLInputElement).checked = state.checks.tests;
  (el("check-live") as HTMLInputElement).checked = state.checks.livePreview;
}

function init(): void {
  let state = seedState("ledger");
  let phaseStep = 0;
  const rerender = () => render(state, phaseStep);

  const loadPreset = (auditId: AuditChoice) => {
    state = seedState(auditId);
    syncControls(state);
    buildMappingToggles(state, rerender);
    rerender();
  };

  el("preset-ledger").addEventListener("click", () => loadPreset("ledger"));
  el("preset-tagihan").addEventListener("click", () => loadPreset("tagihan"));
  el("reset").addEventListener("click", () => loadPreset(state.auditId));

  const bindRoot = (id: string, key: keyof DemoRoots) => {
    (el(id) as HTMLInputElement).addEventListener("change", (e) => {
      state.roots[key] = (e.target as HTMLInputElement).checked;
      rerender();
    });
  };
  bindRoot("root-email", "email");
  bindRoot("root-page", "page");
  bindRoot("root-document", "document");
  bindRoot("root-canvas", "canvas");

  const bindCheck = (id: string, key: keyof DemoChecks) => {
    (el(id) as HTMLInputElement).addEventListener("change", (e) => {
      state.checks[key] = (e.target as HTMLInputElement).checked;
      rerender();
    });
  };
  bindCheck("check-definetheme", "defineTheme");
  bindCheck("check-validate", "validateGate");
  bindCheck("check-previews", "clientPreviews");
  bindCheck("check-tests", "tests");
  bindCheck("check-live", "livePreview");

  (el("phase-slider") as HTMLInputElement).addEventListener("input", (e) => {
    phaseStep = Number((e.target as HTMLInputElement).value);
    rerender();
  });

  syncControls(state);
  buildMappingToggles(state, rerender);
  rerender();
}

if (typeof document !== "undefined") {
  init();
}
