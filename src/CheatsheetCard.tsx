// ---------------------------------------------------------------------------
// ADOPSI — Cheat-Sheet Card (Chapter 06: Cheat Sheet / Cheat Sheet,
// Canvas 1080 x 1080)
// The fridge-door card: the ten Hyper Elements commands and components a
// developer reaches for every day, with a one-line bilingual label each.
// All ten rows come from the audit file — the same list the migration
// guide and the roadmap point at — so the card can never disagree with
// the guide. Drawn entirely in code (batik band, navy + gold); no image
// assets.
// ---------------------------------------------------------------------------

import { Canvas, Column, Row, Text } from "@hyper-elements/react";
import { auditScore, defaultData, type AuditData } from "./data.js";
import { BatikBand } from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, adopsiTheme } from "./theme.js";

export interface CheatsheetCardProps {
  data?: AuditData;
}

function CheatsheetCard({ data = defaultData }: CheatsheetCardProps) {
  return (
    <Canvas
      theme={adopsiTheme}
      fonts={PRINT_FONTS}
      title={`ADOPSI — Cheat sheet Hyper Elements (${data.audit.id})`}
      width={1080}
      height={1080}
      lang="id"
      style={{ backgroundColor: C.parchment, fontFamily: PRINT_FONT, gap: 0 }}
    >
      {/* ---- Header ---- */}
      <Column style={{ padding: [28, 56, 0, 56], gap: 10 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ color: C.navy, fontSize: 28, fontWeight: 800, letterSpacing: 4 }}>
            ADOPSI
          </Text>
          <Text
            style={{
              color: C.goldDark,
              fontSize: 13,
              fontFamily: MONO_FONT,
              flex: 1,
              textAlign: "right",
            }}
          >
            BAB 06 DARI 7 · CHAPTER 06 OF 7
          </Text>
        </Row>
        <BatikBand width={968} height={16} color={C.gold} />
        <Text style={{ color: C.navy, fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
          Cheat Sheet
        </Text>
        <Text style={{ color: C.muted, fontSize: 17, fontWeight: 700 }}>
          10 hal yang dipakai tiap hari / 10 things you reach for every day
        </Text>
      </Column>

      {/* ---- The ten rows ---- */}
      <Column style={{ padding: [12, 56, 0, 56], gap: 7 }}>
        {data.cheatsheet.map((row, i) => (
          <Row
            key={row.command}
            style={{
              gap: 14,
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: [7, 14],
            }}
          >
            <Text
              style={{
                fontSize: 19,
                fontWeight: 800,
                fontFamily: MONO_FONT,
                color: C.goldDark,
                width: 40,
                textAlign: "center",
              }}
            >
              {i + 1}
            </Text>
            <Column style={{ gap: 1, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 800, fontFamily: MONO_FONT, color: C.navy }}>
                {row.command}
              </Text>
              <Text style={{ fontSize: 14, color: C.muted }}>
                {row.labelId} / {row.labelEn}
              </Text>
            </Column>
          </Row>
        ))}
      </Column>

      {/* ---- Footer ---- */}
      <Column style={{ padding: [12, 56, 24, 56], gap: 4 }}>
        <Text style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>
          {data.audit.id} · {data.audit.project} · Skor / Score {auditScore(data)}/100 — satu
          audit, satu skor / one audit, one score
        </Text>
      </Column>
    </Canvas>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(CheatsheetCard, { PreviewProps: {} });
