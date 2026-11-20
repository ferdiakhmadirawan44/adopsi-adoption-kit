// ---------------------------------------------------------------------------
// ADOPSI — Hyper Elements Adoption Kit: data model + derived values.
//
// ONE SOURCE OF TRUTH: one audit file drives all seven outputs — the
// audit email, the onboarding email, the roadmap page, the migration
// guide PDF, the readiness certificate, the cheat-sheet card and the
// announcement card. The score, the level, the coverage, the findings
// and every effort hour are COMPUTED from this file by src/scoring.ts —
// nothing is typed by hand in a template.
//
// THE AUDIT IS REAL. On 20 November 2026 this kit audited endra's first
// Hyper Elements template, The Ledger
// (ferdiakhmadirawan44/weekly-crypto-portfolio-digest, entry #232), by
// reading its actual source in
// ~/workspace/unlayer-hyper-elements/crypto-digest-template/ and
// measuring it. Every "measured" fact below was counted from that code:
//
//   - Roots: 1 — <Email> only (src/Digest.tsx:124). No Page, no
//     Document, no Canvas.
//   - Local components: 2 — Stat, MoverCard (plus the Digest root).
//   - Data types: 4 — Holding, Mover, MarketStat, DigestData.
//   - Primitives used: 22 — Button, Column, Divider, Email, Grid,
//     Heading, Image, LineBreak, Link, List, ListItem, Menu, MergeTag,
//     Row, Section, Social, Span, Table, TableCell, TableRow, Text,
//     token (counted from the import + usage in Digest.tsx).
//   - Source files: 5 — logo.ts, data.ts, theme.ts, render.tsx,
//     Digest.tsx — 679 lines in total (438 + 113 + 83 + 42 + 3).
//   - defineTheme: YES — ledgerTheme in src/theme.ts.
//   - validate(): YES — src/render.tsx calls validate(element,
//     { plugins: [emailClients] }) and exits 1 on failure. (So the
//     "validate gate" check PASSES — the gap is not the gate itself,
//     it is the missing proof: no saved client previews, no checks.json.)
//   - Email-client preview files: NO — the plugin runs inside
//     validate(), but no preview HTML was ever saved (no examples/
//     folder, no client-previews).
//   - Tests: NO — no test files, no test script in package.json.
//   - Live preview: NO — no Vercel config, no preview URL anywhere.
//
// The audit therefore scores 30/100 — "Memulai / Getting Started" —
// and the kit's story is the climb: four phases, four weeks, 29 hours,
// from 30 to 100 by 18 December 2026. That low honest score is the
// point: ADOPSI measures first, then fixes, in the open.
//
// THE SEVEN OUTPUTS (chapters, in order):
//   01 Hasil Audit / Audit Result  — the audit email (score + findings)
//   02 Minggu Pertama / First Week — the onboarding email (day-by-day)
//   03 Roadmap / Roadmap          — the adoption roadmap page (4 phases)
//   04 Panduan Migrasi / Migration Guide — the migration guide PDF
//   05 Sertifikat / Certificate   — the readiness certificate (A4)
//   06 Cheat Sheet / Cheat Sheet  — the cheat-sheet card (1080x1080)
//   07 Pengumuman / Announcement — the announcement card (1200x630)
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
  type Phase,
} from "./scoring.js";

/** Parse an ISO date as UTC noon — noon is safely inside the same
 *  calendar day in every timezone, so no date ever slips a day when the
 *  VM's local zone differs from WIB (the bug that once rendered every due
 *  date one day early in the TUMBUH kit). All date math here is UTC-based. */
export function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** "20 November 2026" in Indonesian. */
export function formatDateId(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** "Thursday, 20 November 2026" in English. */
export function formatDateEn(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Whole-number grouping, Indonesian, e.g. 679 -> "679". */
export function formatIntId(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

/** Percentage with one decimal, Indonesian, e.g. 84 -> "84,0%". */
export function formatPct1Id(n: number): string {
  return `${n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Percentage with one decimal, English, e.g. 84 -> "84.0%". */
export function formatPct1En(n: number): string {
  return `${n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export interface AuditData {
  kit: {
    name: string;
    short: string;
    taglineId: string;
    taglineEn: string;
    /** THE sender address — ONE address used by BOTH emails. */
    senderEmail: string;
    siteUrl: string;
  };
  audit: {
    /** One ID, identical on all seven outputs. */
    id: string;
    dateIso: string;
    dateLabelId: string;
    dateLabelEn: string;
    project: string;
    projectRepo: string;
    teamId: string;
    teamEn: string;
    auditorId: string;
    auditorEn: string;
    targetDateIso: string;
    targetLabelId: string;
    targetLabelEn: string;
  };
  /** Facts measured from the audited template's real source code. */
  measured: {
    roots: { email: number; page: number; document: number; canvas: number };
    /** Local (non-root) components in the template, by name. */
    localComponents: string[];
    rootComponent: string;
    dataTypes: string[];
    holdings: number;
    movers: number;
    marketStats: number;
    /** Hyper Elements primitives the template actually imports/uses. */
    primitives: string[];
    sourceFiles: number;
    linesOfCode: number;
    theme: boolean;
    validate: boolean;
    clientPreviews: boolean;
    tests: boolean;
    livePreview: boolean;
  };
  /** The six readiness checks (weights sum to 100). */
  checks: Check[];
  /** What each failed check turns into (action + phase). */
  findingActions: Record<string, { actionId: string; actionEn: string; phase: number }>;
  /** MJML / React Email -> Hyper Elements mapping rows. */
  mapping: MapRow[];
  /** The four adoption phases (one per failed check). */
  phases: Phase[];
  /** Week-1 onboarding plan (Monday-Friday of phase 1). */
  week1: { dayId: string; dayEn: string; taskId: string; taskEn: string; resultId: string; resultEn: string }[];
  /** The ten cheat-sheet rows. */
  cheatsheet: { command: string; labelId: string; labelEn: string }[];
  source: string;
  sampleNote: string;
}

/** The numbers the phase-effort formulas read — all from the audit. */
export function auditNumbers(data: AuditData): AuditNumbers {
  const roots = data.measured.roots;
  return {
    missingRoots: 4 - (roots.email + roots.page + roots.document + roots.canvas),
    emailRoots: roots.email,
    clients: 7,
    computedFunctions: 6,
    outputs: 7,
  };
}

export function auditScore(data: AuditData): number {
  return computeScore(data.checks);
}

export function auditLevel(data: AuditData): { id: string; en: string } {
  return levelFor(auditScore(data));
}

export function auditFindings(data: AuditData): Finding[] {
  return findingsFor(data.checks, data.findingActions);
}

export function auditCoverage(data: AuditData): {
  mapped: number;
  partial: number;
  manual: number;
  total: number;
  pct: number;
} {
  return migrationCoverage(data.mapping);
}

export function auditMigrationEffort(data: AuditData): number {
  return migrationEffortHours(data.mapping);
}

export function auditTotalEffort(data: AuditData): number {
  return totalEffortHours(data.phases, auditNumbers(data));
}

export function auditScoreAfterPhase(data: AuditData, n: number): number {
  return scoreAfterPhase(data.checks, data.phases, n);
}

export function auditPhaseEffort(data: AuditData, n: number): number {
  const p = data.phases.find((x) => x.n === n);
  if (!p) throw new Error(`Unknown phase ${n}`);
  return phaseEffortHours(p.effort, auditNumbers(data));
}

/** Chapter of the story — every output carries its number (1-7). */
export interface Chapter {
  n: number;
  titleId: string;
  titleEn: string;
}

export const CHAPTERS: Chapter[] = [
  { n: 1, titleId: "Hasil Audit", titleEn: "Audit Result" },
  { n: 2, titleId: "Minggu Pertama", titleEn: "First Week" },
  { n: 3, titleId: "Roadmap", titleEn: "Roadmap" },
  { n: 4, titleId: "Panduan Migrasi", titleEn: "Migration Guide" },
  { n: 5, titleId: "Sertifikat", titleEn: "Certificate" },
  { n: 6, titleId: "Cheat Sheet", titleEn: "Cheat Sheet" },
  { n: 7, titleId: "Pengumuman", titleEn: "Announcement" },
];

export function chapterOf(n: number): Chapter {
  const c = CHAPTERS.find((x) => x.n === n);
  if (!c) throw new Error(`Unknown chapter ${n}`);
  return c;
}

/** Validate the whole audit file BEFORE anything renders. Throws on the
 *  first inconsistency — weights that do not sum to 100, a mapping row
 *  with a bad status, a phase that fixes an unknown check, a final
 *  score that does not land on 100, a cheat sheet without exactly ten
 *  rows. Every number on every output is derived from this file, so this
 *  is where the kit proves itself. */
export function validateData(data: AuditData): void {
  const fail = (msg: string): never => {
    throw new Error(`ADOPSI data invalid: ${msg}`);
  };
  if (!data.kit.name.trim()) fail("kit.name is empty");
  if (!data.kit.senderEmail.includes("@")) fail(`kit.senderEmail is not an email: ${data.kit.senderEmail}`);
  if (!data.audit.id.trim()) fail("audit.id is empty");
  if (!data.audit.project.trim()) fail("audit.project is empty");
  const m = data.measured;
  const rootTotal = m.roots.email + m.roots.page + m.roots.document + m.roots.canvas;
  if (rootTotal < 1) fail("measured.roots total is 0 — a template has at least one root");
  if (m.localComponents.length === 0) fail("measured.localComponents is empty");
  if (m.primitives.length === 0) fail("measured.primitives is empty");
  if (m.sourceFiles <= 0 || m.linesOfCode <= 0) fail("measured source size must be positive");
  if (data.checks.length !== 6) fail(`expected 6 checks, found ${data.checks.length}`);
  const weightSum = data.checks.reduce((s, c) => s + c.weight, 0);
  if (weightSum !== 100) fail(`check weights sum to ${weightSum}, not 100`);
  for (const c of data.checks) {
    if (c.weight <= 0) fail(`check ${c.id} has a non-positive weight`);
    if (!c.evidenceId.trim() || !c.evidenceEn.trim()) fail(`check ${c.id} is missing evidence`);
  }
  const score = auditScore(data);
  if (score < 0 || score > 100) fail(`score ${score} is outside 0-100`);
  const level = levelFor(score);
  if (score < level.min || score > level.max) fail(`score ${score} falls outside level ${level.id}`);
  const findings = auditFindings(data);
  const failed = data.checks.filter((c) => !c.passed).length;
  if (findings.length !== failed) fail(`findings (${findings.length}) do not match failed checks (${failed})`);
  for (const f of findings) {
    if (!data.phases.some((p) => p.n === f.phase)) fail(`finding ${f.checkId} points at unknown phase ${f.phase}`);
  }
  const cov = auditCoverage(data);
  if (cov.total !== data.mapping.length) fail("coverage total does not match mapping rows");
  if (cov.mapped + cov.partial + cov.manual !== cov.total) fail("coverage parts do not sum to the total");
  if (cov.pct < 0 || cov.pct > 100) fail(`coverage ${cov.pct}% is outside 0-100`);
  if (auditMigrationEffort(data) <= 0) fail("migration effort must be positive");
  for (const p of data.phases) {
    if (p.checkId && !data.checks.some((c) => c.id === p.checkId)) {
      fail(`phase ${p.n} fixes unknown check ${p.checkId}`);
    }
    if (auditPhaseEffort(data, p.n) <= 0) fail(`phase ${p.n} has non-positive effort`);
  }
  const finalScore = auditScoreAfterPhase(data, data.phases.length);
  if (finalScore !== 100) fail(`score after the last phase is ${finalScore}, not 100`);
  if (data.week1.length !== 5) fail(`week-1 plan has ${data.week1.length} days, expected 5`);
  if (data.cheatsheet.length !== 10) fail(`cheat sheet has ${data.cheatsheet.length} rows, expected 10`);
  if (parseDate(data.audit.dateIso) >= parseDate(data.audit.targetDateIso)) {
    fail("audit.dateIso must be before audit.targetDateIso");
  }
}

// ---------------------------------------------------------------------------
// The audit record — measured from The Ledger's real source, 20 Nov 2026.
// ---------------------------------------------------------------------------

export const sampleData: AuditData = {
  kit: {
    name: "ADOPSI",
    short: "ADOPSI",
    taglineId: "Dari template pertama ke production dalam 4 minggu",
    taglineEn: "From first template to production in 4 weeks",
    senderEmail: "adopsi@template-nusantara.id",
    siteUrl: "https://example.com/adopsi",
  },
  audit: {
    id: "AUDIT ADOPSI-2026-001",
    dateIso: "2026-11-20",
    dateLabelId: "Kamis, 20 November 2026",
    dateLabelEn: "Thursday, 20 November 2026",
    project: "The Ledger",
    projectRepo: "ferdiakhmadirawan44/weekly-crypto-portfolio-digest",
    teamId: "Tim Template Nusantara",
    teamEn: "Nusantara Template Team",
    auditorId: "Kit ADOPSI",
    auditorEn: "ADOPSI Kit",
    targetDateIso: "2026-12-18",
    targetLabelId: "Jumat, 18 Desember 2026",
    targetLabelEn: "Friday, 18 December 2026",
  },
  measured: {
    roots: { email: 1, page: 0, document: 0, canvas: 0 },
    localComponents: ["Stat", "MoverCard"],
    rootComponent: "Digest",
    dataTypes: ["Holding", "Mover", "MarketStat", "DigestData"],
    holdings: 6,
    movers: 2,
    marketStats: 4,
    primitives: [
      "Button", "Column", "Divider", "Email", "Grid", "Heading", "Image", "LineBreak",
      "Link", "List", "ListItem", "Menu", "MergeTag", "Row", "Section", "Social",
      "Span", "Table", "TableCell", "TableRow", "Text", "token",
    ],
    sourceFiles: 5,
    linesOfCode: 679,
    theme: true,
    validate: true,
    clientPreviews: false,
    tests: false,
    livePreview: false,
  },
  checks: [
    {
      id: "multi-root",
      labelId: "Multi-root",
      labelEn: "Multi-root",
      weight: 25,
      passed: false,
      evidenceId: "1 root (Email); Page 0, Document 0, Canvas 0 — src/Digest.tsx",
      evidenceEn: "1 root (Email); Page 0, Document 0, Canvas 0 — src/Digest.tsx",
    },
    {
      id: "defineTheme",
      labelId: "defineTheme",
      labelEn: "defineTheme",
      weight: 15,
      passed: true,
      evidenceId: "ledgerTheme via defineTheme — src/theme.ts",
      evidenceEn: "ledgerTheme via defineTheme — src/theme.ts",
    },
    {
      id: "validate-gate",
      labelId: "Validate gate",
      labelEn: "Validate gate",
      weight: 15,
      passed: true,
      evidenceId:
        "validate() di src/render.tsx + plugin email-clients; gagal → exit 1",
      evidenceEn:
        "validate() in src/render.tsx + email-clients plugin; failure → exit 1",
    },
    {
      id: "client-previews",
      labelId: "Bukti email-client",
      labelEn: "Email-client proof",
      weight: 15,
      passed: false,
      evidenceId:
        "Plugin jalan saat validate, tapi tidak ada file preview tersimpan (tanpa examples/)",
      evidenceEn:
        "Plugin runs during validate, but no preview files were ever saved (no examples/)",
    },
    {
      id: "tests",
      labelId: "Tests",
      labelEn: "Tests",
      weight: 15,
      passed: false,
      evidenceId: "Tidak ada file test, tidak ada script test di package.json",
      evidenceEn: "No test files, no test script in package.json",
    },
    {
      id: "live-preview",
      labelId: "Live preview",
      labelEn: "Live preview",
      weight: 15,
      passed: false,
      evidenceId: "Tidak ada konfigurasi Vercel, tidak ada URL preview",
      evidenceEn: "No Vercel config, no preview URL",
    },
  ],
  findingActions: {
    "multi-root": {
      actionId: "Tambah root Page, Document, dan Canvas; satu tema dipakai bersama",
      actionEn: "Add Page, Document and Canvas roots; share one theme",
      phase: 1,
    },
    "client-previews": {
      actionId: "Generate preview tiap klien email dan simpan sebagai bukti",
      actionEn: "Generate one preview per email client and save them as proof",
      phase: 2,
    },
    tests: {
      actionId: "Tulis unit test untuk semua fungsi hitung (skor, level, coverage)",
      actionEn: "Write unit tests for every computed function (score, level, coverage)",
      phase: 3,
    },
    "live-preview": {
      actionId: "Deploy preview statis halaman roadmap agar bisa diklik",
      actionEn: "Deploy the static roadmap preview so it can be clicked",
      phase: 4,
    },
  },
  mapping: [
    { source: "mjml / mj-body", sourceKind: "MJML", target: "<Email>", status: "mapped", noteId: "Root email", noteEn: "Email root" },
    { source: "mj-section", sourceKind: "MJML", target: "<Section>", status: "mapped", noteId: "Seksi konten", noteEn: "Content section" },
    { source: "mj-column", sourceKind: "MJML", target: "<Column>", status: "mapped", noteId: "Kolom", noteEn: "Column" },
    { source: "mj-text", sourceKind: "MJML", target: "<Text>", status: "mapped", noteId: "Teks", noteEn: "Text" },
    { source: "mj-button", sourceKind: "MJML", target: "<Button>", status: "mapped", noteId: "Tombol", noteEn: "Button" },
    { source: "mj-image", sourceKind: "MJML", target: "<Image>", status: "mapped", noteId: "Gambar", noteEn: "Image" },
    { source: "mj-divider", sourceKind: "MJML", target: "<Divider>", status: "mapped", noteId: "Pemisah", noteEn: "Divider" },
    { source: "mj-table", sourceKind: "MJML", target: "<Table>", status: "mapped", noteId: "Tabel", noteEn: "Table" },
    { source: "mj-social", sourceKind: "MJML", target: "<Social>", status: "mapped", noteId: "Ikon sosial", noteEn: "Social icons" },
    { source: "mj-navbar", sourceKind: "MJML", target: "<Menu>", status: "mapped", noteId: "Menu tautan", noteEn: "Link menu" },
    { source: "mj-attributes + mj-style", sourceKind: "MJML", target: "defineTheme()", status: "mapped", noteId: "Tema ditulis sekali", noteEn: "Theme written once" },
    { source: "mj-carousel", sourceKind: "MJML", target: "<Grid>", status: "partial", noteId: "Tidak ada padanan langsung; susun dengan Grid + Column", noteEn: "No direct equivalent; build with Grid + Column" },
    { source: "mj-hero", sourceKind: "MJML", target: "<Section> + <Image>", status: "partial", noteId: "Gabungkan dua primitif; tanpa latar khusus", noteEn: "Combine two primitives; no special background" },
    { source: "<Html>", sourceKind: "React Email", target: "<Email>", status: "mapped", noteId: "Root email", noteEn: "Email root" },
    { source: "<Section>", sourceKind: "React Email", target: "<Section>", status: "mapped", noteId: "Seksi konten", noteEn: "Content section" },
    { source: "<Column> / <Row>", sourceKind: "React Email", target: "<Column> / <Row>", status: "mapped", noteId: "Kolom / baris", noteEn: "Column / row" },
    { source: "<Heading>", sourceKind: "React Email", target: "<Heading>", status: "mapped", noteId: "Judul", noteEn: "Heading" },
    { source: "<Link>", sourceKind: "React Email", target: "<Link>", status: "mapped", noteId: "Tautan", noteEn: "Link" },
    { source: "<Button>", sourceKind: "React Email", target: "<Button>", status: "mapped", noteId: "Tombol", noteEn: "Button" },
    { source: "<Img>", sourceKind: "React Email", target: "<Image>", status: "mapped", noteId: "Gambar", noteEn: "Image" },
    { source: "<Hr>", sourceKind: "React Email", target: "<Divider>", status: "mapped", noteId: "Pemisah", noteEn: "Divider" },
    { source: "<Preview>", sourceKind: "React Email", target: "prop previewText", status: "mapped", noteId: "Teks preview inbox", noteEn: "Inbox preview text" },
    { source: "<Font>", sourceKind: "React Email", target: "fonts di Document/Canvas", status: "mapped", noteId: "Font file untuk PDF/gambar", noteEn: "Font files for PDF/image" },
    { source: "Kelas Tailwind", sourceKind: "React Email", target: "token tema", status: "partial", noteId: "Sebagian via token(); sebagian ditulis manual", noteEn: "Partly via token(); partly written by hand" },
    { source: "HTML kustom / mj-raw", sourceKind: "React Email", target: "tulis ulang manual", status: "manual", noteId: "Tidak ada jalan pintas; tulis ulang dengan primitif", noteEn: "No shortcut; rewrite with primitives" },
  ],
  phases: [
    {
      n: 1,
      weekId: "Minggu 1 · 23–27 Nov 2026",
      weekEn: "Week 1 · 23–27 Nov 2026",
      titleId: "Multi-root",
      titleEn: "Multi-root",
      checkId: "multi-root",
      effort: { basis: "missingRoots", perUnit: 4 },
      noteId: "Satu tema, tiga root baru: Page, Document, Canvas",
      noteEn: "One theme, three new roots: Page, Document, Canvas",
    },
    {
      n: 2,
      weekId: "Minggu 2 · 30 Nov–4 Des 2026",
      weekEn: "Week 2 · 30 Nov–4 Dec 2026",
      titleId: "Bukti klien",
      titleEn: "Client proof",
      checkId: "client-previews",
      effort: { basis: "emailClients", perUnit: 0.5 },
      noteId: "Preview tersimpan untuk tiap klien email + checks.json",
      noteEn: "Saved previews per email client + checks.json",
    },
    {
      n: 3,
      weekId: "Minggu 3 · 7–11 Des 2026",
      weekEn: "Week 3 · 7–11 Dec 2026",
      titleId: "Tests",
      titleEn: "Tests",
      checkId: "tests",
      effort: { basis: "computedFunctions", perUnit: 1.5 },
      noteId: "Unit test untuk semua fungsi hitung, semua lolos",
      noteEn: "Unit tests for every computed function, all passing",
    },
    {
      n: 4,
      weekId: "Minggu 4 · 14–18 Des 2026",
      weekEn: "Week 4 · 14–18 Dec 2026",
      titleId: "Live preview",
      titleEn: "Live preview",
      checkId: "live-preview",
      effort: { basis: "outputs", perUnit: 0.5 },
      noteId: "Preview statis ter-deploy; semua output bisa diklik",
      noteEn: "Static preview deployed; every output clickable",
    },
  ],
  week1: [
    {
      dayId: "Senin, 23 Nov",
      dayEn: "Monday, 23 Nov",
      taskId: "Setup — install, jalankan check pertama, baca audit ini bersama tim",
      taskEn: "Setup — install, run the first check, read this audit together",
      resultId: "Check berjalan; tim paham skor 30 dan 4 temuan",
      resultEn: "Check runs; the team understands the 30 score and 4 findings",
    },
    {
      dayId: "Selasa, 24 Nov",
      dayEn: "Tuesday, 24 Nov",
      taskId: "Render template pertama — root Email, lihat HTML hasilnya",
      taskEn: "Render the first template — the Email root, look at the HTML",
      resultId: "Satu email ter-render dari data yang sama",
      resultEn: "One email rendered from the same data",
    },
    {
      dayId: "Rabu, 25 Nov",
      dayEn: "Wednesday, 25 Nov",
      taskId: "defineTheme — satu tema untuk semua root, tanpa warna per elemen",
      taskEn: "defineTheme — one theme for all roots, no per-element colours",
      resultId: "Tema tunggal dipakai Email dan Page",
      resultEn: "A single theme used by Email and Page",
    },
    {
      dayId: "Kamis, 26 Nov",
      dayEn: "Thursday, 26 Nov",
      taskId: "validate() + email-clients — gate sebelum render, bukti per klien",
      taskEn: "validate() + email-clients — gate before rendering, proof per client",
      resultId: "Gate menolak template yang rusak sebelum render",
      resultEn: "The gate rejects a broken template before rendering",
    },
    {
      dayId: "Jumat, 27 Nov",
      dayEn: "Friday, 27 Nov",
      taskId: "Render semua output + review bersama — skor naik ke 55",
      taskEn: "Render every output + team review — score rises to 55",
      resultId: "Fase 1 selesai; 3 root baru hidup",
      resultEn: "Phase 1 done; 3 new roots live",
    },
  ],
  cheatsheet: [
    { command: "npx hyper-elements check src", labelId: "Periksa template", labelEn: "Check templates" },
    { command: "<Email theme={...}>", labelId: "Root email", labelEn: "Email root" },
    { command: "<Page>", labelId: "Root halaman", labelEn: "Page root" },
    { command: "<Document>", labelId: "Root PDF", labelEn: "PDF root" },
    { command: "<Canvas>", labelId: "Root gambar", labelEn: "Image root" },
    { command: "defineTheme()", labelId: "Satu tema, semua root", labelEn: "One theme, all roots" },
    { command: "validate()", labelId: "Gate sebelum render", labelEn: "Gate before rendering" },
    { command: "render() · renderPdf() · renderImage()", labelId: "Render semua format", labelEn: "Render every format" },
    { command: "@hyper-elements/email-clients", labelId: "Bukti tiap klien email", labelEn: "Proof per email client" },
    { command: "token()", labelId: "Warna & font dari tema", labelEn: "Colours & fonts from the theme" },
  ],
  source: "Audit template The Ledger, 20 November 2026 — diukur dari kode sumbernya",
  sampleNote:
    "The Ledger is endra's real first Hyper Elements template (entry #232); the audit measured its actual source code on 20 November 2026. The audit arithmetic (score, level, coverage, findings, effort) is real and computed from that measurement.",
};

/** The data the templates render when no `data` prop is passed. */
export const defaultData = sampleData;

// Validate at import time: a broken audit file fails fast, before any
// output is written.
validateData(defaultData);
