// ---------------------------------------------------------------------------
// ADOPSI — Roadmap Page (Chapter 03: Roadmap / Roadmap)
// The public adoption roadmap: the score now, the four phases with their
// computed effort hours, and the score after each phase — 30 -> 55 ->
// 70 -> 85 -> 100. Every hour and every score is computed from the same
// audit file as the audit email, the onboarding email, the migration
// guide, the certificate and both cards. The page is responsive by
// design: the theme carries mobile heading sizes and the bars are fluid.
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Heading,
  Page,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  auditCoverage,
  auditMigrationEffort,
  auditPhaseEffort,
  auditScore,
  auditScoreAfterPhase,
  auditTotalEffort,
  defaultData,
  type AuditData,
} from "./data.js";
import {
  AuditBadge,
  BatikBand,
  Bi,
  ChapterMark,
  FindingsList,
  ProofStrip,
  SampleNote,
  ScoreBar,
  TrajectoryBars,
} from "./shared.js";
import { C, MONO_FONT, adopsiTheme } from "./theme.js";

export interface RoadmapPageProps {
  data?: AuditData;
}

function RoadmapPage({ data = defaultData }: RoadmapPageProps) {
  const score = auditScore(data);
  const cov = auditCoverage(data);
  return (
    <Page
      theme={adopsiTheme}
      title={`ADOPSI — Roadmap adopsi ${data.audit.project}: dari skor ${score} ke 100 dalam 4 minggu`}
      lang="id"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead ---- */}
      <Section
        tokens={{ colors: { background: C.navy, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: C.navy, padding: [32, 0, 28, 0], gap: 18 }}
      >
        <Row style={{ gap: 14, alignItems: "center" }}>
          <Column style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: 3,
              }}
            >
              ADOPSI
            </Text>
            <Text style={{ color: C.goldBright, fontSize: 14 }}>
              {data.kit.taglineId} · {data.kit.taglineEn}
            </Text>
          </Column>
        </Row>
        <BatikBand width={560} height={16} color={C.goldBright} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <AuditBadge data={data} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            {data.audit.dateLabelId} · Target {data.audit.targetLabelId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [28, 0, 8, 0], gap: 24 }}>
        <Column style={{ apply: ["card"] }}>
          <ChapterMark n={3} />
          <Heading level={1}>
            Roadmap: dari {score} ke 100 dalam 4 minggu / Roadmap: from {score} to 100 in 4 weeks
          </Heading>
          <Text>
            Audit {data.audit.project} memberi skor {score}/100 — level{" "}
            <Span style={{ fontWeight: 700 }}>{data.audit.teamId}</Span> hari ini. Roadmap ini
            bukan janji; tiap fase memperbaiki satu temuan, tiap jam dihitung dari data audit, dan
            skor setelah tiap fase juga dihitung — bukan target yang ditulis tangan. / The audit
            of {data.audit.project} scores {score}/100. This roadmap is not a promise; each
            phase fixes one finding, every hour is computed from the audit data, and the score
            after each phase is computed too — not a hand-typed target.
          </Text>
          <ScoreBar data={data} barWidth={520} />
        </Column>

        {/* Trajectory */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Lintasan skor / Score trajectory</Heading>
          <Text>
            Total effort / Total effort: {auditTotalEffort(data)} jam / hours · Coverage migrasi
            / Migration coverage: {cov.pct.toLocaleString("id-ID", { minimumFractionDigits: 1 })}%
            ({cov.mapped} dari / of {cov.total} baris / rows) · Effort migrasi / Migration
            effort: {auditMigrationEffort(data)} jam / hours
          </Text>
          <TrajectoryBars data={data} barWidth={480} />
        </Column>

        {/* Phases */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Empat fase / Four phases</Heading>
          {data.phases.map((p) => {
            const hours = auditPhaseEffort(data, p.n);
            const after = auditScoreAfterPhase(data, p.n);
            const before = auditScoreAfterPhase(data, p.n - 1);
            return (
              <Column key={p.n} style={{ gap: 0 }}>
                {p.n > 1 && (
                  <Divider
                    style={{
                      borderTop: { width: 1, style: "solid", color: token("colors.border") },
                    }}
                  />
                )}
                <Column
                  style={{
                    gap: 8,
                    padding: [16, 0],
                  }}
                >
                <Row style={{ gap: 12, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: C.goldDark }}>
                    Fase {p.n} · Phase {p.n}
                  </Text>
                  <Text style={{ fontSize: 13, color: token("colors.muted") }}>
                    {p.weekId} · {p.weekEn}
                  </Text>
                </Row>
                <Heading level={2}>
                  {p.titleId} / {p.titleEn}
                </Heading>
                <Text>{p.noteId} / {p.noteEn}</Text>
                <Row style={{ gap: 24, alignItems: "center" }}>
                  <Text style={{ fontFamily: MONO_FONT, fontSize: 15, fontWeight: 700 }}>
                    {hours} jam / hours
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>
                    Skor / Score: {before} → {after}
                  </Text>
                </Row>
                <Column
                  style={{
                    width: 480,
                    height: 14,
                    backgroundColor: C.track,
                    borderRadius: 7,
                  }}
                >
                  <Column
                    style={{
                      width: Math.round((after / 100) * 480),
                      height: 14,
                      backgroundColor: p.n === 4 ? C.green : C.gold,
                      borderRadius: 7,
                    }}
                  />
                </Column>
                </Column>
              </Column>
            );
          })}
        </Column>

        {/* Findings recap */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Yang diperbaiki tiap fase / What each phase fixes</Heading>
          <Text>
            Satu temuan, satu fase — tidak ada fase tanpa temuan, tidak ada temuan tanpa fase. /
            One finding, one phase — no phase without a finding, no finding without a phase.
          </Text>
          <FindingsList data={data} />
          <Bi
            id="Faktor effort: root baru 4 jam/root · klien email 0,5 jam/klien · fungsi hitung 1,5 jam/fungsi · output 0,5 jam/output"
            en="Effort factors: new root 4 h/root · email client 0.5 h/client · computed function 1.5 h/function · output 0.5 h/output"
            size={12}
          />
          <Button href={data.kit.siteUrl}>Unduh panduan migrasi / Download the migration guide</Button>
        </Column>

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>Satu audit, satu skor / One audit, one score</Heading>
          <ProofStrip data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [28, 0, 32, 0], gap: 24 }}>
        <BatikBand width={560} height={16} color={C.gold} />
        <Divider style={{ borderTop: { width: 1, style: "solid", color: "#CBD8E6" } }} />
        <SampleNote data={data} />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          {data.kit.name} · {data.audit.id} · {data.source}
        </Text>
      </Section>
    </Page>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(RoadmapPage, { PreviewProps: {} });
