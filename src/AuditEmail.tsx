// ---------------------------------------------------------------------------
// ADOPSI — Audit Email (Chapter 01: Hasil Audit / Audit Result)
// The email the team receives the morning after the audit: the readiness
// score, the level, the top 3 findings and the verdict. The score, the
// level and every finding are derived from the same audit file as the
// onboarding email, the roadmap page, the migration guide, the
// certificate and both cards — so the email can never disagree with any
// of them. Sender: ONE address serves both emails —
// adopsi@template-nusantara.id (a data field; edit it in data.ts and
// both emails change together).
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Email,
  Heading,
  Menu,
  MergeTag,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  auditFindings,
  auditLevel,
  auditScore,
  auditTotalEffort,
  defaultData,
  type AuditData,
} from "./data.js";
import {
  AuditBadge,
  BatikBandEmail,
  ChapterMark,
  ChecksTable,
  FindingsList,
  ProofStrip,
  SampleNote,
  ScoreBar,
} from "./shared.js";
import { C, MONO_FONT, adopsiTheme } from "./theme.js";

export interface AuditEmailProps {
  data?: AuditData;
}

function AuditEmail({ data = defaultData }: AuditEmailProps) {
  const score = auditScore(data);
  const level = auditLevel(data);
  const findings = auditFindings(data);
  return (
    <Email
      theme={adopsiTheme}
      title={`Hasil audit ${data.audit.project}: skor ${score}/100 — ${level.id} (${data.audit.id})`}
      previewText={`Audit ${data.audit.project} selesai: skor ${score}/100, level ${level.id}. ${findings.length} temuan, ${auditTotalEffort(data)} jam menuju 100.`}
      lang="id"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead: deep navy band + batik ---- */}
      <Section
        tokens={{ colors: { background: C.navy, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: C.navy, padding: [28, 0, 24, 0], gap: 16 }}
      >
        <Row style={{ gap: 14, alignItems: "center" }}>
          <Column style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: 3,
              }}
            >
              ADOPSI
            </Text>
            <Text style={{ color: C.goldBright, fontSize: 13 }}>
              {data.kit.taglineId} · {data.kit.taglineEn}
            </Text>
          </Column>
        </Row>
        <BatikBandEmail color={C.goldBright} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <AuditBadge data={data} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            {data.audit.dateLabelId} · {data.audit.teamId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        <Column style={{ apply: ["card"] }}>
          <ChapterMark n={1} />
          <Heading level={1}>
            Hasil Audit: {data.audit.project} / Audit Result: {data.audit.project}
          </Heading>
          <Text>
            Halo, <MergeTag name="first_name" /> — audit {data.audit.project} selesai. Template
            ini diaudit dari kode sumbernya sendiri (5 file, {data.measured.linesOfCode} baris,{" "}
            {data.measured.primitives.length} primitif Hyper Elements), bukan dari tebakan. / Hello,{" "}
            <MergeTag name="first_name" /> — the audit of {data.audit.project} is done. This
            template was audited from its own source code (5 files, {data.measured.linesOfCode}{" "}
            lines, {data.measured.primitives.length} Hyper Elements primitives), not from a guess.
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>
            Repo yang diaudit / Audited repo: {data.audit.projectRepo}
          </Text>
        </Column>

        {/* Score */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Skor kesiapan / Readiness score</Heading>
          <Row style={{ gap: 16, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 56,
                fontWeight: 800,
                fontFamily: MONO_FONT,
                color: C.goldDark,
                lineHeight: 1,
              }}
            >
              {score}
              <Span style={{ fontSize: 24, color: C.ink }}>/100</Span>
            </Text>
            <Column style={{ gap: 2, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>
                {level.id} · {level.en}
              </Text>
              <Text style={{ fontSize: 14 }}>
                {data.checks.filter((c) => c.passed).length} dari / of {data.checks.length} cek
                lolos / checks passed · {findings.length} temuan / findings
              </Text>
            </Column>
          </Row>
          <ScoreBar data={data} barWidth={460} />
          <Text style={{ fontSize: 14 }}>
            Skor ini rendah — dan itu jujur. Template pertama memang begitu: satu Email, tanpa
            bukti klien, tanpa test, tanpa preview. Kabar baiknya: jalannya jelas — 4 fase,{" "}
            {auditTotalEffort(data)} jam, target 100 pada {data.audit.targetLabelId}. / This
            score is low — and honest. A first template looks like this: one Email, no client
            proof, no tests, no preview. The good news: the path is clear — 4 phases,{" "}
            {auditTotalEffort(data)} hours, target 100 by {data.audit.targetLabelEn}.
          </Text>
        </Column>

        {/* Checks */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Enam cek, dua lolos / Six checks, two passed</Heading>
          <Text>
            Setiap cek punya bobot dan bukti dari kode sumber — bukan penilaian. / Every check
            has a weight and evidence from the source code — not an opinion.
          </Text>
          <ChecksTable data={data} />
        </Column>

        {/* Top findings */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>3 temuan utama / Top 3 findings</Heading>
          <Text>
            Diurutkan dari bobot terbesar — yang paling mahal kalau dibiarkan. / Ordered by
            weight — the most expensive to leave alone.
          </Text>
          <FindingsList data={data} limit={3} />
          <Button href={data.kit.siteUrl}>Lihat roadmap 4 fase / See the 4-phase roadmap</Button>
        </Column>

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu audit, satu skor / One audit, one score</Heading>
          <ProofStrip data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 24 }}>
        <BatikBandEmail />
        <Menu
          items={[
            { text: "Roadmap adopsi / Adoption roadmap", href: data.kit.siteUrl },
            { text: "Panduan migrasi / Migration guide", href: data.kit.siteUrl },
            { text: "Berhenti berlangganan / Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          Dikirim dari / Sent from {data.kit.senderEmail} — satu alamat pengirim untuk kedua
          email kit ini / one sender address for both emails in this kit. Anda menerima email
          ini karena Anda anggota {data.audit.teamId}. / You received this email because you
          are a member of the {data.audit.teamEn}.
        </Text>
        <SampleNote data={data} />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {data.kit.name} · {data.audit.id} · {data.source}
        </Text>
      </Section>
    </Email>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(AuditEmail, { PreviewProps: {} });
