# AGENTS.md — ADOPSI Kit

Working notes for any agent (or human) that edits this kit. The README is the
story; this file is the law. **Do not violate these invariants — the gate
(`npm run gate`) checks most of them and will fail the build if they break.**

## Invariants (never violate)

1. **The score comes only from the audit computation.** Never type a score,
   level, coverage %, effort hour or trajectory number into a template. Every
   number on every output comes from `src/data.ts` through a function in
   `src/scoring.ts` (`auditScore`, `auditLevel`, `auditCoverage`,
   `auditPhaseEffort`, `auditScoreAfterPhase`, `auditMigrationEffort`,
   `auditTotalEffort`, `auditFindings`). If a number is wrong, fix the audit
   data or the function — never the template.
2. **All 7 outputs show the same score, level and coverage.** Single source of
   truth: `src/data.ts` (`defaultData`). The gate re-derives the score from
   the weights and fails if it disagrees. Do not add a second data file.
3. **One finding per failed check, one phase per finding.** `auditFindings()`
   derives findings from failed checks; phases are 1–4 and unique. If a check
   flips to PASS, its finding and phase disappear from every output
   automatically — do not leave orphan phases behind.
4. **One sender address for both emails.** `kit.senderEmail` in `data.ts`
   (`adopsi@template-nusantara.id`). Both emails display it; edit it in one
   place only.
5. **Bilingual ID+EN on every output.** Every heading, label, body line and
   button carries both languages. Do not add an English-only or
   Indonesian-only block.
6. **Batik identity: navy `#12284B`, gold `#C9A227`, parchment `#F6F1E7`.**
   The kawung-diamond band (`BatikBand` / `BatikBandEmail`) appears on every
   output. No image assets — everything is drawn in code.
7. **`TableCell` never contains `Text`.** Use `Span` inside `TableCell`
   (proven pattern from the DAO kit). `Svg` never renders to Email — email
   variants must not use `Svg` (the batik band has a separate
   `BatikBandEmail` built from `Row`/`Column`).
8. **`validate()` is a gate, not a suggestion.** `src/render.tsx` in the
   audited Ledger calls `validate()` with the emailClients plugin and exits 1
   on failure; this kit's `scripts/gate.tsx` runs `validate()` on all 7
   templates and writes the proof to `out/checks.json`. Never render for
   submission without the gate passing.
9. **Two Document roots both render.** The certificate (`CertificatePdf`) is a
   separate Document root from the guide (`MigrationGuidePdf`) — do not merge
   it into the guide as a fallback unless the framework rejects the second
   root. As of the last gate run it renders fine (0 errors, 0 warnings).
10. **The audit data is measured, not invented.** The Ledger facts in
    `data.ts.measured` were counted from
    `../crypto-digest-template/src/` (5 files, 679 lines, 22 primitives, 1
    Email root, 2 local components, 4 data types). If the Ledger changes,
    re-measure and update `measured` — do not edit the score by hand.
11. **Weights sum to 100.** The six check weights (25 + 15 + 15 + 15 + 15 +
    15) must always total 100. The gate asserts this.
12. **No secrets, no network calls in templates.** The kit renders fully
    offline (fonts are local files in `assets/fonts/`). Do not add remote
    images or fonts.

## Lessons already paid for (do not re-learn)

- `borderTop` is only valid on `Divider`, not on `Column` — use a `Divider`
  between rows instead (see `OnboardingEmail`, `RoadmapPage`).
- `Text` cannot contain `Text` — nest `Span` inside `Text` for mixed sizes
  (the CertificatePdf score `/100`).
- A `Heading` in a Document resolves to the theme's system font stack, which
  falls back to Helvetica in PDF — and Helvetica cannot draw `→`. Give PDF
  headings an explicit `fontFamily: PRINT_FONT` (DejaVu) when they contain
  non-ASCII glyphs (see `MigrationGuidePdf`).
- `Row` has no `margin` — wrap it in a `Column` with padding instead (see
  `ShareCard`).
- `tsx --test tests/` fails with `ERR_UNSUPPORTED_DIR_IMPORT` — run the test
  files explicitly: `tsx --test tests/scoring.test.ts tests/second-audit.test.ts tests/demo.test.ts` (31 tests).
- `auditNumbers()` counts **missing root KINDS**, not 4 minus the root count: a template can hold two Email roots (TAGIHAN does) and 4 − 5 = −1 made a phase effort negative. One kind present counts once, however many roots of that kind exist. The Ledger's 3 stays 3; TAGIHAN's is 0. Found by the second audit, 26 Nov 2026.
- The interactive demo (`demo/`) recomputes with the real engine but its variants exist **only in memory in the browser** — never a second on-disk data file (invariant 2: the 7 outputs still render from `src/data.ts`). Build it with `npm run demo` (`scripts/build-demo.tsx` bundles `demo/entry.ts` with esbuild and inlines it into `examples/InteractiveDemo.html`); the gate regenerates it. The demo's root toggles restore the audit's own count per kind (TAGIHAN: Email = 2) or add one root of a kind the audit lacks. Verify a demo change with `node scripts/verify-demo-bundle.mjs` (DOM-stub smoke test, 6 settings) — there is no headless browser on this machine, so the final visual check is opening the file in a real browser.
- The Canvas cheat sheet overflows silently: after changing row sizes, render
  and look at the PNG — row 10 was clipped once before the spacing was
  tightened. Always visually check both Canvas outputs after layout edits.
- The email-clients CLI `--clients` list does **not** include
  `gmail-app-ios` / `apple-mail-ios` — the iPhone variants come out
  automatically as `.iphone.html` files for `gmail-app` and `apple-mail`.

## Commands

```sh
npm run check     # hyper-elements check src
npm run render    # hyper-elements render src --out out
npm run preview   # both emails, 7 clients
npm run demo      # build the interactive demo -> examples/InteractiveDemo.html
npm test          # 31 unit tests (scoring + second audit + demo)
npm run gate      # check + render + preview + demo + validate() + invariants + examples
npm run typecheck # tsc --noEmit
```

## Live preview status

`examples/InteractiveDemo.html` is the live preview candidate (the
engine live in the browser, both audits as presets) and
`examples/RoadmapPage.html` is the static preview, both ready to
deploy. The Vercel CLI on this machine is **not authenticated**
(`~/.vercel/auth.json` missing) — do not create an account or ask for
credentials. Deploy from an authenticated machine; the files need
nothing else. The preview is currently served from GitHub Pages at
`ferdiakhmadirawan44.github.io/adopsi-adoption-kit/` — pushing to the
repo updates it.
