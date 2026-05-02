import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AiRisk, CareerFitItem, RejectedCareer, Result } from "@/lib/types";
import { SECTION_TITLES } from "@/lib/sectionTitles";
import { buildTraitDonutSlices } from "@/lib/traitDonutPaths";

const RISK_META: Record<AiRisk, { dot: string; label: string; ring: string }> = {
  safe: { dot: "bg-success", label: "AI-resilient", ring: "border-success/40" },
  "at-risk": { dot: "bg-primary", label: "Watch closely", ring: "border-primary/40" },
  "high-risk": { dot: "bg-destructive", label: "High AI risk", ring: "border-destructive/40" },
};

const RiskPill = ({ risk, label, detail }: { risk: AiRisk; label: string; detail: string }) => {
  const meta = RISK_META[risk];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full border ${meta.ring} cursor-help`}>
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {label || meta.label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{detail}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CareerCard = ({ item, tier }: { item: CareerFitItem; tier: "primary" | "secondary" }) => (
  <div className={`glass-card min-w-0 p-5 border-2 ${tier === "primary" ? "border-primary/60" : "border-muted-foreground/30"}`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {tier === "primary" ? "Primary fit" : "Secondary fit"}
        </p>
        <h4 className="text-lg font-bold mt-1">{item.career}</h4>
        <p className="text-xs text-muted-foreground mt-1">{item.matchPercent}% match</p>
      </div>
      {item.jobRoles[0] ? <RiskPill risk={item.jobRoles[0].aiRisk} label={item.jobRoles[0].riskLabel} detail={item.jobRoles[0].whatAiIsDoing} /> : null}
    </div>
    {(item.ugDegrees.length > 0 || item.pgDegrees.length > 0) && (
      <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
        {item.ugDegrees.length > 0 && (
          <div className="rounded-lg bg-secondary/40 p-2.5">
            <p className="text-muted-foreground">Undergraduate</p>
            <p className="font-medium">{item.ugDegrees.join(", ")}</p>
          </div>
        )}
        {item.pgDegrees.length > 0 && (
          <div className="rounded-lg bg-secondary/40 p-2.5">
            <p className="text-muted-foreground">Postgraduate</p>
            <p className="font-medium">{item.pgDegrees.join(", ")}</p>
          </div>
        )}
      </div>
    )}
    <div className="mt-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Sample roles</p>
      <ul className="text-xs space-y-3">
        {item.jobRoles.map((role) => (
          <li key={role.title} className="rounded-lg bg-secondary/20 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <span className="flex min-w-0 items-center gap-2 font-medium">
                <span className="h-1 w-1 mt-1.5 rounded-full bg-primary" />
                {role.title}
              </span>
              <RiskPill risk={role.aiRisk} label={role.riskLabel} detail={role.whatAiIsDoing} />
            </div>
            <p className="mt-2 text-muted-foreground">
              <span className="font-medium text-foreground/80">What AI is doing:</span> {role.whatAiIsDoing}
            </p>
            <p className="mt-1 text-success">
              <span className="font-medium">What you should do:</span> {role.whatStudentShouldDo}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const RejectedCareerCard = ({ item }: { item: RejectedCareer }) => (
  <div className="glass-card border-l-4 border-l-destructive p-4">
    <p className="text-lg font-bold">{item.career}</p>
    <p className="mt-1 text-sm font-semibold text-destructive">{item.matchPercent}% match</p>
    <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
  </div>
);

const ReadinessBadge = ({ score }: { score: number }) => {
  const tone = score >= 75 ? "bg-success/15 text-success border-success/40"
    : score >= 50 ? "bg-primary/15 text-primary border-primary/40"
      : "bg-destructive/15 text-destructive border-destructive/40";
  const label = score >= 75 ? "Highly future-ready" : score >= 50 ? "Adaptable" : "Needs strengthening";
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 ${tone}`}>
      <span className="text-3xl font-bold">{score}%</span>
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
};

/** Matches default Recharts cell order when exporting from the browser. */
const TRAIT_PIE_FILLS_EXPORT = ["#F5A623", "#FFD666", "#22C55E", "#F5A623"];

function TraitDistributionDonutSvg({
  data,
  colors,
}: {
  data: { name: string; value: number }[];
  colors: string[];
}) {
  const size = 176;
  const paths = buildTraitDonutSlices(data, colors, size);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {paths.map((p) => (
        <path key={p.key} d={p.path} fill={p.fill} stroke="#0f1a42" strokeWidth={2} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

interface Props {
  result: Result;
  /** Legacy PNG export preview (same donut as react-pdf). Kept for optional future use; PDF is vector-only now. */
  forPdfExport?: boolean;
}

const ResultDashboard = ({ result, forPdfExport = false }: Props) => {
  const traitData = Object.entries(result.traitScores).map(([name, value]) => ({ name, value }));
  const colors = forPdfExport
    ? TRAIT_PIE_FILLS_EXPORT
    : ["hsl(var(--primary))", "hsl(var(--primary-glow))", "hsl(var(--success))", "hsl(var(--accent))"];

  return (
    <div className="space-y-8">
      <header className="glass-card p-5 sm:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Readiness Index</p>
          <h2 className="text-2xl font-bold mt-1">{result.userName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ambiguity: {result.behaviourProfile.ambiguity} · Discipline: {result.behaviourProfile.discipline} · Risk appetite: {result.behaviourProfile.riskAppetite}
          </p>
        </div>
        <ReadinessBadge score={result.aiReadinessIndex} />
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {traitData.map((trait) => (
            <div key={trait.name} className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{trait.name}</p>
              <p className="mt-2 text-2xl font-bold gold-text">{trait.value}%</p>
              <div className="mt-2 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div className="h-full btn-gold" style={{ width: `${trait.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Trait distribution</p>
          <div className={`h-44 flex items-center justify-center ${forPdfExport ? "min-h-[176px]" : ""}`}>
            {forPdfExport ? (
              <TraitDistributionDonutSvg data={traitData} colors={colors} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={traitData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {traitData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <RTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3">Section scores</h3>
        <div className="glass-card divide-y divide-border">
          {result.sectionScores.map((section) => {
            const fitTone = section.fit === "Strong" ? "bg-success/15 text-success border-success/40"
              : section.fit === "Moderate" ? "bg-primary/15 text-primary border-primary/40"
                : "bg-destructive/15 text-destructive border-destructive/40";
            return (
              <div key={section.section} className="p-4 flex items-center gap-3 sm:gap-4">
                <span className="h-7 w-7 rounded-lg btn-gold text-xs flex items-center justify-center">{section.section}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{SECTION_TITLES[section.section]}</p>
                  <div className="mt-1.5 h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div className="h-full btn-gold" style={{ width: `${section.score}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold w-10 text-right">{section.score}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fitTone}`}>{section.fit}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3">Career fit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CareerCard item={result.careerFit.primary} tier="primary" />
          <CareerCard item={result.careerFit.secondary} tier="secondary" />
        </div>
      </section>

      {result.careerFit.rejected.length > 0 && (
        <section>
          <h3 className="text-lg font-bold mb-3">Lower-fit paths for now</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.careerFit.rejected.map((item) => <RejectedCareerCard key={item.career} item={item} />)}
          </div>
        </section>
      )}

      {result.contradictionFlags.length > 0 && (
        <section>
          <h3 className="text-lg font-bold mb-3">Contradiction flags</h3>
          <div className="space-y-3">
            {result.contradictionFlags.map((flag, index) => (
              <div key={index} className="rounded-xl border border-destructive/40 border-l-4 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">{flag}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="rounded-2xl border-2 border-primary/50 bg-background/40 p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI advisor summary</p>
          <p className="italic text-base leading-relaxed">{result.aiSuggestionSummary}</p>
        </div>
      </section>
    </div>
  );
};

export default ResultDashboard;
