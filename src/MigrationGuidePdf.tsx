// ---------------------------------------------------------------------------
// ADOPSI — Migration Guide PDF (Chapter 04: Panduan Migrasi / Migration
// Guide, Document root #1)
// The printable migration guide for one team: the coverage summary, the
// full MJML / React Email -> Hyper Elements mapping table (25 rows), and
// the findings checklist. The coverage (84,0%), the row counts and the
// effort hours are computed from the same audit file as the audit email,
// the onboarding email, the roadmap page, the certificate and both cards
// — the PDF can never disagree with the roadmap on a reader's screen.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Document,
  Heading,
  PageNumber,
  Row,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  auditCoverage,
  auditFindings,
  auditMigrationEffort,
  auditScore,
  auditTotalEffort,
  defaultData,
  type AuditData,
} from "./data.js";
import {
  AuditBadge,
  BatikBand,
  ChapterMark,
  ProofStrip,
  SampleNote,
} from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, adopsiTheme } from "./theme.js";

export interface MigrationGuidePdfProps {
  data?: AuditData;
}

function statusLabel(status: "mapped" | "partial" | "manual"): { id: string; en: string; color: string } {
  if (status === "mapped") return { id: "TERPETAKAN", en: "MAPPED", color: C.greenDark };
  if (status === "partial") return { id: "SEBAGIAN", en: "PARTIAL", color: C.goldDark };
  return { id: "MANUAL", en: "MANUAL", color: C.redDark };
}

function MappingTable({
  data,
  kind,
}: {
  data: AuditData;
  kind: "MJML" | "React Email";
}) {
  const rows = data.mapping.filter((r) => r.sourceKind === kind);
  return (
    <Table
      style={{
        cellPadding: [8, 8],
        rowBorder: { width: 1, style: "solid", color: C.border },
      }}
    >
      <TableRow header>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Sumber / Source ({kind})</Span>
        </TableCell>
        <TableCell>
          <Span style={{ fontWeight: 700 }}>Hyper Elements</Span>
        </TableCell>
        <TableCell style={{ textAlign: "right" }}>
          <Span style={{ fontWeight: 700 }}>Status</Span>
        </TableCell>
      </TableRow>
      {rows.map((r) => {
        const s = statusLabel(r.status);
        return (
          <TableRow key={r.source}>
            <TableCell>
              <Span style={{ fontWeight: 700, fontFamily: MONO_FONT, fontSize: 12 }}>{r.source}</Span>
              <Span style={{ fontSize: 11, color: token("colors.muted") }}> — {r.noteId}</Span>
            </TableCell>
            <TableCell>
              <Span style={{ fontFamily: MONO_FONT, fontSize: 12, fontWeight: 700 }}>{r.target}</Span>
            </TableCell>
            <TableCell style={{ textAlign: "right" }}>
              <Span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>
                {s.id} / {s.en}
              </Span>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
}

function MigrationGuidePdf({ data = defaultData }: MigrationGuidePdfProps) {
  const cov = auditCoverage(data);
  const findings = auditFindings(data);
  return (
    <Document
      theme={adopsiTheme}
      fonts={PRINT_FONTS}
      title={`ADOPSI — Panduan migrasi ${data.audit.project} (${data.audit.id})`}
      size="A4"
      orientation="portrait"
      lang="id"
      style={{ fontFamily: PRINT_FONT, fontSize: 13 }}
    >
      {/* ================= Page 1: cover + coverage ================= */}
      <Document.Page style={{ gap: 14 }}>
        <Column
          style={{ backgroundColor: C.navy, borderRadius: 10, padding: 20, gap: 8 }}
        >
          <Row style={{ gap: 12, alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
              ADOPSI
            </Text>
            <AuditBadge data={data} />
          </Row>
          <BatikBand width={480} height={14} color={C.goldBright} />
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            Panduan Migrasi / Migration Guide
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
            {data.audit.project} · {data.audit.teamId} · {data.audit.dateLabelId}
          </Text>
        </Column>

        <ChapterMark n={4} />

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Coverage migrasi / Migration coverage</Heading>
          <Text style={{ fontSize: 15 }}>
            Dari / Of {cov.total} konsep sumber, <Span style={{ fontWeight: 800 }}>{cov.mapped} terpetakan langsung / mapped directly</Span>,{" "}
            {cov.partial} sebagian / partial, {cov.manual} manual. Coverage:{" "}
            <Span style={{ fontWeight: 800, fontFamily: MONO_FONT }}>
              {cov.pct.toLocaleString("id-ID", { minimumFractionDigits: 1 })}%
            </Span>{" "}
            · Effort migrasi / Migration effort:{" "}
            <Span style={{ fontWeight: 800 }}>{auditMigrationEffort(data)} jam / hours</Span>
          </Text>
          <Text style={{ fontSize: 14 }}>
            Cara membaca / How to read: TERPETAKAN = ganti satu-ke-satu; SEBAGIAN = ada
            padanannya tapi perlu penyesuaian; MANUAL = tidak ada jalan pintas, tulis ulang
            dengan primitif. / MAPPED = swap one-to-one; PARTIAL = an equivalent exists but
            needs adjustment; MANUAL = no shortcut, rewrite with primitives.
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Faktor effort / Effort factors</Heading>
          <Text>
            Terpetakan / Mapped: 0,5 jam/baris · Sebagian / Partial: 1,5 jam/baris · Manual: 3
            jam/baris. Total {auditMigrationEffort(data)} jam dihitung dari tabel di halaman
            berikut — bukan perkiraan. / Mapped: 0.5 h/row · Partial: 1.5 h/row · Manual: 3
            h/row. The {auditMigrationEffort(data)}-hour total is computed from the tables on
            the following pages — not an estimate.
          </Text>
          <Text>
            Roadmap penuh / Full roadmap: 4 fase, {auditTotalEffort(data)} jam, skor{" "}
            {auditScore(data)} → 100 pada {data.audit.targetLabelId}. Detail tiap fase ada di
            halaman roadmap (Bab 03). / 4 phases, {auditTotalEffort(data)} hours, score{" "}
            {auditScore(data)} → 100 by {data.audit.targetLabelEn}. Each phase is detailed on
            the roadmap page (Chapter 03).
          </Text>
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.audit.id} · {data.audit.project}
        </Text>
      </Document.Page>

      {/* ================= Page 2: MJML table ================= */}
      <Document.Page style={{ gap: 12 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2} style={{ fontFamily: PRINT_FONT }}>
            MJML → Hyper Elements
          </Heading>
          <Text style={{ color: token("colors.muted") }}>
            13 konsep MJML — {data.mapping.filter((r) => r.sourceKind === "MJML" && r.status === "mapped").length}{" "}
            terpetakan, {data.mapping.filter((r) => r.sourceKind === "MJML" && r.status === "partial").length}{" "}
            sebagian. / 13 MJML concepts.
          </Text>
          <MappingTable data={data} kind="MJML" />
        </Column>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.audit.id}
        </Text>
      </Document.Page>

      {/* ================= Page 3: React Email table ================= */}
      <Document.Page style={{ gap: 12 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2} style={{ fontFamily: PRINT_FONT }}>
            React Email → Hyper Elements
          </Heading>
          <Text style={{ color: token("colors.muted") }}>
            12 konsep React Email — {data.mapping.filter((r) => r.sourceKind === "React Email" && r.status === "mapped").length}{" "}
            terpetakan, {data.mapping.filter((r) => r.sourceKind === "React Email" && r.status === "partial").length}{" "}
            sebagian, {data.mapping.filter((r) => r.sourceKind === "React Email" && r.status === "manual").length}{" "}
            manual. / 12 React Email concepts.
          </Text>
          <MappingTable data={data} kind="React Email" />
        </Column>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.audit.id}
        </Text>
      </Document.Page>

      {/* ================= Page 4: checklist + proof ================= */}
      <Document.Page style={{ gap: 12 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2}>Checklist temuan / Findings checklist</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Setiap temuan dari audit punya satu fase. Centang saat selesai — skor naik
            mengikuti bobotnya. / Every audit finding has one phase. Tick it off when done —
            the score rises by its weight.
          </Text>
          {findings.map((f) => (
            <Row key={f.checkId} style={{ gap: 10, alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>☐</Text>
              <Column style={{ gap: 2, flex: 1 }}>
                <Text style={{ fontWeight: 700, fontSize: 14 }}>
                  Temuan {f.n}: {f.titleId} / {f.titleEn} — bobot / weight {f.weight}
                </Text>
                <Text style={{ fontSize: 13 }}>
                  {f.actionId} / {f.actionEn} · Fase / Phase {f.phase}
                </Text>
              </Column>
            </Row>
          ))}
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={3}>Satu audit, satu skor / One audit, one score</Heading>
          <ProofStrip data={data} />
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <SampleNote data={data} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · {data.source} · {data.audit.id}
        </Text>
      </Document.Page>
    </Document>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(MigrationGuidePdf, { PreviewProps: {} });
