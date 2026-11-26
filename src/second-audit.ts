// ---------------------------------------------------------------------------
// ADOPSI — second audit: TAGIHAN.
//
// The same engine, a second real template. On 26 November 2026 this kit
// audited endra's PLN electricity bill kit TAGIHAN (entry #286,
// ferdiakhmadirawan44/tagihan-bill-kit) the same way it audited The
// Ledger: by reading its actual source in
// ~/workspace/unlayer-hyper-elements/tagihan-bill-kit/src/ and measuring
// it. Every "measured" fact below was counted from that code:
//
//   - Roots: 5 — Email x2 (BillEmail, ReceiptEmail), Page (UsagePage),
//     Document (BillPdf), Canvas (ReminderCard). All four kinds present.
//   - Local components: 11 — Bi, BillBreakdown, BillProof, CustomerBadge,
//     MeterBlock, PaymentBlock, SampleNote, StatusPill, UsageBars,
//     UsageBarsSvg, UsageChangeLine (all in src/shared.tsx), plus the 5
//     root components.
//   - Data types: 8 — TariffClass, PaymentStatus, UsageMonth, BillLine,
//     Customer, CurrentBill, PaidBill, TagihanData.
//   - Primitives used: 26 — Button, Canvas, Column, Divider, Document,
//     Email, Grid, Heading, Line, Link, Menu, MergeTag, Page, PageNumber,
//     Path, Rect, Row, Section, Span, Svg, Table, TableCell, TableRow,
//     Text, defineTheme, token (counted from the imports in src/).
//   - Source files: 8 — BillEmail, BillPdf, ReceiptEmail, ReminderCard,
//     UsagePage, data.ts, shared.tsx, theme.ts — 2.208 lines in total
//     (197 + 205 + 277 + 119 + 292 + 467 + 503 + 148).
//   - defineTheme: YES — tagihanTheme in src/theme.ts.
//   - validate(): NO — no validate() call anywhere in src/, and no
//     render script in package.json.
//   - Email-client preview files: NO — no examples/ folder, no preview
//     files saved.
//   - Tests: NO — no tests/ folder, no test script in package.json.
//   - Live preview: NO — no Vercel config, no preview URL anywhere.
//
// The audit therefore scores 40/100 — "Berkembang / Growing" — and the
// kit's story repeats: four phases, four weeks, 24 hours, from 40 to
// 100 by 24 December 2026.
//
// What this proves: the engine generalises. The same six checks, the
// same scoring functions, the same mapping table — a different template
// with different strengths (multi-root passes here; the validate gate
// fails here) produces a different, still valid audit record. The
// second audit reuses the kit's mapping table (the MJML/React Email
// migration guide is the same) and the same cheat sheet, so its
// coverage (84,0%) and migration effort (18 h) match the Ledger audit;
// everything else — score, level, findings, phases, effort — is
// recomputed from TAGIHAN's own measurement.
//
// The three sample-data counters (holdings / movers / marketStats) are
// the Ledger-flavoured field names of the shared audit record; for
// TAGIHAN they hold TAGIHAN's own sample-data counts: 3 bill lines in
// the breakdown (energy charge, PPJ, total), 2 bills (current + paid),
// 6 usage months in the history. They are display facts only — no
// scoring function reads them.
//
// One engine note, found by this audit: auditNumbers() used to compute
// missingRoots as 4 minus the total root count, which goes negative
// (-1) for a template with two Email roots. It now counts missing root
// KINDS instead — the Ledger's 3 stays 3, TAGIHAN's is 0. See the
// lesson in AGENTS.md.
// ---------------------------------------------------------------------------

import {
  defaultData,
  validateData,
  type AuditData,
} from "./data.js";

/** The second audit record — measured from TAGIHAN's real source. */
export const secondAuditData: AuditData = {
  kit: defaultData.kit,
  audit: {
    id: "AUDIT ADOPSI-2026-002",
    dateIso: "2026-11-26",
    dateLabelId: "Kamis, 26 November 2026",
    dateLabelEn: "Thursday, 26 November 2026",
    project: "TAGIHAN",
    projectRepo: "ferdiakhmadirawan44/tagihan-bill-kit",
    teamId: "Tim Template Nusantara",
    teamEn: "Nusantara Template Team",
    auditorId: "Kit ADOPSI",
    auditorEn: "ADOPSI Kit",
    targetDateIso: "2026-12-24",
    targetLabelId: "Kamis, 24 Desember 2026",
    targetLabelEn: "Thursday, 24 December 2026",
  },
  measured: {
    roots: { email: 2, page: 1, document: 1, canvas: 1 },
    localComponents: [
      "Bi",
      "BillBreakdown",
      "BillProof",
      "CustomerBadge",
      "MeterBlock",
      "PaymentBlock",
      "SampleNote",
      "StatusPill",
      "UsageBars",
      "UsageBarsSvg",
      "UsageChangeLine",
    ],
    rootComponent: "BillEmail",
    dataTypes: [
      "TariffClass",
      "PaymentStatus",
      "UsageMonth",
      "BillLine",
      "Customer",
      "CurrentBill",
      "PaidBill",
      "TagihanData",
    ],
    holdings: 3,
    movers: 2,
    marketStats: 6,
    primitives: [
      "Button",
      "Canvas",
      "Column",
      "Divider",
      "Document",
      "Email",
      "Grid",
      "Heading",
      "Line",
      "Link",
      "Menu",
      "MergeTag",
      "Page",
      "PageNumber",
      "Path",
      "Rect",
      "Row",
      "Section",
      "Span",
      "Svg",
      "Table",
      "TableCell",
      "TableRow",
      "Text",
      "defineTheme",
      "token",
    ],
    sourceFiles: 8,
    linesOfCode: 2208,
    theme: true,
    validate: false,
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
      passed: true,
      evidenceId:
        "5 root — Email ×2 (BillEmail, ReceiptEmail), Page (UsagePage), Document (BillPdf), Canvas (ReminderCard)",
      evidenceEn:
        "5 roots — Email ×2 (BillEmail, ReceiptEmail), Page (UsagePage), Document (BillPdf), Canvas (ReminderCard)",
    },
    {
      id: "defineTheme",
      labelId: "defineTheme",
      labelEn: "defineTheme",
      weight: 15,
      passed: true,
      evidenceId: "tagihanTheme via defineTheme — src/theme.ts",
      evidenceEn: "tagihanTheme via defineTheme — src/theme.ts",
    },
    {
      id: "validate-gate",
      labelId: "Validate gate",
      labelEn: "Validate gate",
      weight: 15,
      passed: false,
      evidenceId:
        "Tidak ada pemanggilan validate() di src/; package.json tanpa script render",
      evidenceEn:
        "No validate() call anywhere in src/; no render script in package.json",
    },
    {
      id: "client-previews",
      labelId: "Bukti email-client",
      labelEn: "Email-client proof",
      weight: 15,
      passed: false,
      evidenceId:
        "Tidak ada folder examples/; tidak ada file preview tersimpan",
      evidenceEn: "No examples/ folder; no preview files saved",
    },
    {
      id: "tests",
      labelId: "Tests",
      labelEn: "Tests",
      weight: 15,
      passed: false,
      evidenceId: "Tidak ada folder tests/; tidak ada script test di package.json",
      evidenceEn: "No tests/ folder; no test script in package.json",
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
    "validate-gate": {
      actionId:
        "Tambah pemanggilan validate() + plugin email-clients di jalur render; gagal → exit 1",
      actionEn:
        "Add a validate() call + the email-clients plugin to the render path; failure → exit 1",
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
  // The migration guide is the kit's own table — the same 25 rows as the
  // Ledger audit, so coverage and migration effort match.
  mapping: defaultData.mapping,
  phases: [
    {
      n: 1,
      weekId: "Minggu 1 · 30 Nov–4 Des 2026",
      weekEn: "Week 1 · 30 Nov–4 Dec 2026",
      titleId: "Validate gate",
      titleEn: "Validate gate",
      checkId: "validate-gate",
      effort: { basis: "outputs", perUnit: 0.5 },
      noteId: "validate() di jalur render ketujuh output; gagal → exit 1",
      noteEn: "validate() on all seven outputs' render paths; failure → exit 1",
    },
    {
      n: 2,
      weekId: "Minggu 2 · 7–11 Des 2026",
      weekEn: "Week 2 · 7–11 Dec 2026",
      titleId: "Bukti klien",
      titleEn: "Client proof",
      checkId: "client-previews",
      effort: { basis: "emailClients", perUnit: 0.5 },
      noteId: "Preview tersimpan untuk tiap klien email + checks.json",
      noteEn: "Saved previews per email client + checks.json",
    },
    {
      n: 3,
      weekId: "Minggu 3 · 14–18 Des 2026",
      weekEn: "Week 3 · 14–18 Dec 2026",
      titleId: "Tests",
      titleEn: "Tests",
      checkId: "tests",
      effort: { basis: "computedFunctions", perUnit: 1.5 },
      noteId: "Unit test untuk semua fungsi hitung, semua lolos",
      noteEn: "Unit tests for every computed function, all passing",
    },
    {
      n: 4,
      weekId: "Minggu 4 · 21–24 Des 2026",
      weekEn: "Week 4 · 21–24 Dec 2026",
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
      dayId: "Senin, 30 Nov",
      dayEn: "Monday, 30 Nov",
      taskId: "Setup — pasang @hyper-elements/email-clients, baca audit ini bersama tim",
      taskEn: "Setup — install @hyper-elements/email-clients, read this audit together",
      resultId: "Plugin terpasang; tim paham skor 40 dan 4 temuan",
      resultEn: "Plugin installed; the team understands the 40 score and 4 findings",
    },
    {
      dayId: "Selasa, 1 Des",
      dayEn: "Tuesday, 1 Dec",
      taskId: "validate() di jalur render email — gate menolak template rusak",
      taskEn: "validate() on the email render path — the gate rejects a broken template",
      resultId: "Dua email lolos validate()",
      resultEn: "Both emails pass validate()",
    },
    {
      dayId: "Rabu, 2 Des",
      dayEn: "Wednesday, 2 Dec",
      taskId: "validate() di jalur render Page, Document, Canvas",
      taskEn: "validate() on the Page, Document and Canvas render paths",
      resultId: "Lima root lolos validate()",
      resultEn: "All five roots pass validate()",
    },
    {
      dayId: "Kamis, 3 Des",
      dayEn: "Thursday, 3 Dec",
      taskId: "Gate di package.json — npm run gate sebelum render",
      taskEn: "Gate in package.json — npm run gate before rendering",
      resultId: "Gate menolak render tanpa bukti",
      resultEn: "The gate blocks rendering without proof",
    },
    {
      dayId: "Jumat, 4 Des",
      dayEn: "Friday, 4 Dec",
      taskId: "Render semua output + review bersama — skor naik ke 55",
      taskEn: "Render every output + team review — score rises to 55",
      resultId: "Fase 1 selesai; validate gate hidup",
      resultEn: "Phase 1 done; the validate gate is live",
    },
  ],
  // The cheat sheet is the kit's own — the same 10 rows as the Ledger audit.
  cheatsheet: defaultData.cheatsheet,
  source: "Audit template TAGIHAN, 26 November 2026 — diukur dari kode sumbernya",
  sampleNote:
    "TAGIHAN is endra's PLN electricity bill kit (entry #286); the audit measured its actual source code on 26 November 2026. The audit arithmetic (score, level, coverage, findings, effort) is real and computed from that measurement — the same engine as the Ledger audit.",
};

// Validate at import time: a broken second audit fails fast, before any
// output is written — same rule as the first audit.
validateData(secondAuditData);
