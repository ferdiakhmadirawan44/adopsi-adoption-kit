// ---------------------------------------------------------------------------
// Shared pieces of the ADOPSI kit — used by all seven outputs so the kit
// can never disagree with itself. Every piece reads the SAME `data`
// object and derives everything from the audit; nothing is re-typed per
// output. The score (30), the level (Memulai), the coverage (84,0%) and
// the effort (29 jam) are computed once in src/data.ts and shown
// identically everywhere.
//
// The bilingual rule: every label is Indonesian first, English second,
// from the same data — the two languages are rendered from one source, so
// they can never drift apart.
//
// The identity rule: every output carries the batik band (kawung-style
// diamonds), the chapter marker and the audit badge — the kit's
// fingerprint, recognisable in any format.
// ---------------------------------------------------------------------------

import {
  Circle,
  Column,
  Divider,
  Path,
  Row,
  Span,
  Svg,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  auditCoverage,
  auditFindings,
  auditLevel,
  auditMigrationEffort,
  auditPhaseEffort,
  auditScore,
  auditScoreAfterPhase,
  auditTotalEffort,
  chapterOf,
  formatPct1En,
  formatPct1Id,
  type AuditData,
} from "./data.js";
import { C, MONO_FONT } from "./theme.js";

/** Bilingual label: Indonesian line, then the English line, muted. */
export function Bi({
  id,
  en,
  size = 14,
  bold = false,
  align,
}: {
  id: string;
  en: string;
  size?: number;
  bold?: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <Column style={{ gap: 0 }}>
      <Text
        style={{
          fontSize: size,
          fontWeight: bold ? 700 : 400,
          textAlign: align,
        }}
      >
        {id}
      </Text>
      <Text
        style={{
          fontSize: Math.max(11, size - 2),
          color: token("colors.muted"),
          textAlign: align,
        }}
      >
        {en}
      </Text>
    </Column>
  );
}

/**
 * The batik band — a kawung-inspired row of gold diamonds with dots,
 * drawn in code (no image assets). One diamond per 26 units of width;
 * the band is the kit's fingerprint and runs across the top of every
 * output, in the header, the footer, or both.
 */
export function BatikBand({
  width = 560,
  height = 18,
  color = C.gold,
}: {
  width?: number;
  height?: number;
  color?: string;
}) {
  const step = 26;
  const count = Math.max(1, Math.floor(width / step));
  const ry = height / 2 - 2;
  const rx = 9;
  const diamonds: { cx: number; d: string }[] = [];
  for (let i = 0; i < count; i++) {
    const cx = i * step + step / 2;
    diamonds.push({
      cx,
      d: `M ${cx} ${height / 2 - ry} L ${cx + rx} ${height / 2} L ${cx} ${height / 2 + ry} L ${cx - rx} ${height / 2} Z`,
    });
  }
  const dots: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    dots.push(i * step + step);
  }
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      title="Batik kawung band"
    >
      {diamonds.map((d, i) => (
        <Path key={`d${i}`} d={d.d} style={{ fill: color }} />
      ))}
      {dots.map((x, i) => (
        <Circle key={`c${i}`} cx={x} cy={height / 2} r={2} style={{ fill: color }} />
      ))}
    </Svg>
  );
}

/**
 * The gold seal — concentric circles with a diamond heart, drawn in code.
 * Used on the certificate (and small on the share card). `bg` is the
 * surface the seal sits on — the circles are filled with it (the
 * renderers reject fill "none").
 */
export function GoldSeal({ size = 72, bg = "#FFFFFF" }: { size?: number; bg?: string }) {
  const c = size / 2;
  const rOuter = size / 2 - 2;
  const rInner = size / 2 - 10;
  const d = `M ${c} ${c - 12} L ${c + 12} ${c} L ${c} ${c + 12} L ${c - 12} ${c} Z`;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} title="Adopsi seal">
      <Circle cx={c} cy={c} r={rOuter} style={{ fill: bg, stroke: C.gold, strokeWidth: 3 }} />
      <Circle cx={c} cy={c} r={rInner} style={{ fill: bg, stroke: C.gold, strokeWidth: 1 }} />
      <Path d={d} style={{ fill: C.gold }} />
      <Circle cx={c} cy={c} r={3} style={{ fill: C.navyDeep }} />
    </Svg>
  );
}

/**
 * The batik band for EMAIL roots — the Email writer has no inline SVG,
 * so the email version is a row of gold diamond glyphs (the same motif,
 * email-safe).
 */
export function BatikBandEmail({ count = 42, color = "#6B5600" }: { count?: number; color?: string }) {
  return (
    <Text style={{ color, fontSize: 12, letterSpacing: 4, textAlign: "center" }}>
      {"◆ ".repeat(count).trim()}
    </Text>
  );
}

/** The chapter marker — where this output sits in the kit's story. */
export function ChapterMark({ n }: { n: number }) {
  const ch = chapterOf(n);
  return (
    <Column style={{ gap: 4 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.goldDark,
        }}
      >
        Bab {String(ch.n).padStart(2, "0")} dari 7 · Chapter {String(ch.n).padStart(2, "0")} of 7
      </Text>
      <Text style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>
        {ch.titleId} / {ch.titleEn}
      </Text>
      <JourneyStrip current={n} />
    </Column>
  );
}

/** The journey strip — seven numbered dots, the current chapter in gold. */
export function JourneyStrip({ current }: { current: number }) {
  return (
    <Row style={{ gap: 6, alignItems: "center" }}>
      {CHAPTERS_DOTS.map((n) => {
        const isCurrent = n === current;
        const isPast = n < current;
        return (
          <Column
            key={n}
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: isCurrent ? C.gold : isPast ? C.navyTint : "#FFFFFF",
              border: `2px solid ${isCurrent ? C.goldDark : C.navy}`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: isCurrent ? C.navyDeep : C.navy,
                textAlign: "center",
              }}
            >
              {n}
            </Text>
          </Column>
        );
      })}
      <Text style={{ fontSize: 12, color: token("colors.muted") }}>{current} / 7</Text>
    </Row>
  );
}

const CHAPTERS_DOTS = [1, 2, 3, 4, 5, 6, 7];

/** The audit badge: the audit ID over the project name. Stacked — the
 *  ID is the proof that ties all seven outputs together. */
export function AuditBadge({ data }: { data: AuditData }) {
  return (
    <Column
      style={{
        backgroundColor: "#FFFFFF",
        border: `2px solid ${C.gold}`,
        borderRadius: 14,
        padding: [10, 18],
        gap: 2,
        alignItems: "center",
        justifyContent: "start",
        width: 300,
      }}
    >
      <Text
        style={{
          color: C.navy,
          fontWeight: 800,
          fontSize: 14,
          fontFamily: MONO_FONT,
          textAlign: "center",
        }}
      >
        {data.audit.id}
      </Text>
      <Text style={{ color: C.navy, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
        {data.audit.project} · {data.audit.teamId}
      </Text>
    </Column>
  );
}

/**
 * The proof strip — IDENTICAL text on all seven outputs. If any output
 * ever shows a different audit ID, score or level, the kit is broken;
 * that is the whole point of "one audit, one score".
 */
export function ProofStrip({ data, dark }: { data: AuditData; dark?: boolean }) {
  const color = dark ? "#C9D6E8" : token("colors.muted");
  const score = auditScore(data);
  const level = auditLevel(data);
  const cov = auditCoverage(data);
  return (
    <Column style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, color, fontFamily: MONO_FONT }}>
        {data.audit.id} · {data.audit.project} · {data.audit.dateLabelId}
      </Text>
      <Text style={{ fontSize: 12, color }}>
        Skor / Score {score}/100 · Level: {level.id} / {level.en} · Coverage migrasi / Migration
        coverage {formatPct1Id(cov.pct)} · Effort {auditTotalEffort(data)} jam / hours
      </Text>
      <Text style={{ fontSize: 12, fontWeight: 700, color: dark ? "#FFFFFF" : C.ink }}>
        One audit, one score — this audit ID and score are identical on the audit email, the
        onboarding email, the roadmap page, the migration guide, the certificate and both
        cards.
      </Text>
    </Column>
  );
}

/** The score badge — the big number, the level pill, the target line. */
export function ScoreBadge({ data, big = false }: { data: AuditData; big?: boolean }) {
  const score = auditScore(data);
  const level = auditLevel(data);
  return (
    <Column
      style={{
        backgroundColor: C.navyDeep,
        borderRadius: 16,
        padding: [20, 24],
        gap: 6,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: big ? 64 : 44,
          fontWeight: 800,
          fontFamily: MONO_FONT,
          color: C.goldBright,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {score}
        <Span style={{ fontSize: big ? 28 : 20, color: "#FFFFFF" }}>/100</Span>
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        {level.id.toUpperCase()} · {level.en.toUpperCase()}
      </Text>
      <Text style={{ fontSize: 13, color: "#C9D6E8", textAlign: "center" }}>
        Target 100 pada / by {data.audit.targetLabelId} · {data.audit.targetLabelEn}
      </Text>
    </Column>
  );
}

/** The score bar — progress from 0 to 100, gold fill to the score. */
export function ScoreBar({ data, barWidth = 520 }: { data: AuditData; barWidth?: number }) {
  const score = auditScore(data);
  return (
    <Column style={{ gap: 8 }}>
      <Row style={{ gap: 12, alignItems: "center" }}>
        <Text style={{ fontWeight: 700, fontSize: 14 }}>
          Skor kesiapan / Readiness score: {score}/100
        </Text>
        <Text style={{ fontWeight: 800, fontSize: 13, color: C.goldDark }}>
          {auditLevel(data).id} / {auditLevel(data).en}
        </Text>
      </Row>
      <Column
        style={{
          width: barWidth,
          height: 20,
          backgroundColor: C.track,
          borderRadius: 10,
        }}
      >
        <Column
          style={{
            width: Math.round((score / 100) * barWidth),
            height: 20,
            backgroundColor: C.gold,
            borderRadius: 10,
          }}
        />
      </Column>
      <Text style={{ fontSize: 12, color: token("colors.muted") }}>
        0 = belum mulai / not started · 40 = Berkembang / Growing · 70 = Siap Produksi /
        Ready for Production · 90 = Production Ready
      </Text>
    </Column>
  );
}

/** The six checks as a table — the same computed rows everywhere.
 *  TableCell holds Span (never Text) — the framework's rule. */
export function ChecksTable({ data }: { data: AuditData }) {
  return (
    <Table
      style={{
        cellPadding: [10, 8],
        rowBorder: { width: 1, style: "solid", color: C.border },
      }}
    >
      <TableRow header>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Cek / Check</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontWeight: 700 }}>Bobot / Weight</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontWeight: 700 }}>Hasil / Result</Span>
        </TableCell>
      </TableRow>
      {data.checks.map((c) => (
        <TableRow key={c.id}>
          <TableCell>
            <Span style={{ fontWeight: 700 }}>{c.labelId} / {c.labelEn}</Span>
            <Span style={{ fontSize: 12, color: token("colors.muted") }}> — {c.evidenceId}</Span>
          </TableCell>
          <TableCell style={{ textAlign: "right" }}>
            <Span style={{ fontFamily: MONO_FONT, fontSize: 14, fontWeight: 700 }}>{c.weight}</Span>
          </TableCell>
          <TableCell style={{ textAlign: "right" }}>
            <Span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: c.passed ? C.greenDark : C.redDark,
              }}
            >
              {c.passed ? "✓ LOLOS / PASS" : "✗ GAGAL / FAIL"}
            </Span>
          </TableCell>
        </TableRow>
      ))}
      <TableRow style={{ backgroundColor: C.navyTint }}>
        <TableCell>
          <Span style={{ fontWeight: 800 }}>Total</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontFamily: MONO_FONT, fontSize: 15, fontWeight: 800 }}>
            {data.checks.reduce((s, c) => s + c.weight, 0)}
          </Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontFamily: MONO_FONT, fontSize: 15, fontWeight: 800 }}>
            {auditScore(data)}/100
          </Span>
        </TableCell>
      </TableRow>
    </Table>
  );
}

/** The findings list — one card per failed check, with its action and
 *  the phase that fixes it. Ordered by weight, heaviest first. */
export function FindingsList({ data, limit }: { data: AuditData; limit?: number }) {
  const findings = auditFindings(data);
  const shown = limit ? findings.slice(0, limit) : findings;
  return (
    <Column style={{ gap: 12 }}>
      {shown.map((f) => (
        <Column
          key={f.checkId}
          style={{
            backgroundColor: C.redTint,
            border: `1px solid #F5C6C0`,
            borderRadius: 12,
            padding: [14, 18],
            gap: 4,
          }}
        >
          <Row style={{ gap: 10, alignItems: "center" }}>
            <Text style={{ fontWeight: 800, fontSize: 14, color: C.redDark }}>
              Temuan {f.n} / Finding {f.n}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: C.redDark }}>
              Bobot / Weight {f.weight} · Fase / Phase {f.phase}
            </Text>
          </Row>
          <Text style={{ fontSize: 15, fontWeight: 700 }}>
            {f.titleId} / {f.titleEn}
          </Text>
          <Text style={{ fontSize: 14 }}>
            Aksi / Action: {f.actionId} / {f.actionEn}
          </Text>
        </Column>
      ))}
      {limit && findings.length > limit ? (
        <Text style={{ fontSize: 13, color: token("colors.muted") }}>
          + {findings.length - limit} temuan lagi / more finding(s) — detail lengkap di roadmap
          (Bab 03) / full detail in the roadmap (Chapter 03).
        </Text>
      ) : null}
    </Column>
  );
}

/** The roadmap trajectory — score after each phase, as bars. */
export function TrajectoryBars({ data, barWidth = 440 }: { data: AuditData; barWidth?: number }) {
  return (
    <Column style={{ gap: 10 }}>
      {data.phases.map((p) => {
        const after = auditScoreAfterPhase(data, p.n);
        const hours = auditPhaseEffort(data, p.n);
        return (
          <Column key={p.n} style={{ gap: 4 }}>
            <Row style={{ gap: 8, alignItems: "center" }}>
              <Text style={{ fontWeight: 700, fontSize: 13, width: 190 }}>
                Fase {p.n} · {p.titleId} / {p.titleEn}
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 13, fontWeight: 700 }}>
                {after}/100 · +{hours} jam / h
              </Text>
            </Row>
            <Column
              style={{
                width: barWidth,
                height: 14,
                backgroundColor: C.track,
                borderRadius: 7,
              }}
            >
              <Column
                style={{
                  width: Math.round((after / 100) * barWidth),
                  height: 14,
                  backgroundColor: p.n === 4 ? C.green : C.gold,
                  borderRadius: 7,
                }}
              />
            </Column>
          </Column>
        );
      })}
      <Text style={{ fontSize: 12, color: token("colors.muted") }}>
        Total effort / Total effort: {auditTotalEffort(data)} jam / hours · Migrasi / Migration:{" "}
        {auditCoverage(data).pct.toLocaleString("id-ID", { minimumFractionDigits: 1 })}% coverage
        · {auditMigrationEffort(data)} jam / hours
      </Text>
    </Column>
  );
}

/** Small divider + "sample scenario" note used at the foot of every output. */
export function SampleNote({ data }: { data: AuditData }) {
  return (
    <Column style={{ gap: 8 }}>
      <Divider style={{ borderTop: { width: 1, style: "solid", color: "#CBD8E6" } }} />
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        AUDIT NYATA / REAL AUDIT — {data.audit.project} diaudit 20 November 2026 dari kode
        sumbernya (5 file, {data.measured.linesOfCode} baris, {data.measured.primitives.length}{" "}
        primitif). Skor, level, coverage, temuan dan effort dihitung dari audit itu — bukan
        angka contoh. / {data.audit.project} was audited on 20 November 2026 from its real
        source (5 files, {data.measured.linesOfCode} lines, {data.measured.primitives.length}{" "}
        primitives). The score, level, coverage, findings and effort are computed from that
        audit — not sample numbers.
      </Text>
    </Column>
  );
}
