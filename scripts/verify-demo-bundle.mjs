// One-off verification: run the BUILT demo bundle (the exact code inside
// examples/InteractiveDemo.html) against a minimal DOM stub and prove it
// recomputes when the controls change. Not part of the gate — run by hand:
//   node scripts/verify-demo-bundle.mjs
// It exits 1 if any recomputation is wrong.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function makeEl(tag) {
  const listeners = {};
  const el = {
    tag,
    children: [],
    style: {},
    className: "",
    _text: "",
    _html: "",
    checked: false,
    value: "0",
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener(type, fn) {
      (listeners[type] ||= []).push(fn);
    },
    fire(type, event = {}) {
      for (const fn of listeners[type] || []) fn({ target: this, ...event });
    },
  };
  Object.defineProperty(el, "textContent", {
    get() {
      return this._text;
    },
    set(v) {
      this._text = String(v);
      this.children = [];
    },
  });
  // Setting innerHTML = "" clears the children, like a real DOM node.
  Object.defineProperty(el, "innerHTML", {
    get() {
      return this._html;
    },
    set(v) {
      this._html = String(v);
      if (v === "") this.children = [];
    },
  });
  return el;
}

const ids = [
  "preset-ledger", "preset-tagihan", "reset",
  "root-email", "root-page", "root-document", "root-canvas",
  "check-definetheme", "check-validate", "check-previews", "check-tests", "check-live",
  "phase-slider", "phase-slider-label", "mapping-toggles",
  "demo-project", "demo-date", "score-value", "score-level", "score-note",
  "coverage-value", "coverage-detail", "migration-effort", "total-effort",
  "findings-list", "trajectory", "phases-body", "multiroot-status",
];
const elements = Object.fromEntries(ids.map((id) => [id, makeEl("div")]));
globalThis.document = {
  getElementById: (id) => elements[id] ?? null,
  createElement: (tag) => makeEl(tag),
  createTextNode: (text) => ({ textContent: String(text), nodeType: 3 }),
};

const html = await readFile(join(ROOT, "examples", "InteractiveDemo.html"), "utf8");
const m = html.match(/<script>\n([\s\S]*?)\n<\/script>/);
if (!m) throw new Error("no inline demo bundle found in InteractiveDemo.html");
const bundlePath = "/tmp/demo-bundle-check.mjs";
await writeFile(bundlePath, m[1], "utf8");
await import(bundlePath);

const score = () => elements["score-value"].textContent;
const level = () => elements["score-level"].textContent;
const coverage = () => elements["coverage-value"].textContent;
const findings = () => elements["findings-list"].children.length;
const fail = (msg) => {
  throw new Error(`DEMO SMOKE FAIL: ${msg}`);
};

console.log("initial (Ledger preset):", score(), "|", level(), "|", coverage(), "| findings:", findings());
if (score() !== "30") fail(`initial score ${score()}, expected 30`);
if (!level().startsWith("Memulai")) fail(`initial level ${level()}, expected Memulai`);
if (coverage() !== "84,0%") fail(`initial coverage ${coverage()}, expected 84,0%`);
if (findings() !== 4) fail(`initial findings ${findings()}, expected 4`);

// Phase slider to 2 -> label shows the score after phase 2 (70 on the Ledger preset).
elements["phase-slider"].value = "2";
elements["phase-slider"].fire("input");
console.log("phase slider 2:", elements["phase-slider-label"].textContent);
if (!elements["phase-slider-label"].textContent.includes("fase 2")) fail("phase slider label does not mention fase 2");
if (!elements["phase-slider-label"].textContent.includes("70")) fail("phase slider label does not show 70");

// Setting 1: turn Tests on -> 45, 3 findings.
elements["check-tests"].checked = true;
elements["check-tests"].fire("change");
console.log("tests on:", score(), "|", level(), "| findings:", findings());
if (score() !== "45") fail(`tests-on score ${score()}, expected 45`);
if (findings() !== 3) fail(`tests-on findings ${findings()}, expected 3`);

// Setting 2: turn all four roots on -> 70 (45 + 25 multi-root), Berkembang.
for (const id of ["root-page", "root-document", "root-canvas"]) {
  elements[id].checked = true;
  elements[id].fire("change");
}
console.log("all roots on:", score(), "|", level(), "| findings:", findings());
if (score() !== "70") fail(`all-roots score ${score()}, expected 70`);
if (!level().startsWith("Siap Produksi")) fail(`all-roots level ${level()}, expected Siap Produksi (70-89 band)`);

// Setting 3: TAGIHAN preset -> 40 / Berkembang, coverage 84,0%.
elements["preset-tagihan"].fire("click");
console.log("TAGIHAN preset:", score(), "|", level(), "|", coverage(), "| findings:", findings());
if (score() !== "40") fail(`TAGIHAN score ${score()}, expected 40`);
if (!level().startsWith("Berkembang")) fail(`TAGIHAN level ${level()}, expected Berkembang`);
if (coverage() !== "84,0%") fail(`TAGIHAN coverage ${coverage()}, expected 84,0%`);

// Setting 4: map all four unmapped rows -> coverage 100%.
for (const toggle of elements["mapping-toggles"].children) {
  const input = toggle.children[0];
  input.checked = true;
  input.fire("change");
}
console.log("all rows mapped:", coverage(), "| migration:", elements["migration-effort"].textContent);
if (coverage() !== "100,0%") fail(`mapped coverage ${coverage()}, expected 100,0%`);

// Setting 5: back to Ledger preset, everything on -> 100 / Production Ready.
elements["preset-ledger"].fire("click");
for (const id of ["root-page", "root-document", "root-canvas", "check-validate", "check-previews", "check-tests", "check-live"]) {
  elements[id].checked = true;
  elements[id].fire("change");
}
console.log("everything on:", score(), "|", level(), "| findings:", findings());
if (score() !== "100") fail(`all-on score ${score()}, expected 100`);
if (!level().startsWith("Production Ready")) fail(`all-on level ${level()}, expected Production Ready`);
if (findings() !== 1) fail(`all-on findings ${findings()}, expected 1 (empty-state line)`);

console.log("✓ DEMO SMOKE PASSED — the built bundle recomputes live in the browser");
