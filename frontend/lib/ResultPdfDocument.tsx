import { Document, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { AiRisk, CareerFitItem, RejectedCareer, Result } from "@/lib/types";
import { SECTION_TITLES } from "@/lib/sectionTitles";
import { buildTraitDonutSlices } from "@/lib/traitDonutPaths";

const TRAIT_COLORS = ["#F5A623", "#FFD666", "#22C55E", "#F5A623"];

/** Aligned to [index.css](index.css) :root — matches dashboard “glass” look. */
const C = {
  page: "#0b1437",
  cardGlass: "#1c2a4a",
  /** Matches [index.css](index.css) `--glass-outline` card rim */
  border: "rgba(96, 165, 250, 0.45)",
  muted: "#a0aec0",
  white: "#ffffff",
  gold: "#f5a623",
  success: "#22c55e",
  destructive: "#e05252",
  secondaryMuted: "rgba(47, 65, 104, 0.55)",
  roleBg: "rgba(47, 65, 104, 0.35)",
  summaryBg: "rgba(11, 20, 55, 0.45)",
};

/** ~Tailwind space-y-8 (32px) between major dashboard sections */
const SECTION_GAP = 24;
/** Equal gutter between Career fit columns (tracks trait row rhythm) */
const CAREER_COLUMN_GAP = 14;
const PAD_CARD = 14;
const RADIUS_LG = 14;
const RADIUS_MD = 8;

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.page,
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 22,
    fontFamily: "Helvetica",
    color: C.white,
  },
  flowRoot: {
    width: "100%",
    flexDirection: "column",
  },
  glassCard: {
    backgroundColor: C.cardGlass,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: RADIUS_LG,
    padding: PAD_CARD,
  },
  glassCardTight: {
    backgroundColor: C.cardGlass,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: RADIUS_LG,
    padding: 12,
  },
  cardPrimary: {
    backgroundColor: C.cardGlass,
    borderWidth: 1.5,
    borderColor: "rgba(245, 166, 35, 0.55)",
    borderRadius: RADIUS_LG,
    padding: PAD_CARD,
    width: "100%",
  },
  cardSecondary: {
    backgroundColor: C.cardGlass,
    borderWidth: 1.2,
    borderColor: "rgba(160, 174, 192, 0.35)",
    borderRadius: RADIUS_LG,
    padding: PAD_CARD,
    width: "100%",
  },
  /** Equal split columns — flexBasis 0 + stretch so both cards stay same height/width rhythm */
  careerCol: {
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 1,
    minWidth: 0,
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "column",
  },
  careerCardStretch: {
    flexGrow: 1,
    width: "100%",
  },
  labelXs: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: C.muted,
    marginBottom: 5,
  },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 5, letterSpacing: -0.3 },
  sub: { fontSize: 10.5, color: C.muted, lineHeight: 1.45 },
  h3: {
    fontSize: 13.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: C.white,
    letterSpacing: -0.2,
  },
  traitPct: { fontSize: 19, fontFamily: "Helvetica-Bold", color: C.gold, marginBottom: 6 },
  barTrack: {
    height: 5,
    backgroundColor: C.secondaryMuted,
    borderRadius: 3,
    width: "100%",
  },
  barFill: {
    height: "100%",
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  donutLabel: {
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 5,
    textAlign: "center",
  },
  donutLegend: {
    marginTop: 5,
    width: "100%",
    paddingHorizontal: 2,
  },
  donutLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    width: "100%",
  },
  donutLegendSwatch: {
    width: 6,
    height: 6,
    borderRadius: 2,
    marginRight: 6,
  },
  donutLegendName: {
    fontSize: 8,
    color: C.white,
    flex: 1,
    minWidth: 0,
    textTransform: "capitalize",
  },
  donutLegendPct: {
    fontSize: 8,
    color: C.muted,
    marginLeft: 4,
    fontFamily: "Helvetica-Bold",
  },
  readinessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  readinessScore: { fontSize: 26, fontFamily: "Helvetica-Bold" },
  readinessLbl: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.85,
    color: C.muted,
    maxWidth: 100,
  },
  sectionList: {
    backgroundColor: C.cardGlass,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: RADIUS_LG,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
  },
  sectionLetterBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: C.gold,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLetterTxt: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.page },
  fitPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.75,
    fontSize: 8,
    textTransform: "capitalize",
    fontFamily: "Helvetica-Bold",
  },
  riskPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.65,
    alignSelf: "flex-start",
    gap: 5,
  },
  riskDot: { width: 5, height: 5, borderRadius: 3 },
  tierLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.muted,
    marginBottom: 5,
  },
  careerTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4, letterSpacing: -0.2 },
  matchLine: { fontSize: 10, color: C.muted, marginBottom: 10 },
  degreeBox: {
    backgroundColor: C.secondaryMuted,
    borderRadius: RADIUS_MD,
    padding: 10,
    flex: 1,
  },
  roleBox: {
    backgroundColor: C.roleBg,
    borderRadius: RADIUS_MD,
    padding: 10,
    marginBottom: 8,
    width: "100%",
  },
  rejectedCard: {
    backgroundColor: C.cardGlass,
    borderLeftWidth: 4,
    borderLeftColor: C.destructive,
    borderWidth: 0.75,
    borderColor: C.border,
    borderRadius: RADIUS_LG,
    padding: 14,
    marginBottom: 10,
    width: "48%",
    maxWidth: "48%",
  },
  flagBox: {
    borderWidth: 0.75,
    borderColor: "rgba(224, 89, 82, 0.45)",
    borderLeftWidth: 4,
    borderLeftColor: C.destructive,
    backgroundColor: "rgba(224, 82, 82, 0.08)",
    borderRadius: RADIUS_MD,
    padding: 12,
    marginBottom: 8,
  },
  summaryOuter: {
    borderWidth: 1.5,
    borderColor: "rgba(245, 166, 35, 0.5)",
    backgroundColor: C.summaryBg,
    borderRadius: RADIUS_LG,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: C.muted,
    marginBottom: 8,
  },
  summaryBody: { fontSize: 11, lineHeight: 1.55, fontFamily: "Helvetica-Oblique", color: C.white },
});

function readinessStyle(score: number) {
  if (score >= 75)
    return { borderColor: "rgba(34, 197, 94, 0.45)", bg: "rgba(34, 197, 94, 0.12)", scoreColor: C.success };
  if (score >= 50)
    return { borderColor: "rgba(245, 166, 35, 0.55)", bg: "rgba(245, 166, 35, 0.14)", scoreColor: C.gold };
  return {
    borderColor: "rgba(59, 130, 246, 0.55)",
    bg: "rgba(59, 130, 246, 0.14)",
    scoreColor: "#60a5fa",
  };
}

function riskPallet(r: AiRisk): { bd: string; dot: string; txt: string } {
  switch (r) {
    case "safe":
      return { bd: "rgba(34, 197, 94, 0.45)", dot: C.success, txt: C.white };
    case "at-risk":
      return { bd: "rgba(245, 166, 35, 0.45)", dot: C.gold, txt: C.white };
    default:
      return { bd: "rgba(224, 82, 82, 0.45)", dot: C.destructive, txt: C.white };
  }
}

function FitPill({ fit }: { fit: string }) {
  let border = "rgba(245, 166, 35, 0.35)";
  let color = C.gold;
  if (fit === "Strong") {
    border = "rgba(34, 197, 94, 0.45)";
    color = C.success;
  }
  if (fit === "Weak") {
    border = "rgba(224, 82, 82, 0.45)";
    color = C.destructive;
  }
  return (
    <Text style={[styles.fitPill, { borderColor: border, backgroundColor: `${color}18`, color }]}>
      {fit}
    </Text>
  );
}

function RiskPillPdf({ risk, label }: { risk: AiRisk; label: string }) {
  const p = riskPallet(risk);
  return (
    <View style={[styles.riskPill, { borderColor: p.bd }]}>
      <View style={[styles.riskDot, { backgroundColor: p.dot }]} />
      <Text style={{ fontSize: 9, color: p.txt }}>{label}</Text>
    </View>
  );
}

function TraitDonutPdf({
  traitData,
  colors,
}: {
  traitData: { name: string; value: number }[];
  colors: string[];
}) {
  const size = 150;
  const slices = buildTraitDonutSlices(traitData, colors, size);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s) => (
        <Path key={s.key} d={s.path} fill={s.fill} stroke="#0f1a42" strokeWidth={2} />
      ))}
    </Svg>
  );
}

function TraitDonutLegendPdf({
  traitData,
  colors,
}: {
  traitData: { name: string; value: number }[];
  colors: string[];
}) {
  return (
    <View style={styles.donutLegend}>
      <Text style={[styles.labelXs, { marginBottom: 3, fontSize: 8, letterSpacing: 0.85 }]}>Categories</Text>
      {traitData.map((t, i) => (
        <View key={t.name} style={styles.donutLegendRow} wrap={false}>
          <View style={[styles.donutLegendSwatch, { backgroundColor: colors[i % colors.length] }]} />
          <Text style={styles.donutLegendName}>{t.name}</Text>
          <Text style={styles.donutLegendPct}>{t.value}%</Text>
        </View>
      ))}
    </View>
  );
}

function CareerPdf({ item, tier }: { item: CareerFitItem; tier: "primary" | "secondary" }) {
  const cardStyle = tier === "primary" ? styles.cardPrimary : styles.cardSecondary;
  return (
    <View style={[cardStyle, styles.careerCardStretch]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.tierLabel}>{tier === "primary" ? "Primary fit" : "Secondary fit"}</Text>
          <Text style={styles.careerTitle}>{item.career}</Text>
          <Text style={styles.matchLine}>{item.matchPercent}% match</Text>
        </View>
        {item.jobRoles[0] ? (
          <RiskPillPdf risk={item.jobRoles[0].aiRisk} label={item.jobRoles[0].riskLabel} />
        ) : null}
      </View>
      {(item.ugDegrees.length > 0 || item.pgDegrees.length > 0) && (
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
          {item.ugDegrees.length > 0 ? (
            <View style={styles.degreeBox}>
              <Text style={[styles.labelXs, { marginBottom: 3 }]}>Undergraduate</Text>
              <Text style={{ fontSize: 10 }}>{item.ugDegrees.join(", ")}</Text>
            </View>
          ) : null}
          {item.pgDegrees.length > 0 ? (
            <View style={styles.degreeBox}>
              <Text style={[styles.labelXs, { marginBottom: 3 }]}>Postgraduate</Text>
              <Text style={{ fontSize: 10 }}>{item.pgDegrees.join(", ")}</Text>
            </View>
          ) : null}
        </View>
      )}
      <Text style={[styles.labelXs, { marginTop: 8, marginBottom: 6 }]}>Sample roles</Text>
      {item.jobRoles.map((role) => (
        <View key={role.title} style={styles.roleBox}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", flex: 1, paddingRight: 8 }}>{role.title}</Text>
            <RiskPillPdf risk={role.aiRisk} label={role.riskLabel} />
          </View>
          <Text style={{ fontSize: 9.5, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>
            <Text style={{ color: C.white, fontFamily: "Helvetica-Bold" }}>What AI is doing:</Text>
            {" "}
            {role.whatAiIsDoing}
          </Text>
          <Text style={{ fontSize: 9.5, marginTop: 5, color: C.success, lineHeight: 1.45 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: C.success }}>What you should do:</Text>
            {" "}
            {role.whatStudentShouldDo}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Portrait A4. Page 1: readiness → traits → section scores. Page 2+: Career fit through
 * summary (wrapped). Order matches [ResultDashboard.tsx](ResultDashboard.tsx).
 */
export default function ResultPdfDocument({ result }: { result: Result }) {
  const traitData = Object.entries(result.traitScores).map(([name, value]) => ({ name, value }));
  const rs = readinessStyle(result.aiReadinessIndex);
  const rl =
    result.aiReadinessIndex >= 75 ? "Highly future-ready" : result.aiReadinessIndex >= 50 ? "Adaptable" : "Needs strengthening";

  return (
    <Document title={`Steps Guidance — ${result.userName}`} author="Steps Guidance" subject="Career assessment result">
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.flowRoot}>
          {/* 1 — AI Readiness header (glass-card) */}
          <View style={[styles.glassCard, { marginBottom: SECTION_GAP }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <View style={{ flex: 1, paddingRight: 14 }}>
                <Text style={[styles.labelXs, { letterSpacing: 1.2 }]}>AI Readiness Index</Text>
                <Text style={styles.name}>{result.userName}</Text>
                <Text style={styles.sub}>
                  Ambiguity: {result.behaviourProfile.ambiguity} · Discipline: {result.behaviourProfile.discipline} · Risk
                  appetite: {result.behaviourProfile.riskAppetite}
                </Text>
              </View>
              <View style={[styles.readinessRow, { borderColor: rs.borderColor, backgroundColor: rs.bg }]}>
                <Text style={[styles.readinessScore, { color: rs.scoreColor }]}>{result.aiReadinessIndex}%</Text>
                <Text style={styles.readinessLbl}>{rl}</Text>
              </View>
            </View>
          </View>

          {/* 2 — Trait grid + donut (lg: 2/3 + 1/3) */}
          <View style={{ flexDirection: "row", gap: 14, alignItems: "stretch", marginBottom: SECTION_GAP }}>
            <View style={{ flex: 2, flexDirection: "row", gap: 10 }}>
              {traitData.map((trait) => (
                <View key={trait.name} style={[styles.glassCardTight, { flex: 1, minWidth: 0 }]}>
                  <Text style={styles.labelXs}>{trait.name}</Text>
                  <Text style={styles.traitPct}>{trait.value}%</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${trait.value}%` }]} />
                  </View>
                </View>
              ))}
            </View>
            <View
              style={[
                styles.glassCardTight,
                {
                  flex: 1,
                  minWidth: 118,
                  maxWidth: 220,
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                },
              ]}>
              <Text style={styles.donutLabel}>Trait distribution</Text>
              <View style={{ alignItems: "center", width: "100%" }}>
                <TraitDonutPdf traitData={traitData} colors={TRAIT_COLORS} />
              </View>
              <TraitDonutLegendPdf traitData={traitData} colors={TRAIT_COLORS} />
            </View>
          </View>

          {/* 3 — Section scores */}
          <View style={{ marginBottom: SECTION_GAP }}>
            <Text style={styles.h3}>Section scores</Text>
            <View style={styles.sectionList}>
              {result.sectionScores.map((section, idx, arr) => (
                <View
                  key={section.section}
                  style={[styles.sectionRow, idx === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <View style={styles.sectionLetterBox}>
                    <Text style={styles.sectionLetterTxt}>{section.section}</Text>
                  </View>
                  <View style={{ flex: 1, paddingRight: 8, minWidth: 0 }}>
                    <Text style={{ fontSize: 10.5, fontFamily: "Helvetica-Bold", marginBottom: 5 }}>
                      {SECTION_TITLES[section.section]}
                    </Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${section.score}%` }]} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", width: 26, textAlign: "right" }}>
                    {section.score}
                  </Text>
                  <View style={{ width: 6 }} />
                  <FitPill fit={section.fit} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <View style={styles.flowRoot}>
          {/* Career fit onward — PDF page 2+ */}
          <View style={{ marginBottom: SECTION_GAP }}>
            <Text style={styles.h3}>Career fit</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "stretch",
                gap: CAREER_COLUMN_GAP,
                width: "100%",
              }}>
              <View style={styles.careerCol}>
                <CareerPdf item={result.careerFit.primary} tier="primary" />
              </View>
              <View style={styles.careerCol}>
                <CareerPdf item={result.careerFit.secondary} tier="secondary" />
              </View>
            </View>
          </View>

          {result.careerFit.rejected.length > 0 ? (
            <View style={{ marginBottom: SECTION_GAP }}>
              <Text style={styles.h3}>Lower-fit paths for now</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: CAREER_COLUMN_GAP,
                }}>
                {result.careerFit.rejected.map((item: RejectedCareer) => (
                  <View key={item.career} style={styles.rejectedCard}>
                    <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold" }}>{item.career}</Text>
                    <Text style={{ fontSize: 10.5, color: C.destructive, marginTop: 4, fontFamily: "Helvetica-Bold" }}>
                      {item.matchPercent}% match
                    </Text>
                    <Text style={{ fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>{item.reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {result.contradictionFlags.length > 0 ? (
            <View style={{ marginBottom: SECTION_GAP }}>
              <Text style={styles.h3}>Contradiction flags</Text>
              {result.contradictionFlags.map((flag, ix) => (
                <View key={ix} style={styles.flagBox}>
                  <Text style={{ fontSize: 10, color: C.muted, lineHeight: 1.45 }}>{flag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.summaryOuter}>
            <Text style={styles.summaryLabel}>AI advisor summary</Text>
            <Text style={styles.summaryBody}>{result.aiSuggestionSummary}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
