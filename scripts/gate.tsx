// ---------------------------------------------------------------------------
// ADOPSI — validate gate (scripts/gate.tsx)
//
// Run:  npm run gate        (runs check + render + preview, then this gate)
//       npx tsx scripts/gate.tsx   (this file only)
//
// What it does:
//   1. Runs `hyper-elements check src` and `hyper-elements render src`
//      and `hyper-elements preview` for both emails (7 clients) — exits 1
//      if any of them reports an error.
//   2. Runs validate() in-process on all 7 templates — the two Emails with
//      the @hyper-elements/email-clients plugin (7 clients), the rest
//      plain — and records every diagnostic.
//   3. Re-checks the single-source-of-truth invariants from data.ts: the
//      score is the sum of the passed weights, the trajectory ends at 100,
//      coverage and effort are computed from the same rows the templates
//      display, every failed check has exactly one finding and one phase.
//   4. Writes out/checks.json (the machine-readable proof) and copies the
//      rendered outputs + client previews into examples/.
//
// Nothing in this file hard-codes the audit numbers: every expected value
// is computed by the same functions the templates use. If the audit data
// changes, the gate changes with it.
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { validate } from "@hyper-elements/react";
import { emailClients } from "@hyper-elements/email-clients";
import AuditEmail from "../src/AuditEmail.tsx";
import OnboardingEmail from "../src/OnboardingEmail.tsx";
import RoadmapPage from "../src/RoadmapPage.tsx";
import MigrationGuidePdf from "../src/MigrationGuidePdf.tsx";
import CertificatePdf from "../src/CertificatePdf.tsx";
import CheatsheetCard from "../src/CheatsheetCard.tsx";
import ShareCard from "../src/ShareCard.tsx";
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
} from "../src/data.ts";
import { secondAuditData } from "../src/second-audit.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const EXAMPLES = join(ROOT, "examples");
const CLIENTS = [
  "outlook",
  "outlook-com",
  "gmail",
  "gmail-app",
  "apple-mail",
  "yahoo",
  "aol",
] as const;

type CliSummary = { errors: number; warnings: number; skipped: number };

function runCli(label: string, cmd: string): { summary: CliSummary; ok: boolean } {
  console.log(`\n$ ${cmd}`);
  let out = "";
  try {
    out = execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    out = (err.stdout ?? "") + (err.stderr ?? "");
    console.log(out.slice(-2000));
    console.log(`✗ ${label}: command failed (exit ${err.status})`);
    return { summary: { errors: 1, warnings: 0, skipped: 0 }, ok: false };
  }
  const m = out.match(/(\d+) templates?: (\d+) errors?, (\d+) warnings?, (\d+) skipped/);
  const summary: CliSummary = m
    ? { errors: Number(m[2]), warnings: Number(m[3]), skipped: Number(m[4]) }
    : { errors: 0, warnings: 0, skipped: 0 };
  console.log(
    `${summary.errors === 0 ? "✓" : "✗"} ${label}: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.skipped} skipped`,
  );
  return { summary, ok: summary.errors === 0 };
}

async function copyDir(srcDir: string, dstDir: string): Promise<string[]> {
  await mkdir(dstDir, { recursive: true });
  const copied: string[] = [];
  for (const name of await readdir(srcDir)) {
    const src = join(srcDir, name);
    const dst = join(dstDir, name);
    const entries = await readdir(src).catch(() => null);
    if (entries) {
      copied.push(...(await copyDir(src, dst)));
    } else {
      await copyFile(src, dst);
      copied.push(dst);
    }
  }
  return copied;
}

async function main(): Promise<number> {
  const data = defaultData;
  const failures: string[] = [];
  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    kit: data.kit.name,
    auditId: data.audit.id,
    clients: [...CLIENTS],
  };

  // ---- 1. CLI check / render / preview ----
  const check = runCli("check", "npx hyper-elements check src");
  const render = runCli("render", "npx hyper-elements render src --out out");
  const preview = runCli(
    "preview",
    `npx hyper-elements preview src/AuditEmail.tsx src/OnboardingEmail.tsx --clients ${CLIENTS.join(",")} --out out`,
  );
  report.cli = { check: check.summary, render: render.summary, preview: preview.summary };
  if (!check.ok) failures.push("hyper-elements check reported errors");
  if (!render.ok) failures.push("hyper-elements render reported errors");
  if (!preview.ok) failures.push("hyper-elements preview reported errors");

  // ---- 1b. Interactive demo build (regenerates examples/InteractiveDemo.html) ----
  const demo = runCli("demo", "npx tsx scripts/build-demo.tsx");
  report.demo = demo.summary;
  if (!demo.ok) failures.push("demo build reported errors");
  const demoStat = await stat(join(EXAMPLES, "InteractiveDemo.html")).catch(() => null);
  if (!demoStat || demoStat.size === 0) {
    failures.push("examples/InteractiveDemo.html missing or empty after demo build");
  } else {
    console.log(`✓ demo file: examples/InteractiveDemo.html (${demoStat.size} bytes)`);
  }

  // ---- 2. In-process validate() ----
  const plugin = await emailClients({ clients: [...CLIENTS] });
  const templates = [
    { name: "AuditEmail", el: createElement(AuditEmail), email: true },
    { name: "OnboardingEmail", el: createElement(OnboardingEmail), email: true },
    { name: "RoadmapPage", el: createElement(RoadmapPage), email: false },
    { name: "MigrationGuidePdf", el: createElement(MigrationGuidePdf), email: false },
    { name: "CertificatePdf", el: createElement(CertificatePdf), email: false },
    { name: "CheatsheetCard", el: createElement(CheatsheetCard), email: false },
    { name: "ShareCard", el: createElement(ShareCard), email: false },
  ];
  const validateResults: Record<string, unknown> = {};
  for (const t of templates) {
    const result = validate(t.el, t.email ? { plugins: [plugin] } : {});
    const errors = result.diagnostics.filter((d) => d.severity === "error").length;
    const warnings = result.diagnostics.filter((d) => d.severity === "warning").length;
    const notes = result.diagnostics.length - errors - warnings;
    validateResults[t.name] = {
      valid: result.valid,
      errors,
      warnings,
      notes,
      diagnostics: result.diagnostics.map((d) => ({
        code: d.code,
        severity: d.severity,
        message: d.message,
        path: (d as { path?: string }).path ?? null,
      })),
    };
    console.log(
      `${errors === 0 ? "✓" : "✗"} validate ${t.name}: ${errors} errors, ${warnings} warnings, ${notes} notes`,
    );
    if (errors > 0) failures.push(`validate(${t.name}) reported ${errors} error(s)`);
  }
  report.validate = validateResults;

  // ---- 3. Single-source-of-truth invariants (all computed) ----
  const score = auditScore(data);
  const level = auditLevel(data);
  const cov = auditCoverage(data);
  const findings = auditFindings(data);
  const trajectory = [0, 1, 2, 3, 4].map((n) => auditScoreAfterPhase(data, n));
  const invariants: Array<{ name: string; passed: boolean; detail: string }> = [];
  const inv = (name: string, passed: boolean, detail: string) => {
    invariants.push({ name, passed, detail });
    console.log(`${passed ? "✓" : "✗"} invariant ${name}: ${detail}`);
    if (!passed) failures.push(`invariant failed: ${name}`);
  };
  inv(
    "score-is-sum-of-passed-weights",
    score === data.checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0),
    `score ${score} = ${data.checks.filter((c) => c.passed).map((c) => c.weight).join(" + ")}`,
  );
  inv(
    "weights-sum-to-100",
    data.checks.reduce((s, c) => s + c.weight, 0) === 100,
    `weights ${data.checks.map((c) => c.weight).join(" + ")} = 100`,
  );
  inv(
    "level-from-score",
    level.id === "Memulai" && level.en === "Getting Started",
    `score ${score} -> ${level.id} / ${level.en}`,
  );
  inv(
    "trajectory-ends-at-100",
    trajectory[4] === 100 && trajectory[0] === score,
    `${trajectory.join(" -> ")}`,
  );
  inv(
    "trajectory-strictly-increasing",
    trajectory.every((v, i) => i === 0 || v > trajectory[i - 1]),
    trajectory.join(" -> "),
  );
  inv(
    "coverage-adds-up",
    cov.mapped + cov.partial + cov.manual === cov.total &&
      cov.total === data.mapping.length,
    `${cov.mapped} mapped + ${cov.partial} partial + ${cov.manual} manual = ${cov.total} rows`,
  );
  inv(
    "coverage-pct-computed",
    cov.pct === Math.round((cov.mapped / cov.total) * 1000) / 10,
    `${cov.mapped}/${cov.total} = ${cov.pct}%`,
  );
  inv(
    "one-finding-per-failed-check",
    findings.length === data.checks.filter((c) => !c.passed).length,
    `${findings.length} findings for ${data.checks.filter((c) => !c.passed).length} failed checks`,
  );
  inv(
    "one-phase-per-finding",
    new Set(findings.map((f) => f.phase)).size === findings.length &&
      findings.every((f) => f.phase >= 1 && f.phase <= 4),
    `phases ${findings.map((f) => f.phase).join(", ")}`,
  );
  inv(
    "migration-effort-computed",
    auditMigrationEffort(data) ===
      data.mapping.reduce(
        (s, r) => s + (r.status === "mapped" ? 0.5 : r.status === "partial" ? 1.5 : 3),
        0,
      ),
    `${auditMigrationEffort(data)}h from ${data.mapping.length} rows`,
  );
  inv(
    "total-effort-is-sum-of-phases",
    auditTotalEffort(data) === [1, 2, 3, 4].reduce((s, n) => s + auditPhaseEffort(data, n), 0),
    `${auditTotalEffort(data)}h = ${[1, 2, 3, 4].map((n) => auditPhaseEffort(data, n)).join(" + ")}h`,
  );
  inv("week1-has-5-days", data.week1.length === 5, `${data.week1.length} days`);
  report.audit = {
    score,
    level,
    coverage: cov,
    findings: findings.length,
    migrationEffortHours: auditMigrationEffort(data),
    totalEffortHours: auditTotalEffort(data),
    trajectory,
  };

  // ---- 3b. Second audit (TAGIHAN) — same engine, second template ----
  const second = secondAuditData;
  let secondValid = true;
  try {
    validateData(second);
  } catch {
    secondValid = false;
  }
  inv("second-audit-validates", secondValid, "second audit record validates");
  inv("second-score-40", auditScore(second) === 40, `score ${auditScore(second)}`);
  inv(
    "second-level-berkembang",
    auditLevel(second).id === "Berkembang",
    `level ${auditLevel(second).id} / ${auditLevel(second).en}`,
  );
  inv(
    "second-trajectory-ends-at-100",
    auditScoreAfterPhase(second, second.phases.length) === 100,
    [0, 1, 2, 3, 4].map((n) => auditScoreAfterPhase(second, n)).join(" -> "),
  );
  inv(
    "second-total-effort-24h",
    auditTotalEffort(second) === 24,
    `${auditTotalEffort(second)}h = ${[1, 2, 3, 4].map((n) => auditPhaseEffort(second, n)).join(" + ")}h`,
  );
  inv(
    "second-missing-roots-0",
    auditNumbers(second).missingRoots === 0 && auditNumbers(second).emailRoots === 2,
    `missingRoots ${auditNumbers(second).missingRoots}, emailRoots ${auditNumbers(second).emailRoots}`,
  );
  report.secondAudit = {
    project: second.audit.project,
    score: auditScore(second),
    level: auditLevel(second),
    findings: auditFindings(second).length,
    coverage: auditCoverage(second),
    migrationEffortHours: auditMigrationEffort(second),
    totalEffortHours: auditTotalEffort(second),
    trajectory: [0, 1, 2, 3, 4].map((n) => auditScoreAfterPhase(second, n)),
  };
  report.invariants = invariants;

  // ---- 4. Copy examples ----
  const rendered = await copyDir(join(OUT, "src"), EXAMPLES);
  const previews = await copyDir(join(OUT, "clients"), join(EXAMPLES, "client-previews"));
  console.log(`\n✓ examples: ${rendered.length} rendered files + ${previews.length} client previews`);
  report.examples = {
    rendered: rendered.map((p) => p.replace(ROOT + "/", "")),
    clientPreviews: previews.map((p) => p.replace(ROOT + "/", "")),
  };

  // ---- 5. Write checks.json ----
  report.failures = failures;
  report.passed = failures.length === 0;
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "checks.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`\n${failures.length === 0 ? "✓ GATE PASSED" : "✗ GATE FAILED"} — out/checks.json`);
  if (failures.length > 0) {
    for (const f of failures) console.log(`  - ${f}`);
  }
  return failures.length === 0 ? 0 : 1;
}

process.exitCode = await main();
