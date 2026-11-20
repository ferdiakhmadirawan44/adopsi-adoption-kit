// ---------------------------------------------------------------------------
// ADOPSI — Readiness Certificate (Chapter 05: Sertifikat / Certificate,
// Document root #2 — A4, one page)
// The certificate the team prints and pins up: the project, the audit
// date, the score and the level, with the gold seal. It states the score
// honestly — 30/100, "Memulai" — because the certificate is a snapshot
// of the audit, not a trophy. The score and level are computed from the
// same audit file as the audit email, the onboarding email, the roadmap
// page, the migration guide and both cards.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Document,
  Heading,
  Row,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  auditLevel,
  auditScore,
  defaultData,
  type AuditData,
} from "./data.js";
import { AuditBadge, BatikBand, ChapterMark, GoldSeal } from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, adopsiTheme } from "./theme.js";

export interface CertificatePdfProps {
  data?: AuditData;
}

function CertificatePdf({ data = defaultData }: CertificatePdfProps) {
  const score = auditScore(data);
  const level = auditLevel(data);
  return (
    <Document
      theme={adopsiTheme}
      fonts={PRINT_FONTS}
      title={`ADOPSI — Sertifikat kesiapan ${data.audit.project} (skor ${score}/100)`}
      size="A4"
      orientation="portrait"
      lang="id"
      style={{ fontFamily: PRINT_FONT, fontSize: 13 }}
    >
      <Document.Page style={{ gap: 16 }}>
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
        </Column>

        <ChapterMark n={5} />

        <Column style={{ gap: 10, alignItems: "center" }}>
          <Heading level={3}>Sertifikat Kesiapan Adopsi</Heading>
          <Heading level={1} style={{ textAlign: "center" }}>
            Adoption Readiness Certificate
          </Heading>
          <Text style={{ textAlign: "center", color: token("colors.muted") }}>
            Diberikan kepada / Awarded to
          </Text>
          <Text style={{ fontSize: 22, fontWeight: 800, color: C.navy, textAlign: "center" }}>
            {data.audit.teamId}
          </Text>
          <Text style={{ fontSize: 14, textAlign: "center" }}>
            atas audit template / for the audit of the template
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: MONO_FONT,
              color: C.navy,
              textAlign: "center",
            }}
          >
            {data.audit.project}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted"), textAlign: "center" }}>
            {data.audit.projectRepo}
          </Text>
        </Column>

        <Column style={{ gap: 6, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 64,
              fontWeight: 800,
              fontFamily: MONO_FONT,
              color: C.goldDark,
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {score}
            <Span style={{ fontSize: 28, color: C.ink }}>/100</Span>
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 800, color: C.navy, textAlign: "center" }}>
            {level.id} · {level.en}
          </Text>
          <Text style={{ fontSize: 13, textAlign: "center" }}>
            {data.checks.filter((c) => c.passed).length} dari / of {data.checks.length} cek
            lolos / checks passed · Audit {data.audit.dateLabelId} · Target 100 pada / by{" "}
            {data.audit.targetLabelId}
          </Text>
        </Column>

        <Row style={{ gap: 24, alignItems: "center" }}>
          <GoldSeal size={84} bg="#FFFFFF" />
          <Column style={{ gap: 2, flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 700 }}>
              Skor ini adalah foto audit — bukan trofi. / This score is an audit snapshot —
              not a trophy.
            </Text>
            <Text style={{ fontSize: 13, color: token("colors.muted") }}>
              Sertifikat ini menyatakan posisi {data.audit.project} pada{" "}
              {data.audit.dateLabelId}. Roadmap 4 fase (Bab 03) membawa skor ini ke 100 pada{" "}
              {data.audit.targetLabelId}. / This certificate states where {data.audit.project}{" "}
              stood on {data.audit.dateLabelEn}. The 4-phase roadmap (Chapter 03) takes this
              score to 100 by {data.audit.targetLabelEn}.
            </Text>
          </Column>
        </Row>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />

        <Row style={{ gap: 24 }}>
          <Column style={{ gap: 2, flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 700 }}>Auditor / Auditor</Text>
            <Text style={{ fontSize: 13 }}>{data.audit.auditorId} · {data.audit.auditorEn}</Text>
            <Text style={{ fontSize: 12, color: token("colors.muted") }}>{data.audit.id}</Text>
          </Column>
          <Column style={{ gap: 2, flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: 700 }}>Tim / Team</Text>
            <Text style={{ fontSize: 13 }}>{data.audit.teamId}</Text>
            <Text style={{ fontSize: 12, color: token("colors.muted") }}>{data.audit.teamEn}</Text>
          </Column>
        </Row>

        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          {data.audit.id} · {data.source} · Skor, level dan tanggal di sertifikat ini sama
          dengan di semua output kit / The score, level and date on this certificate match
          every output in the kit.
        </Text>
      </Document.Page>
    </Document>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(CertificatePdf, { PreviewProps: {} });
