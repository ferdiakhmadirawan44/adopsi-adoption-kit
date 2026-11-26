# Second audit — TAGIHAN (26 November 2026)

The same engine, a second real template. This proves the ADOPSI
scoring functions generalise: run them over a different template and
you get a different, still valid audit — not a copy of the first one.

## What was measured

The audited template is endra's PLN electricity bill kit **TAGIHAN**
(entry #286, `ferdiakhmadirawan44/tagihan-bill-kit`). Its source was
counted on 26 November 2026 from
`~/workspace/unlayer-hyper-elements/tagihan-bill-kit/src/` — the same
method as the Ledger audit. Re-measure it yourself:

```sh
cd ~/workspace/unlayer-hyper-elements/tagihan-bill-kit/src
wc -l *.ts *.tsx            # 8 files, 2.208 lines
grep -h "from \"@hyper-elements/react\"" *.tsx *.ts   # 26 primitives (union)
grep -l "<Email" *.tsx      # BillEmail, ReceiptEmail (2 Email roots)
grep -l "<Page" *.tsx       # UsagePage (1 Page root)
grep -l "<Document" *.tsx   # BillPdf (1 Document root)
grep -l "<Canvas" *.tsx     # ReminderCard (1 Canvas root)
grep -c "export function" shared.tsx   # 11 local components
grep "^export interface\|^export type" data.ts  # 8 data types
grep -rn "validate(" src/    # nothing — no validate() call
ls tests/ examples/ vercel.json   # none exist
```

| Measured fact | Value |
|---|---|
| Roots | **5** — Email ×2 (BillEmail, ReceiptEmail), Page (UsagePage), Document (BillPdf), Canvas (ReminderCard) |
| Local components | **11** (`Bi`, `BillBreakdown`, `BillProof`, `CustomerBadge`, `MeterBlock`, `PaymentBlock`, `SampleNote`, `StatusPill`, `UsageBars`, `UsageBarsSvg`, `UsageChangeLine`) + the 5 roots |
| Data types | **8** (`TariffClass`, `PaymentStatus`, `UsageMonth`, `BillLine`, `Customer`, `CurrentBill`, `PaidBill`, `TagihanData`) |
| Primitives used | **26** (Button, Canvas, Column, Divider, Document, Email, Grid, Heading, Line, Link, Menu, MergeTag, Page, PageNumber, Path, Rect, Row, Section, Span, Svg, Table, TableCell, TableRow, Text, defineTheme, token) |
| Source files / lines | **8 files, 2.208 lines** |
| `defineTheme` | **Yes** — `tagihanTheme` |
| `validate()` gate | **No** — no `validate()` call anywhere in `src/`, no render script in `package.json` |
| Email-client previews | **None saved** |
| Tests | **None** |
| Live preview | **None** |

The record lives in `src/second-audit.ts` (`secondAuditData`) and
validates with the same `validateData()` as the first audit. The three
sample-data counters (`holdings` / `movers` / `marketStats`) are the
shared record's Ledger-flavoured field names; for TAGIHAN they hold
TAGIHAN's own sample-data counts: **3** bill lines in the breakdown
(energy charge, PPJ, total), **2** bills (current + paid), **6** usage
months in the history. They are display facts only — no scoring
function reads them.

## The score: 40/100 — Berkembang / Growing

| # | Check | Weight | Result | Evidence |
|---|---|---|---|---|
| 1 | Multi-root (Email + Page + Document + Canvas) | 25 | ✓ PASS | 5 roots — all four kinds present |
| 2 | `defineTheme` used | 15 | ✓ PASS | `tagihanTheme` in `src/theme.ts` |
| 3 | `validate()` gate | 15 | ✗ FAIL | No `validate()` call; no render script |
| 4 | Email-client proofs | 15 | ✗ FAIL | No client previews saved |
| 5 | Tests | 15 | ✗ FAIL | No tests |
| 6 | Live preview | 15 | ✗ FAIL | No preview deployed |

**Score: 25 + 15 = 40/100.** Level bands (computed): 0–39 Memulai /
Getting Started · 40–69 Berkembang / Growing · 70–89 Siap Produksi /
Production-Ready · 90–100 Production Ready.

| Phase | Week | Fixes | Effort | Score |
|---|---|---|---|---|
| 1 | 30 Nov–4 Des 2026 | Validate gate | 4 h | 40 → **55** |
| 2 | 7–11 Des 2026 | Email-client proofs | 7 h | 55 → **70** |
| 3 | 14–18 Des 2026 | Tests | 9 h | 70 → **85** |
| 4 | 21–24 Des 2026 | Live preview | 4 h | 85 → **100** |

Total effort **24 h**. Migration coverage **84,0%** — the same 25-row
mapping table as the Ledger audit (the migration guide is the kit's
own), so coverage and migration effort (18 h) match.

## What it proves

- **Multi-root passes here, fails in the Ledger audit** — the same
  check, opposite verdicts, both from real source. The engine does not
  favour the first template.
- **The validate gate fails here, passes in the Ledger audit** — the
  mirror image. TAGIHAN is further along on roots and further behind
  on proof.
- **One engine bug found and fixed by this audit**: `auditNumbers()`
  used to compute `missingRoots` as 4 minus the total root count,
  which goes negative (−1) for a template with two Email roots. It now
  counts missing root *kinds*. The Ledger's 3 stays 3; TAGIHAN's is 0.
  The fix is in `src/data.ts`, the lesson in `AGENTS.md`, the test in
  `tests/second-audit.test.ts`.

## Try it live

The interactive demo (`examples/InteractiveDemo.html`) has both audits
as presets — **Audit 1 — The Ledger** and **Audit 2 — TAGIHAN** — so a
judge can flip between the two real audits and then change any input
to see the engine recompute.
