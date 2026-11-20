// ---------------------------------------------------------------------------
// ADOPSI — Share Card (Chapter 07: Pengumuman / Announcement, Canvas
// 1200 x 630)
// The announcement card: "Kami pindah ke Hyper Elements" — the shareable
// proof that the team has started the move, with the audit score on it
// so the announcement is honest about where the team starts (30/100,
// Memulai) and where it is going (100, 18 Des 2026). The score, the
// level and the target date are computed from the same audit file as the
// audit email, the onboarding email, the roadmap page, the migration
// guide, the certificate and the cheat sheet. Drawn entirely in code
// (batik band, navy + gold); no image assets.
// ---------------------------------------------------------------------------

import { Canvas, Column, Row, Text } from "@hyper-elements/react";
import {
  auditLevel,
  auditScore,
  defaultData,
  type AuditData,
} from "./data.js";
import { BatikBand } from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, adopsiTheme } from "./theme.js";

export interface ShareCardProps {
  data?: AuditData;
}

function ShareCard({ data = defaultData }: ShareCardProps) {
  const score = auditScore(data);
  const level = auditLevel(data);
  return (
    <Canvas
      theme={adopsiTheme}
      fonts={PRINT_FONTS}
      title={`ADOPSI — Kami pindah ke Hyper Elements (skor ${score}/100)`}
      width={1200}
      height={630}
      lang="id"
      style={{ backgroundColor: C.navy, fontFamily: PRINT_FONT, gap: 0 }}
    >
      {/* ---- Header ---- */}
      <Column style={{ padding: [40, 64, 0, 64], gap: 14 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>
            ADOPSI
          </Text>
          <Text
            style={{
              color: C.goldBright,
              fontSize: 13,
              fontFamily: MONO_FONT,
              flex: 1,
              textAlign: "right",
            }}
          >
            BAB 07 DARI 7 · CHAPTER 07 OF 7
          </Text>
        </Row>
        <BatikBand width={1072} height={14} color={C.goldBright} />
      </Column>

      {/* ---- Message ---- */}
      <Column style={{ padding: [32, 64, 0, 64], gap: 16 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 56, fontWeight: 800, lineHeight: 1.08 }}>
          Kami pindah ke
        </Text>
        <Text style={{ color: C.goldBright, fontSize: 56, fontWeight: 800, lineHeight: 1.08 }}>
          Hyper Elements.
        </Text>
        <Text style={{ color: "#D7DEE8", fontSize: 22, lineHeight: 1.4 }}>
          We are moving to Hyper Elements. Satu template, tujuh output — dari satu file audit. /
          One template, seven outputs — from one audit file.
        </Text>
      </Column>

      {/* ---- Score strip ---- */}
      <Column style={{ padding: [36, 64, 0, 64] }}>
        <Row
          style={{
            gap: 24,
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: [18, 24],
          }}
        >
        <Column style={{ gap: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.6, color: C.muted }}>
            SKOR AWAL / STARTING SCORE
          </Text>
          <Text style={{ fontSize: 40, fontWeight: 800, fontFamily: MONO_FONT, color: C.goldDark, lineHeight: 1 }}>
            {score}/100
          </Text>
          <Text style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>
            {level.id} · {level.en}
          </Text>
        </Column>
        <Column style={{ gap: 2, flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.6, color: C.muted }}>
            TARGET / TARGET
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1.15 }}>
            100 — {data.audit.targetLabelId}
          </Text>
          <Text style={{ fontSize: 15, color: C.muted }}>
            {data.audit.project} · {data.audit.id}
          </Text>
        </Column>
        </Row>
      </Column>
    </Canvas>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(ShareCard, { PreviewProps: {} });
