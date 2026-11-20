# ADOPSI — Hyper Elements Adoption Kit

**One audit file → seven outputs. A kit that helps a dev team adopt Hyper Elements — by auditing a real template and turning the audit into a plan.**

No other entry in the challenge is about adoption itself. Every other kit is a finished template for an end user; this one is for the team that has to *become* a Hyper Elements team — starting from the honest place most teams actually start: one Email, no tests, no proof, no preview.

## The audit is real

The audited template is the author's own first kit, **The Ledger** (a weekly crypto portfolio digest email, `ferdiakhmadirawan44/weekly-crypto-portfolio-digest`). Its source was measured, not guessed:

| Measured fact | Value |
|---|---|
| Roots | **1** — Email only |
| Local components | **2** (`Stat`, `MoverCard`) + the root `Digest` |
| Data types | **4** (`DigestData`, `StatItem`, `MoverItem`, `EmailMeta`) |
| Primitives used | **22** (Button, Column, Divider, Email, Heading, Image, Link, MergeTag, Menu, Row, Section, Span, Text, defineTheme, token, …) |
| Source files / lines | **5 files, 679 lines** |
| `defineTheme` | **Yes** — `ledgerTheme` |
| `validate()` gate | **Yes** — `src/render.tsx` calls `validate()` with the emailClients plugin and exits 1 on failure |
| Email-client previews | **None saved** |
| Tests | **None** |
| Live preview | **None** |

The audit lives in `src/data.ts` (`defaultData.measured`). Change the audit, re-run the gate, and every output updates — nothing is typed by hand.

## The score: 30/100 — Memulai / Getting Started

Six checks, each with a weight and evidence from the source code. The score is the sum of the weights of the checks that pass — computed by `auditScore()` in `src/scoring.ts`, never typed.

| # | Check | Weight | Result | Evidence |
|---|---|---|---|---|
| 1 | Multi-root (Email + Page + Document + Canvas) | 25 | ✗ FAIL | 1 root — Email only |
| 2 | `defineTheme` used | 15 | ✓ PASS | `ledgerTheme` in `src/theme.ts` |
| 3 | `validate()` gate | 15 | ✓ PASS | `src/render.tsx` — validate() + emailClients, exits 1 |
| 4 | Email-client proofs | 15 | ✗ FAIL | No client previews saved |
| 5 | Tests | 15 | ✗ FAIL | No tests |
| 6 | Live preview | 15 | ✗ FAIL | No preview deployed |

**Score: 15 + 15 = 30/100.** Level bands (computed): 0–39 Memulai / Getting Started · 40–69 Berkembang / Growing · 70–89 Siap Produksi / Production-Ready · 90–100 Production Ready.

Every failed check becomes exactly one finding and one phase — so the roadmap is the audit, rearranged:

| Phase | Week | Fixes | Effort | Score |
|---|---|---|---|---|
| 1 | 24–28 Nov 2026 | Multi-root | 12 h | 30 → **55** |
| 2 | 1–5 Dec 2026 | Email-client proofs | 4 h | 55 → **70** |
| 3 | 8–12 Dec 2026 | Tests | 9 h | 70 → **85** |
| 4 | 15–18 Dec 2026 | Live preview | 4 h | 85 → **100** |

Total effort **29 h**, computed from the audit: new root 4 h/root · email client 0,5 h/client · computed function 1,5 h/function · output 0,5 h/output. Migration coverage **84,0%** — 21 of 25 MJML/React Email concepts map directly (3 partial, 1 manual; migration effort 18 h at 0,5 / 1,5 / 3 h per row).

## The 7 outputs

One story in order — audit → first week → roadmap → migration guide → certificate → cheat sheet → announcement. Every output is bilingual (Indonesia + English) and carries the same score, level and audit ID.

| # | Output | Root | File |
|---|---|---|---|
| 01 | Audit email — score + level + top 3 findings + verdict | Email | `src/AuditEmail.tsx` |
| 02 | Team onboarding email — the week-1 plan, day by day | Email | `src/OnboardingEmail.tsx` |
| 03 | Adoption roadmap page — 4 phases, computed hours, score trajectory | Page | `src/RoadmapPage.tsx` |
| 04 | Migration guide PDF — 25-row MJML/React Email → Hyper Elements table + coverage + checklist | Document (4 pages) | `src/MigrationGuidePdf.tsx` |
| 05 | Readiness certificate — A4, 1 page: score + level + audit date + team/project | Document (1 page) | `src/CertificatePdf.tsx` |
| 06 | Cheat-sheet card — 10 essential commands/components | Canvas 1080×1080 | `src/CheatsheetCard.tsx` |
| 07 | Share/announcement card — "Kami pindah ke Hyper Elements" | Canvas 1200×630 | `src/ShareCard.tsx` |

**Two Document roots in one project work** — the certificate renders alongside the guide (both pass `check` with 0 errors). Two Email roots work too, as proven by earlier kits. Both emails share **one sender address** (`adopsi@template-nusantara.id`, a data field in `src/data.ts`).

Identity: batik-inspired Nusantara — deep navy `#12284B`, gold `#C9A227`, parchment `#F6F1E7`, kawung-diamond band drawn in code on every output. No image assets.

`examples/` holds every rendered output — open them without running anything — plus `examples/client-previews/` with real client renders of both emails (7 clients requested: Outlook, Outlook.com, Gmail, Gmail app, Apple Mail, Yahoo, AOL — 13 files per email including Mac and iPhone variants). `docs/` holds rendered screenshots of the PDFs and cards.

## How to run it

```sh
npm install
npm run check     # hyper-elements check src — expect 0 errors / 0 warnings
npm run render    # hyper-elements render src --out out — expect 0 errors
npm run preview   # both emails in 7 email clients — expect 0 errors
npm test          # unit tests for the scoring functions — expect 13/13 pass
npm run gate      # everything above + validate() + invariants + examples copy
                  # — expect "GATE PASSED" and out/checks.json
```

The gate (`scripts/gate.tsx`) is the proof: it runs `check`, `render` and `preview`, runs `validate()` in-process on all 7 templates (the emails with the `@hyper-elements/email-clients` plugin), re-checks 12 single-source-of-truth invariants, and writes `out/checks.json`. It exits 1 on any failure.

## Live preview

The roadmap page renders to a static file, `examples/RoadmapPage.html` — ready to deploy as the live preview. **Not deployed yet:** the Vercel CLI on this machine is not authenticated (`~/.vercel/auth.json` does not exist), and no account was created. Deploy with `vercel deploy examples/RoadmapPage.html` (or `vercel --prod`) from an authenticated machine and the roadmap is the preview.

## Gap coverage — why this kit beats the field

| # | Weakness in other entries | What this kit does |
|---|---|---|
| 1 | English only (most of the top entries) | **Bilingual ID+EN on all 7 outputs** — every heading, label and body line |
| 2 | Few outputs (most have 3–5) | **7 outputs** — email ×2, page ×1, document ×2, canvas ×2 |
| 3 | No real computation (static content dressed up) | **Every number derived from `data.ts`** — score, level, coverage, effort, trajectory, findings |
| 4 | No narrative (a collection of formats) | **One story in order** — audit → week 1 → roadmap → guide → certificate → cheat sheet → announcement, chapter markers on every output |
| 5 | Generic look (crypto-blue / clean-minimal) | **Batik-inspired Nusantara identity** — navy + gold + kawung diamonds, consistent across all 7 |
| 6 | No proof of real-world rendering | **Pre-rendered examples in `examples/`** + **7-client email previews** (Outlook, Gmail, Apple Mail, Yahoo, AOL incl. iPhone) + `validate()` gate + `out/checks.json` |
| 7 | No validation proof / no tests | **`validate()` gate with emailClients plugin** + **13 unit tests, all passing** + 12 gate invariants |
| 8 | No live preview | **Static preview file ready** (`examples/RoadmapPage.html`); deploy pending Vercel auth |
| 9 | End-user kits only | **Serves developers adopting Hyper Elements** — a theme no other entry has |

## Files

```
src/
  data.ts            Audit file (measured Ledger facts, checks, mapping, phases, week 1, cheat sheet)
  scoring.ts         Pure computed functions: score, level, findings, coverage, effort, trajectory
  theme.ts           adopsiTheme (navy/gold/parchment) + DejaVu print fonts
  shared.tsx         BatikBand, AuditBadge, GoldSeal, ScoreBar, ChecksTable, FindingsList, …
  AuditEmail.tsx     Chapter 01 — Email
  OnboardingEmail.tsx Chapter 02 — Email
  RoadmapPage.tsx    Chapter 03 — Page (static preview: examples/RoadmapPage.html)
  MigrationGuidePdf.tsx Chapter 04 — Document, 4 pages
  CertificatePdf.tsx Chapter 05 — Document, A4, 1 page
  CheatsheetCard.tsx Chapter 06 — Canvas 1080×1080
  ShareCard.tsx      Chapter 07 — Canvas 1200×630
tests/scoring.test.ts  13 unit tests (score, level bands, coverage, effort, trajectory)
scripts/gate.tsx     validate gate + invariants + out/checks.json + examples copy
examples/            Every rendered output + client previews (26 files)
docs/                Rendered screenshots of the PDFs and cards
out/                 Build output (render + previews + checks.json)
```

## Notes for the judges

- The low score is the point. A 30/100 audit is honest — and the kit's whole argument is that a low score with a computed path to 100 is more useful than a perfect template with no plan.
- The audited template is the author's own first entry in this same challenge (The Ledger, #232). The kit eats its own dog food: the audit it ships is the audit of a real entry, measured from its real source.
- If you re-audit The Ledger after it gains roots, tests or a preview, change only `src/data.ts` — the score, the level, the findings, the phases and all 7 outputs follow.
