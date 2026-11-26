// ---------------------------------------------------------------------------
// ADOPSI — build the interactive demo (scripts/build-demo.tsx)
//
// Run:  npx tsx scripts/build-demo.tsx   (or: npm run demo)
//       npm run gate                     (runs this as a step)
//
// What it does:
//   1. Bundles demo/entry.ts with esbuild (the binary already in
//      node_modules/.bin) — the bundle contains the kit's REAL scoring
//      functions from src/scoring.ts, so the demo recomputes with the
//      same engine as the seven outputs. No logic is duplicated.
//   2. Inlines the bundle into demo/template.html and writes
//      examples/InteractiveDemo.html — one self-contained file, no
//      network calls, no external fonts or images.
//   3. Proves the default computation BEFORE writing: the Ledger preset
//      must score 30 / Memulai / 84,0% and the TAGIHAN preset 40 /
//      Berkembang — otherwise the build fails and the gate fails.
//
// The demo file lives in examples/ next to RoadmapPage.html. The gate
// regenerates it on every run, so it can never go stale.
// ---------------------------------------------------------------------------

import { execSync } from "node:child_process";
import { readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeDemo, seedState, AUDITS } from "../demo/entry.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEMO = join(ROOT, "demo");
const EXAMPLES = join(ROOT, "examples");
const BUNDLE_TMP = join(DEMO, ".bundle.tmp.js");

async function main(): Promise<number> {
  // 1. Bundle the real engine + demo UI into one IIFE.
  console.log("$ npx esbuild demo/entry.ts --bundle --format=iife --minify");
  execSync(
    `npx esbuild ${join(DEMO, "entry.ts")} --bundle --format=iife --minify --outfile=${BUNDLE_TMP}`,
    { cwd: ROOT, stdio: "inherit" },
  );
  const bundle = await readFile(BUNDLE_TMP, "utf8");
  await rm(BUNDLE_TMP, { force: true });
  if (bundle.includes("</script>")) {
    throw new Error("demo bundle contains a literal </script> — it would break the inline HTML");
  }

  // 2. Inline into the template.
  const template = await readFile(join(DEMO, "template.html"), "utf8");
  if (!template.includes("<!--DEMO_BUNDLE-->")) {
    throw new Error("demo template is missing the <!--DEMO_BUNDLE--> placeholder");
  }
  const html = template.replace("<!--DEMO_BUNDLE-->", () => bundle);

  // 3. Prove the default computation before writing anything.
  const ledger = computeDemo(AUDITS.ledger, seedState("ledger"));
  if (ledger.score !== 30 || ledger.level.id !== "Memulai" || ledger.coverage.pct !== 84) {
    throw new Error(
      `demo Ledger preset wrong: score ${ledger.score}, level ${ledger.level.id}, coverage ${ledger.coverage.pct}% (expected 30 / Memulai / 84)`,
    );
  }
  const tagihan = computeDemo(AUDITS.tagihan, seedState("tagihan"));
  if (tagihan.score !== 40 || tagihan.level.id !== "Berkembang" || tagihan.coverage.pct !== 84) {
    throw new Error(
      `demo TAGIHAN preset wrong: score ${tagihan.score}, level ${tagihan.level.id}, coverage ${tagihan.coverage.pct}% (expected 40 / Berkembang / 84)`,
    );
  }

  await mkdir(EXAMPLES, { recursive: true });
  await writeFile(join(EXAMPLES, "InteractiveDemo.html"), html, "utf8");
  console.log(`✓ demo: examples/InteractiveDemo.html (${html.length} bytes, bundle ${bundle.length} bytes)`);
  console.log("✓ demo default: Ledger 30 Memulai 84,0% · TAGIHAN 40 Berkembang 84,0%");
  return 0;
}

process.exitCode = await main();
