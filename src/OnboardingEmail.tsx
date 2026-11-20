// ---------------------------------------------------------------------------
// ADOPSI — Onboarding Email (Chapter 02: Minggu Pertama / First Week)
// The email the dev team receives on the Monday after the audit: the
// week-1 plan, day by day, with the result each day should produce —
// and the score jump the week is worth (30 -> 55). The plan, the dates
// and the score jump are all derived from the same audit file as the
// audit email, the roadmap page, the migration guide, the certificate
// and both cards. Sender: ONE address serves both emails —
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
  auditPhaseEffort,
  auditScore,
  auditScoreAfterPhase,
  defaultData,
  type AuditData,
} from "./data.js";
import {
  AuditBadge,
  BatikBandEmail,
  ChapterMark,
  ProofStrip,
  SampleNote,
} from "./shared.js";
import { C, MONO_FONT, adopsiTheme } from "./theme.js";

export interface OnboardingEmailProps {
  data?: AuditData;
}

function OnboardingEmail({ data = defaultData }: OnboardingEmailProps) {
  const score = auditScore(data);
  const afterWeek1 = auditScoreAfterPhase(data, 1);
  const hours = auditPhaseEffort(data, 1);
  return (
    <Email
      theme={adopsiTheme}
      title={`Minggu pertama adopsi ${data.audit.project}: dari skor ${score} ke ${afterWeek1} dalam ${hours} jam`}
      previewText={`Minggu pertama: 5 hari, ${hours} jam, skor ${score} ke ${afterWeek1}. Senin setup, Jumat review — ini rencananya.`}
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
            {data.phases[0].weekId}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        <Column style={{ apply: ["card"] }}>
          <ChapterMark n={2} />
          <Heading level={1}>
            Minggu Pertama: dari {score} ke {afterWeek1} / First Week: from {score} to{" "}
            {afterWeek1}
          </Heading>
          <Text>
            Halo, <MergeTag name="first_name" /> — minggu ini kita tidak membahas teori. Lima
            hari, {hours} jam kerja, satu fase selesai: template yang tadinya cuma satu Email
            menjadi multi-root. / Hello, <MergeTag name="first_name" /> — this week we skip the
            theory. Five days, {hours} hours of work, one phase done: the template that used to
            be a single Email becomes multi-root.
          </Text>
          <Text style={{ fontSize: 14 }}>
            Fase 1 — {data.phases[0].titleId} / {data.phases[0].titleEn} ·{" "}
            {data.phases[0].weekId} · {hours} jam / hours · Skor {score} → {afterWeek1}
          </Text>
        </Column>

        {/* Day by day */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Hari demi hari / Day by day</Heading>
          {data.week1.map((d, i) => (
            <Column key={d.dayId} style={{ gap: 0 }}>
              {i > 0 && (
                <Divider
                  style={{
                    borderTop: { width: 1, style: "solid", color: token("colors.border") },
                  }}
                />
              )}
              <Column
                style={{
                  gap: 4,
                  padding: [12, 0],
                }}
              >
              <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: C.goldDark }}>
                {d.dayId} · {d.dayEn}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: 700 }}>{d.taskId}</Text>
              <Text style={{ fontSize: 14, color: token("colors.muted") }}>{d.taskEn}</Text>
              <Text style={{ fontSize: 14 }}>
                Hasil / Result: <Span style={{ fontWeight: 700 }}>{d.resultId}</Span> /{" "}
                {d.resultEn}
              </Text>
              </Column>
            </Column>
          ))}
        </Column>

        {/* What to bring */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Yang perlu disiapkan / What to bring</Heading>
          <Text>
            Satu repo ({data.audit.projectRepo}), satu terminal, dan audit ini — skor{" "}
            {score}/100 ada di semua output kit, jadi tidak ada yang bisa salah paham soal
            posisi kita sekarang. / One repo ({data.audit.projectRepo}), one terminal, and this
            audit — the {score}/100 score is on every output in the kit, so nobody can
            misunderstand where we stand.
          </Text>
          <Text style={{ fontSize: 14 }}>
            Aturan main / Ground rule: tidak ada angka yang diketik tangan di template — skor,
            coverage dan effort selalu dihitung dari file audit. Kalau angkanya berubah, semua
            output berubah. / Ground rule: no number is ever typed by hand in a template —
            score, coverage and effort are always computed from the audit file. If the number
            changes, every output changes.
          </Text>
          <Button href={data.kit.siteUrl}>Buka roadmap lengkap / Open the full roadmap</Button>
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
            { text: "Hasil audit / Audit result", href: data.kit.siteUrl },
            { text: "Roadmap adopsi / Adoption roadmap", href: data.kit.siteUrl },
            { text: "Berhenti berlangganan / Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          Dikirim dari / Sent from {data.kit.senderEmail} — satu alamat pengirim untuk kedua
          email kit ini / one sender address for both emails in this kit.
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
export default Object.assign(OnboardingEmail, { PreviewProps: {} });
